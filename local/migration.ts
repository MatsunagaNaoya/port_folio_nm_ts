import { dbConnect, closeConnection } from '../common/interface/db';

// マイグレーション実行関数
async function runMigration(): Promise<void> {
	console.log('=== DBテーブル改善マイグレーション開始 ===\n');

	try {
		// 1. 新しい中間テーブルの作成
		console.log('1. 新しい中間テーブルを作成中...');
		const createTableQuery = `
			CREATE TABLE IF NOT EXISTS dish_recipe_materials_new (
				id SERIAL PRIMARY KEY,
				dish_id INTEGER NOT NULL,
				material_id INTEGER NOT NULL,
				quantity INTEGER NOT NULL DEFAULT 1,
				order_num INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (dish_id) REFERENCES dish_dqx_craftsman(dish_id),
				FOREIGN KEY (material_id) REFERENCES dish_material_dqx(material_id),
				UNIQUE(dish_id, material_id, order_num)
			);
		`;
		await dbConnect({ sql: createTableQuery, values: {} });
		console.log('✅ 中間テーブル作成完了\n');

		// 2. 既存データの移行
		console.log('2. 既存データを移行中...');

		// material_1の移行
		const migrateMaterial1Query = `
			INSERT INTO dish_recipe_materials_new (dish_id, material_id, quantity, order_num)
			SELECT 
				d.dish_id,
				d.material_1,
				q.quantity_1,
				1
			FROM dish_dqx_craftsman d
			JOIN dish_quantity_dqx q ON d.dish_id = q.dish_id
			WHERE d.material_1 IS NOT NULL
			ON CONFLICT (dish_id, material_id, order_num) DO NOTHING;
		`;
		await dbConnect({ sql: migrateMaterial1Query, values: {} });

		// material_2の移行
		const migrateMaterial2Query = `
			INSERT INTO dish_recipe_materials_new (dish_id, material_id, quantity, order_num)
			SELECT 
				d.dish_id,
				d.material_2,
				q.quantity_2,
				2
			FROM dish_dqx_craftsman d
			JOIN dish_quantity_dqx q ON d.dish_id = q.dish_id
			WHERE d.material_2 IS NOT NULL
			ON CONFLICT (dish_id, material_id, order_num) DO NOTHING;
		`;
		await dbConnect({ sql: migrateMaterial2Query, values: {} });

		// material_3の移行
		const migrateMaterial3Query = `
			INSERT INTO dish_recipe_materials_new (dish_id, material_id, quantity, order_num)
			SELECT 
				d.dish_id,
				d.material_3,
				q.quantity_3,
				3
			FROM dish_dqx_craftsman d
			JOIN dish_quantity_dqx q ON d.dish_id = q.dish_id
			WHERE d.material_3 IS NOT NULL
			ON CONFLICT (dish_id, material_id, order_num) DO NOTHING;
		`;
		await dbConnect({ sql: migrateMaterial3Query, values: {} });

		// material_4の移行
		const migrateMaterial4Query = `
			INSERT INTO dish_recipe_materials_new (dish_id, material_id, quantity, order_num)
			SELECT 
				d.dish_id,
				d.material_4,
				q.quantity_4,
				4
			FROM dish_dqx_craftsman d
			JOIN dish_quantity_dqx q ON d.dish_id = q.dish_id
			WHERE d.material_4 IS NOT NULL
			ON CONFLICT (dish_id, material_id, order_num) DO NOTHING;
		`;
		await dbConnect({ sql: migrateMaterial4Query, values: {} });

		// material_5の移行
		const migrateMaterial5Query = `
			INSERT INTO dish_recipe_materials_new (dish_id, material_id, quantity, order_num)
			SELECT 
				d.dish_id,
				d.material_5,
				q.quantity_5,
				5
			FROM dish_dqx_craftsman d
			JOIN dish_quantity_dqx q ON d.dish_id = q.dish_id
			WHERE d.material_5 IS NOT NULL
			ON CONFLICT (dish_id, material_id, order_num) DO NOTHING;
		`;
		await dbConnect({ sql: migrateMaterial5Query, values: {} });

		console.log('✅ データ移行完了\n');

		// 3. 移行結果の確認
		console.log('3. 移行結果を確認中...');
		const checkQuery = `
			SELECT 
				COUNT(*) as total_records,
				COUNT(DISTINCT dish_id) as unique_dishes
			FROM dish_recipe_materials_new;
		`;
		const checkResult = await dbConnect({ sql: checkQuery, values: {} });
		console.log('移行結果:', checkResult[0]);
		console.log('✅ 移行確認完了\n');

		// 4. サンプルデータの表示
		console.log('4. サンプルデータを表示...');
		const sampleQuery = `
			SELECT 
				d.dish_id,
				d.dish_name,
				m.material_name,
				drm.quantity,
				drm.order_num
			FROM dish_recipe_materials_new drm
			JOIN dish_dqx_craftsman d ON drm.dish_id = d.dish_id
			JOIN dish_material_dqx m ON drm.material_id = m.material_id
			ORDER BY d.dish_id, drm.order_num
			LIMIT 10;
		`;
		const sampleData = await dbConnect({ sql: sampleQuery, values: {} });

		console.log('サンプルデータ:');
		sampleData.forEach((row: any, index: number) => {
			console.log(
				`  ${index + 1}. 料理ID: ${row.dish_id}, 料理名: ${row.dish_name}, 材料: ${
					row.material_name
				}, 個数: ${row.quantity}, 順序: ${row.order_num}`
			);
		});

		console.log('\n=== マイグレーション完了 ===');
		console.log('✅ 新しいテーブル dish_recipe_materials_new が作成されました');
		console.log('✅ 既存データが安全に移行されました');
		console.log('⚠️  元のテーブルはそのまま残っています');
		console.log('\n次のステップ:');
		console.log('1. 新しいテーブルでテスト実行');
		console.log('2. 問題なければ元のテーブルを削除');
		console.log('3. 新しいテーブル名を dish_recipe_materials にリネーム');
	} catch (error) {
		console.error('❌ マイグレーション中にエラーが発生しました:', error);
		throw error;
	} finally {
		await closeConnection();
	}
}

