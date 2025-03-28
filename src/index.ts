import pool from "../common/interface/db";
import pgPromise from "pg-promise";
import { DBConnection } from "../common/interface/db";
const dish_type = 4;
// // 接続テスト用の関数
// async function testDB() {
//   try {
//     const res = await pool.query("SELECT NOW()");
//     console.log("Database connected! Current time:", res.rows[0].now);
//   } catch (error) {
//     console.error("Database connection error:", error);
//   } finally {
//     pool.end();
//   }
// }

// testDB();

// 汎用的なデータ取得関数
async function fetchDataByQuery(options: DBConnection) {
    try {
      const result = await pool.query(options.sql, options.values || []);
      return result.rows;
    } catch (err) {
      console.error("Error fetching data:", err);
      throw err;
    }
  }
  
  export default fetchDataByQuery;

  // データを取得する関数（動的な条件対応）
async function fetchData() {
    try {
    // SQLクエリ（WHERE 条件を動的に変更可能）
    const sql = `
        SELECT
            d.dish_name,    --調理名
            m1.material_name AS material_name_1,    --素材名1
            q.quantity_1,                           --素材名1の個数
            m2.material_name AS material_name_2,    --素材名2
            q.quantity_2,                           --素材名2の個数
            m3.material_name AS material_name_3,
            q.quantity_3,
            m4.material_name AS material_name_4,
            q.quantity_4,
            m5.material_name AS material_name_5,
            q.quantity_5
        FROM
            dish_dqx_craftsman d -- 調理職人の大元テーブル。
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
            d.dish_type = 4
            and d.del_flg = false
        ORDER BY
            d.dish_id
        `
        ;
    const result = await pool.query(sql);
    console.log('Fetched data:', result.rows);  // 取得したデータを表示
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

// データを挿入する関数（仮記述）
async function insertData(name: string, age: number) {
  try {
    const query = 'INSERT INTO your_table_name (name, age) VALUES ($1, $2)';
    const values = [name, age];
    await pool.query(query, values);
    console.log('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
  }
}

// データベース接続を閉じる関数
async function closeConnection() {
  try {
    await pool.end();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing connection:', err);
  }
}

// 実行部分
(async () => {
    await fetchDataByQuery();
    // await fetchData(); // データ取得
//   await insertData('John Doe', 30); // データ挿入
//   await fetchData(); // 挿入後に再度データ取得
  await closeConnection(); // 接続終了
})();
