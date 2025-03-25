import pool from "./db";

async function testDB() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database connected! Current time:", res.rows[0].now);
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    pool.end();
  }
}

testDB();
