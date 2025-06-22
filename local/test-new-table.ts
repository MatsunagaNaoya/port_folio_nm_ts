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

// 新しいテーブルを使ったデータ取得関数
async function fetchDishDataWithNewTable(params: QueryParams): Promise<DishData[]> {
	const query = `
    SELECT
      d.dish_id,
      d.dish_name,
      t.name AS dish_type_name,
      m.material_name,
      drm.quantity,
      drm.order_num
    FROM
      dish_dqx_craftsman d
    JOIN dish_type_dqx t ON d.dish_type = t.dish_type
    JOIN dish_recipe_materials_new drm ON d.dish_id = drm.dish_id
    JOIN dish_material_dqx m ON drm.material_id = m.material_id
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
		dish.materials.push({
			material_name: row.material_name,
			quantity: row.quantity,
		});
	});

	return Array.from(dishMap.values());
}

// 従来のテーブルを使ったデータ取得関数（比較用）
async function fetchDishDataWithOldTable(params: QueryParams): Promise<DishData[]> {
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
      dish_dqx_craftsman d
    LEFT JOIN
      dish_quantity_dqx q ON d.dish_id = q.dish_id
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

// データ表示関数
function displayDishData(data: DishData[], title: string): void {
	console.log(`\n=== ${title} ===`);

	if (data.length === 0) {
		console.log('データが見つかりませんでした。');
		return;
	}

	data.forEach((dish, index) => {
		console.log(`\n料理 ${index + 1}:`);
		console.log(`  ID: ${dish.dish_id}`);
		console.log(`  名前: ${dish.dish_name}`);

		if (dish.materials.length === 0) {
			console.log(`  材料: なし`);
		} else {
			console.log(`  材料:`);
			dish.materials.forEach((material, materialIndex) => {
				console.log(`    ${materialIndex + 1}. ${material.material_name} (${material.quantity})`);
			});
		}
	});
}

// データ比較関数
function compareResults(newData: DishData[], oldData: DishData[]): boolean {
	if (newData.length !== oldData.length) {
		console.log(
			`❌ 料理数が異なります: 新テーブル=${newData.length}, 旧テーブル=${oldData.length}`
		);
		return false;
	}

	for (let i = 0; i < newData.length; i++) {
		const newDish = newData[i];
		const oldDish = oldData[i];

		if (newDish.dish_id !== oldDish.dish_id) {
			console.log(
				`❌ 料理IDが異なります: 新テーブル=${newDish.dish_id}, 旧テーブル=${oldDish.dish_id}`
			);
			return false;
		}

		if (newDish.materials.length !== oldDish.materials.length) {
			console.log(
				`❌ 料理ID ${newDish.dish_id} の材料数が異なります: 新テーブル=${newDish.materials.length}, 旧テーブル=${oldDish.materials.length}`
			);
			return false;
		}

		for (let j = 0; j < newDish.materials.length; j++) {
			const newMaterial = newDish.materials[j];
			const oldMaterial = oldDish.materials[j];

			if (
				newMaterial.material_name !== oldMaterial.material_name ||
				newMaterial.quantity !== oldMaterial.quantity
			) {
				console.log(`❌ 料理ID ${newDish.dish_id} の材料 ${j + 1} が異なります:`);
				console.log(`   新テーブル: ${newMaterial.material_name} (${newMaterial.quantity})`);
				console.log(`   旧テーブル: ${oldMaterial.material_name} (${oldMaterial.quantity})`);
				return false;
			}
		}
	}

	return true;
}

// メイン実行関数
async function main(): Promise<void> {
	const params: QueryParams = {
		dishType: 4,
		dishId: 401,
	};

	console.log('=== 新テーブル vs 旧テーブル 比較テスト ===');
	console.log(`パラメータ: dishType=${params.dishType}, dishId=${params.dishId}\n`);

	try {
		// 新テーブルでデータ取得
		console.log('新テーブルでデータ取得中...');
		const newData = await fetchDishDataWithNewTable(params);
		displayDishData(newData, '新テーブル（dish_recipe_materials_new）での結果');

		// 旧テーブルでデータ取得
		console.log('\n旧テーブルでデータ取得中...');
		const oldData = await fetchDishDataWithOldTable(params);
		displayDishData(oldData, '旧テーブル（列管理）での結果');

		// 結果比較
		console.log('\n=== 比較結果 ===');
		const isMatch = compareResults(newData, oldData);

		if (isMatch) {
			console.log('✅ 新テーブルと旧テーブルの結果が一致しました！');
			console.log('✅ マイグレーションは成功しています。');
		} else {
			console.log('❌ 新テーブルと旧テーブルの結果が異なります。');
			console.log('❌ マイグレーションを確認してください。');
		}
	} catch (error) {
		console.error('テスト実行中にエラーが発生しました:', error);
	} finally {
		await closeConnection();
	}
}

// アプリケーション実行
if (require.main === module) {
	main().catch((error) => {
		console.error('アプリケーション実行中にエラーが発生しました:', error);
		process.exit(1);
	});
}

export { fetchDishDataWithNewTable, fetchDishDataWithOldTable, compareResults };
