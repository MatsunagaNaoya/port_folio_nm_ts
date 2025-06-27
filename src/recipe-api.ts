import dotenv from 'dotenv';
dotenv.config();

import { dbConnect, closeConnection } from '../common/interface/db';

// 材料情報の型定義
interface MaterialInfo {
	material_name: string | null;
	quantity: number | null;
}

// データ型の定義
interface DishData {
	dish_id: number;
	dish_name: string;
	materials: MaterialInfo[];
}

// クエリパラメータの型定義
interface QueryParams {
	dishType: number;
	dishId: number;
}

// パラメータ設定の優先順位: コマンドライン引数 > 環境変数 > デフォルト値
function getQueryParams(): QueryParams {
	// コマンドライン引数から取得
	const args = process.argv.slice(2);
	const argDishType = args.find((arg) => arg.startsWith('--dishType='))?.split('=')[1];
	const argDishId = args.find((arg) => arg.startsWith('--dishId='))?.split('=')[1];

	// 環境変数から取得
	const envDishType = process.env.DISH_TYPE;
	const envDishId = process.env.DISH_ID;

	// デフォルト値
	const defaultParams: QueryParams = {
		dishType: 4,
		dishId: 401,
	};

	// 優先順位に従って値を決定
	const dishType = argDishType || envDishType || defaultParams.dishType;
	const dishId = argDishId || envDishId || defaultParams.dishId;

	return {
		dishType: Number(dishType),
		dishId: Number(dishId),
	};
}

// 新しいテーブル構造を使用したデータ取得関数
async function fetchDishDataNew(params: QueryParams): Promise<DishData[]> {
	const query = `
    SELECT
      d.dish_id,
      d.dish_name,
      t.name AS dish_type_name,
      m.material_name,
      drm.quantity,
      drm.order_num
    FROM
      old_dish_dqx_craftsman d
    JOIN dish_type_dqx t ON d.dish_type = t.dish_type
    LEFT JOIN dish_recipe_materials drm ON d.dish_id = drm.dish_id
    LEFT JOIN dish_material_dqx m ON drm.material_id = m.material_id
    WHERE
      d.dish_type = :dishType
      AND d.dish_id = :dishId
      AND d.del_flg = false
    ORDER BY
      d.dish_id, drm.order_num
  `;

	const rawData = await dbConnect({ sql: query, values: params });

	if (rawData.length === 0) {
		return [];
	}

	// データを整形（料理ごとにグループ化）
	const dishMap = new Map<number, DishData>();

	rawData.forEach((row: any) => {
		const dishId = row.dish_id;

		if (!dishMap.has(dishId)) {
			dishMap.set(dishId, {
				dish_id: dishId,
				dish_name: row.dish_name,
				materials: [],
			});
		}

		const dish = dishMap.get(dishId)!;
		if (row.material_name) {
			dish.materials.push({
				material_name: row.material_name,
				quantity: row.quantity,
			});
		}
	});

	return Array.from(dishMap.values());
}

