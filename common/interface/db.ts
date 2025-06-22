import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 環境変数の型定義
interface DatabaseConfig {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

// 環境変数の検証
const validateEnvVars = (): DatabaseConfig => {
	const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
	const missingVars = requiredVars.filter((varName) => !process.env[varName]);

	if (missingVars.length > 0) {
		throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
	}

	return {
		host: process.env.DB_HOST!,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER!,
		password: process.env.DB_PASSWORD!,
		database: process.env.DB_NAME!,
	};
};

const config = validateEnvVars();

const pool = new Pool(config);

// DB接続情報インタフェース
export interface DBConnection {
	sql: string;
	values?: { [key: string]: any };
}

// 名前付きパラメータを$1, $2, ... の形式に変換する関数
function transformNamedParams(
	query: string,
	params: { [key: string]: any }
): { transformedQuery: string; values: any[] } {
	const values: any[] = [];
	let index = 1;

	const transformedQuery = query.replace(/:(\w+)/g, (_, paramName) => {
		if (params[paramName] === undefined) {
			throw new Error(`Missing parameter: ${paramName}`);
		}
		values.push(params[paramName]);
		return `$${index++}`;
	});

	return { transformedQuery, values };
}

// 汎用的なデータ取得関数
export async function dbConnect(options: DBConnection): Promise<any[]> {
	try {
		const { transformedQuery, values } = transformNamedParams(options.sql, options.values || {});

		const result: QueryResult = await pool.query(transformedQuery, values);
		return result.rows;
	} catch (err) {
		console.error('Error fetching data:', err);
		throw err;
	}
}

// データベース接続を閉じる関数
export async function closeConnection(): Promise<void> {
	try {
		await pool.end();
		console.log('Database connection closed');
	} catch (err) {
		console.error('Error closing connection:', err);
		throw err;
	}
}

// DB接続プールを他のファイルでも使用できるようにexport
export default pool;
