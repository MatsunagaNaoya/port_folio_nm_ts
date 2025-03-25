import pool from "./db";

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


// データを取得する関数
async function fetchData() {
  try {
    // データベース接続
    const result = await pool.query('SELECT * FROM dish_dqx_craftsman');
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
  await fetchData(); // データ取得
//   await insertData('John Doe', 30); // データ挿入
//   await fetchData(); // 挿入後に再度データ取得
  await closeConnection(); // 接続終了
})();
