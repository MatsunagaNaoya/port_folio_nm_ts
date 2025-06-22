import { dbConnect, closeConnection } from '../common/interface/db';

// テーブル情報を取得する関数
async function getTableInfo(): Promise<void> {
	try {
		// テーブル一覧を取得
		const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

		const tables = await dbConnect({ sql: tablesQuery, values: {} });
		console.log('=== テーブル一覧 ===');
		tables.forEach((table: any) => {
			console.log(`- ${table.table_name}`);
		});

		// 各テーブルの詳細情報を取得
		for (const table of tables) {
			const tableName = table.table_name;
			console.log(`\n=== ${tableName} の構造 ===`);

			const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = :tableName
        ORDER BY ordinal_position
      `;

			const columns = await dbConnect({
				sql: columnsQuery,
				values: { tableName },
			});

			columns.forEach((col: any) => {
				const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
				const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
				console.log(`  ${col.column_name}: ${col.data_type} ${nullable}${defaultValue}`);
			});

			// サンプルデータを取得（最初の3行）
			const sampleQuery = `SELECT * FROM ${tableName} LIMIT 3`;
			const sampleData = await dbConnect({ sql: sampleQuery, values: {} });

			if (sampleData.length > 0) {
				console.log(`\n  サンプルデータ:`);
				sampleData.forEach((row: any, index: number) => {
					console.log(`    ${index + 1}:`, row);
				});
			}
		}
	} catch (error) {
		console.error('テーブル情報取得中にエラーが発生しました:', error);
	} finally {
		await closeConnection();
	}
}

// 実行
if (require.main === module) {
	getTableInfo().catch((error) => {
		console.error('アプリケーション実行中にエラーが発生しました:', error);
		process.exit(1);
	});
}

export { getTableInfo };