// 改善されたデータ取得関数（UNION ALL方式）- 旧テーブル使用
async function fetchDishDataImproved(params: QueryParams): Promise<DishData[]> {
	const query = `
    SELECT
      d.dish_id,
      d.dish_name,
      t.name AS dish_type_name,
      m.material_name,
      q.quantity,
      materials.order_num
    FROM
      old_dish_dqx_craftsman d
    JOIN dish_type_dqx t ON d.dish_type = t.dish_type
    LEFT JOIN (
      SELECT dish_id, material_1 AS material_id, quantity_1 AS quantity, 1 AS order_num 
      FROM old_dish_dqx_craftsman 
      WHERE material_1 IS NOT NULL
      UNION ALL
      SELECT dish_id, material_2 AS material_id, quantity_2 AS quantity, 2 AS order_num 
      FROM old_dish_dqx_craftsman 
      WHERE material_2 IS NOT NULL
      UNION ALL
      SELECT dish_id, material_3 AS material_id, quantity_3 AS quantity, 3 AS order_num 
      FROM old_dish_dqx_craftsman 
      WHERE material_3 IS NOT NULL
      UNION ALL
      SELECT dish_id, material_4 AS material_id, quantity_4 AS quantity, 4 AS order_num 
      FROM old_dish_dqx_craftsman 
      WHERE material_4 IS NOT NULL
      UNION ALL
      SELECT dish_id, material_5 AS material_id, quantity_5 AS quantity, 5 AS order_num 
      FROM old_dish_dqx_craftsman 
      WHERE material_5 IS NOT NULL
    ) materials ON d.dish_id = materials.dish_id
    JOIN dish_material_dqx m ON materials.material_id = m.material_id
    JOIN old_dish_quantity_dqx q ON d.dish_id = q.dish_id
    WHERE
      d.dish_type = :dishType
      AND d.dish_id = :dishId
      AND d.del_flg = false
    ORDER BY
      d.dish_id, materials.order_num
  `;

	const rawData = await dbConnect({ sql: query, values: params });

	if (rawData.length === 0) {
		return [];
	}

	// データを整形（料理ごとにグループ化）
	const dishMap = new Map<number, DishData>();

	rawData.forEach((row: any) => {
		const dishId = row.dish_id;

		if (!dishMap.has(dishId)) {
			dishMap.set(dishId, {
				dish_id: dishId,
				dish_name: row.dish_name,
				materials: [],
			});
		}

		const dish = dishMap.get(dishId)!;
		dish.materials.push({
			material_name: row.material_name,
			quantity: row.quantity,
		});
	});

	return Array.from(dishMap.values());
}

// 従来のデータ取得関数（後方互換性のため保持）- 旧テーブル使用
async function fetchDishData(params: QueryParams): Promise<DishData[]> {
	const query = `
    SELECT
      d.dish_id,
      d.dish_name,
      -- 材料1
      COALESCE(m1.material_name, 'なし') AS material_name_1,
      COALESCE(q.quantity_1, 0) AS quantity_1,
      -- 材料2
      COALESCE(m2.material_name, 'なし') AS material_name_2,
      COALESCE(q.quantity_2, 0) AS quantity_2,
      -- 材料3
      COALESCE(m3.material_name, 'なし') AS material_name_3,
      COALESCE(q.quantity_3, 0) AS quantity_3,
      -- 材料4
      COALESCE(m4.material_name, 'なし') AS material_name_4,
      COALESCE(q.quantity_4, 0) AS quantity_4,
      -- 材料5
      COALESCE(m5.material_name, 'なし') AS material_name_5,
      COALESCE(q.quantity_5, 0) AS quantity_5
    FROM
      old_dish_dqx_craftsman d
    LEFT JOIN
      old_dish_quantity_dqx q ON d.dish_id = q.dish_id
    LEFT JOIN
      dish_material_dqx m1 ON d.material_1 = m1.material_id
    LEFT JOIN
      dish_material_dqx m2 ON d.material_2 = m2.material_id
    LEFT JOIN
      dish_material_dqx m3 ON d.material_3 = m3.material_id
    LEFT JOIN
      dish_material_dqx m4 ON d.material_4 = m4.material_id
    LEFT JOIN
      dish_material_dqx m5 ON d.material_5 = m5.material_id
    WHERE
      d.dish_type = :dishType
      AND d.dish_id = :dishId
      AND d.del_flg = false
    ORDER BY
      d.dish_id
  `;

	const rawData = await dbConnect({ sql: query, values: params });

	if (rawData.length === 0) {
		return [];
	}

	// データを整形
	return rawData.map((row: any) => {
		const materials: MaterialInfo[] = [];

		// 材料1～5を配列に格納
		for (let i = 1; i <= 5; i++) {
			const materialName = row[`material_name_${i}`];
			const quantity = row[`quantity_${i}`];

			// 'なし'以外の材料のみを追加
			if (materialName && materialName !== 'なし') {
				materials.push({
					material_name: materialName,
					quantity: quantity,
				});
			}
		}

		return {
			dish_id: row.dish_id,
			dish_name: row.dish_name,
			materials: materials,
		};
	});
}

