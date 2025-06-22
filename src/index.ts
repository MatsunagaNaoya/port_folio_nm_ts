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

// データ取得関数（再利用可能）
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

// データ表示関数（再利用可能）
function displayDishData(data: DishData[]): void {
	if (data.length === 0) {
		console.log('データが見つかりませんでした。');
		return;
	}

	console.log('取得したデータ:');
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

// メイン実行関数
async function main(): Promise<void> {
	const params = getQueryParams();

	console.log(`パラメータ設定:`);
	console.log(`  dishType: ${params.dishType}`);
	console.log(`  dishId: ${params.dishId}`);
	console.log('');

	try {
		const data = await fetchDishData(params);
		displayDishData(data);
	} catch (error) {
		console.error('データ取得中にエラーが発生しました:', error);
	} finally {
		await closeConnection();
	}
}

// フロントエンド用のAPI関数
export async function getDishData(dishType: number, dishId: number): Promise<DishData[]> {
	const params: QueryParams = { dishType, dishId };
	return await fetchDishData(params);
}

// アプリケーション実行
if (require.main === module) {
	main().catch((error) => {
		console.error('アプリケーション実行中にエラーが発生しました:', error);
		process.exit(1);
	});
}

export { main, DishData, QueryParams, MaterialInfo, fetchDishData, displayDishData };
