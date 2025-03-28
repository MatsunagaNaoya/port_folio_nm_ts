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
  values?: any[]; // クエリパラメータが必要な場合に配列として渡す
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