// データ表示関数（再利用可能）
function displayDishData(data: DishData[]): void {
	if (data.length === 0) {
		console.log('❌ データが見つかりませんでした');
		return;
	}

	console.log('📋 料理データ:');
	data.forEach((dish, index) => {
		console.log(`\n${index + 1}. ${dish.dish_name} (ID: ${dish.dish_id})`);

		if (dish.materials.length === 0) {
			console.log('   材料: なし');
		} else {
			console.log('   材料:');
			dish.materials.forEach((material, materialIndex) => {
				console.log(
					`     ${materialIndex + 1}. ${material.material_name} (${material.quantity}個)`
				);
			});
		}
	});
}

// 新しいテーブル構造を使用した料理と材料の取得
async function getDishesWithMaterials(limit: number): Promise<void> {
	console.log('=== 料理と材料の一覧（新しいテーブル構造） ===\n');

	try {
		// 新しい中間テーブルを使用したクエリ
		const query = `
			SELECT 
				d.dish_id,
				d.dish_name,
				dt.name as dish_type_name,
				STRING_AGG(
					CONCAT(m.material_name, ' (', drm.quantity, '個)'),
					', ' ORDER BY drm.order_num
				) as materials
			FROM old_dish_dqx_craftsman d
			LEFT JOIN dish_type_dqx dt ON d.dish_type = dt.dish_type
			LEFT JOIN dish_recipe_materials drm ON d.dish_id = drm.dish_id
			LEFT JOIN dish_material_dqx m ON drm.material_id = m.material_id
			WHERE d.del_flg = false OR d.del_flg IS NULL
			GROUP BY d.dish_id, d.dish_name, dt.name
			ORDER BY d.dish_id
			LIMIT :limit;
		`;

		const result = await dbConnect({ sql: query, values: { limit } });

		if (result.length === 0) {
			console.log('❌ データが見つかりませんでした');
			return;
		}

		console.log(`📋 料理一覧（上位${result.length}件）:\n`);

		result.forEach((row: any, index: number) => {
			console.log(`${index + 1}. ${row.dish_name} (ID: ${row.dish_id})`);
			console.log(`   種類: ${row.dish_type_name || '未分類'}`);
			console.log(`   材料: ${row.materials || '材料なし'}`);
			console.log('');
		});

		console.log('✅ 新しいテーブル構造でのデータ取得が完了しました');
	} catch (error) {
		console.error('❌ データ取得中にエラーが発生しました:', error);
		throw error;
	}
}

// 材料別の料理検索（新しいテーブル構造）
async function searchDishesByMaterial(materialName: string, limit: number): Promise<void> {
	console.log(`=== 材料「${materialName}」を使用する料理の検索（新しいテーブル構造） ===\n`);

	try {
		const query = `
			SELECT 
				d.dish_id,
				d.dish_name,
				dt.name as dish_type_name,
				drm.quantity,
				STRING_AGG(
					CONCAT(m2.material_name, ' (', drm2.quantity, '個)'),
					', ' ORDER BY drm2.order_num
				) as all_materials
			FROM old_dish_dqx_craftsman d
			LEFT JOIN dish_type_dqx dt ON d.dish_type = dt.dish_type
			INNER JOIN dish_recipe_materials drm ON d.dish_id = drm.dish_id
			INNER JOIN dish_material_dqx m ON drm.material_id = m.material_id
			LEFT JOIN dish_recipe_materials drm2 ON d.dish_id = drm2.dish_id
			LEFT JOIN dish_material_dqx m2 ON drm2.material_id = m2.material_id
			WHERE m.material_name ILIKE :materialName
			AND (d.del_flg = false OR d.del_flg IS NULL)
			GROUP BY d.dish_id, d.dish_name, dt.name, drm.quantity
			ORDER BY d.dish_id
			LIMIT :limit;
		`;

		const result = await dbConnect({
			sql: query,
			values: { materialName: `%${materialName}%`, limit },
		});

		if (result.length === 0) {
			console.log(`❌ 材料「${materialName}」を使用する料理が見つかりませんでした`);
			return;
		}

		console.log(`🔍 検索結果（${result.length}件）:\n`);

		result.forEach((row: any, index: number) => {
			console.log(`${index + 1}. ${row.dish_name} (ID: ${row.dish_id})`);
			console.log(`   種類: ${row.dish_type_name || '未分類'}`);
			console.log(`   使用量: ${row.quantity}個`);
			console.log(`   全材料: ${row.all_materials}`);
			console.log('');
		});

		console.log('✅ 材料検索が完了しました');
	} catch (error) {
		console.error('❌ 材料検索中にエラーが発生しました:', error);
		throw error;
	}
}

