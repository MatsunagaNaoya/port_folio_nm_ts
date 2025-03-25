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
// パスワードが読み込まれなかったため、確認用に追加
// console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

export default pool;
