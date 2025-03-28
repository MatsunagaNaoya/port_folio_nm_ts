import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// DB接続情報インタフェース
export interface DBConnection {
    sql: string;
    values?: any[] | { [key: string]: any }; // オブジェクトも許可。クエリパラメータが必要な場合に配列として渡す
  }

// 名前付きパラメータを$1, $2, ... の形式に変換する関数
export async function dbConnections(query: string, params: { [key: string]: any }) {
  try {
    // 名前付きパラメータを$1, $2, ... の形式に変換
    let index = 1;
    const transformedQuery = query.replace(/:(\w+)/g, (_, paramName) => {
      const paramValue = params[paramName];
      if (paramValue === undefined) {
        throw new Error(`Missing parameter: ${paramName}`);
      }
      return `$${index++}`;
    });

    // クエリ実行
    const result = await pool.query(transformedQuery, Object.values(params));
    console.log('Fetched data:', result.rows);  // 取得したデータを表示
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    closeConnection();
  }
}

// データベース接続を閉じる関数
// アプリケーション終了時に呼び出す
export function closeConnection() {
    try {
      pool.end();
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing connection:', err);
    }
  }
  
// DB接続プールを他のファイルでも使用できるようにexport
export default pool;