// 料理タイプ別の統計（新しいテーブル構造）
async function getDishTypeStatistics(): Promise<void> {
	console.log('=== 料理タイプ別の統計（新しいテーブル構造） ===\n');

	try {
		const query = `
			SELECT 
				dt.name as dish_type_name,
				COUNT(DISTINCT d.dish_id) as dish_count,
				COUNT(drm.material_id) as total_materials,
				AVG(drm.quantity) as avg_quantity
			FROM old_dish_dqx_craftsman d
			LEFT JOIN dish_type_dqx dt ON d.dish_type = dt.dish_type
			LEFT JOIN dish_recipe_materials drm ON d.dish_id = drm.dish_id
			WHERE (d.del_flg = false OR d.del_flg IS NULL)
			GROUP BY dt.name, dt.dish_type
			ORDER BY dish_count DESC;
		`;

		const result = await dbConnect({ sql: query, values: {} });

		if (result.length === 0) {
			console.log('❌ 統計データが見つかりませんでした');
			return;
		}

		console.log('📊 料理タイプ別統計:\n');

		result.forEach((row: any, index: number) => {
			const avgQuantity =
				row.avg_quantity !== null && row.avg_quantity !== undefined
					? Number(row.avg_quantity).toFixed(1)
					: '0';

			console.log(`${index + 1}. ${row.dish_type_name || '未分類'}`);
			console.log(`   料理数: ${row.dish_count}件`);
			console.log(`   総材料数: ${row.total_materials}個`);
			console.log(`   平均使用量: ${avgQuantity}個`);
			console.log('');
		});

		console.log('✅ 統計情報の取得が完了しました');
	} catch (error) {
		console.error('❌ 統計取得中にエラーが発生しました:', error);
		throw error;
	}
}

// メイン実行関数
async function main(): Promise<void> {
	const params = getQueryParams();

	console.log('🚀 TypeScript PostgreSQL アプリケーション開始');
	console.log('📋 パラメータ情報:');
	console.log(`  料理タイプ: ${params.dishType}`);
	console.log(`  料理ID: ${params.dishId}`);
	console.log('');

	try {
		// 1. 新しいテーブル構造でのデータ取得
		console.log('=== 新しいテーブル構造でのデータ取得 ===');
		const newData = await fetchDishDataNew(params);
		displayDishData(newData);
		console.log('');

		// 2. 基本的な料理と材料の一覧
		await getDishesWithMaterials(10);
		console.log('');

		// 3. 材料検索の例
		await searchDishesByMaterial('肉', 5);
		console.log('');

		// 4. 料理タイプ別の統計
		await getDishTypeStatistics();
	} catch (error) {
		console.error('❌ アプリケーション実行中にエラーが発生しました:', error);
		process.exit(1);
	} finally {
		await closeConnection();
		console.log('\n👋 アプリケーション終了');
	}
}

// エクスポート関数（後方互換性のため）
export async function getDishData(dishType: number, dishId: number): Promise<DishData[]> {
	const params: QueryParams = { dishType, dishId };
	return await fetchDishDataNew(params);
}

// アプリケーション実行
if (require.main === module) {
	main().catch((error) => {
		console.error('❌ アプリケーション実行中にエラーが発生しました:', error);
		process.exit(1);
	});
}

export {
	fetchDishDataNew,
	fetchDishDataImproved,
	fetchDishData,
	getDishesWithMaterials,
	searchDishesByMaterial,
	getDishTypeStatistics,
	main,
};