// テーブル名変更の後処理関数
async function finalizeMigration(): Promise<void> {
	console.log('=== テーブル名変更の後処理開始 ===\n');

	try {
		// 1. 元のテーブル名を変更（old_プレフィックス追加）
		console.log('1. 元のテーブル名を変更中...');

		const renameCraftsmanQuery = `ALTER TABLE dish_dqx_craftsman RENAME TO old_dish_dqx_craftsman;`;
		await dbConnect({ sql: renameCraftsmanQuery, values: {} });
		console.log('✅ dish_dqx_craftsman → old_dish_dqx_craftsman');

		const renameQuantityQuery = `ALTER TABLE dish_quantity_dqx RENAME TO old_dish_quantity_dqx;`;
		await dbConnect({ sql: renameQuantityQuery, values: {} });
		console.log('✅ dish_quantity_dqx → old_dish_quantity_dqx');

		// 2. 新しいテーブル名を正式名称に変更
		console.log('\n2. 新しいテーブル名を正式名称に変更中...');

		const renameNewTableQuery = `ALTER TABLE dish_recipe_materials_new RENAME TO dish_recipe_materials;`;
		await dbConnect({ sql: renameNewTableQuery, values: {} });
		console.log('✅ dish_recipe_materials_new → dish_recipe_materials');

		// 3. テーブル一覧の確認
		console.log('\n3. 現在のテーブル一覧を確認中...');
		const tablesQuery = `
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_type = 'BASE TABLE'
			AND table_name LIKE '%dish%'
			ORDER BY table_name;
		`;
		const tables = await dbConnect({ sql: tablesQuery, values: {} });

		console.log('現在のテーブル一覧:');
		tables.forEach((table: any) => {
			console.log(`  - ${table.table_name}`);
		});

		console.log('\n=== 後処理完了 ===');
		console.log('✅ 元のテーブルは old_ プレフィックス付きで保持されています');
		console.log('✅ 新しいテーブルは dish_recipe_materials として正式名称になりました');
		console.log('✅ 安全にテーブル名の変更が完了しました');
	} catch (error) {
		console.error('❌ 後処理中にエラーが発生しました:', error);
		throw error;
	} finally {
		await closeConnection();
	}
}

// ロールバック関数（必要に応じて）
async function rollbackMigration(): Promise<void> {
	console.log('=== ロールバック開始 ===');

	try {
		const dropTableQuery = `DROP TABLE IF EXISTS dish_recipe_materials_new;`;
		await dbConnect({ sql: dropTableQuery, values: {} });
		console.log('✅ ロールバック完了: dish_recipe_materials_new テーブルを削除しました');
	} catch (error) {
		console.error('❌ ロールバック中にエラーが発生しました:', error);
		throw error;
	} finally {
		await closeConnection();
	}
}

// 実行
if (require.main === module) {
	const args = process.argv.slice(2);

	if (args.includes('--rollback')) {
		rollbackMigration().catch((error) => {
			console.error('ロールバック実行中にエラーが発生しました:', error);
			process.exit(1);
		});
	} else if (args.includes('--finalize')) {
		finalizeMigration().catch((error) => {
			console.error('後処理実行中にエラーが発生しました:', error);
			process.exit(1);
		});
	} else {
		runMigration().catch((error) => {
			console.error('マイグレーション実行中にエラーが発生しました:', error);
			process.exit(1);
		});
	}
}

export { runMigration, finalizeMigration, rollbackMigration };
