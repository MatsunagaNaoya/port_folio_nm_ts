import pool from "../common/interface/db";
import { DBConnection } from "../common/interface/db";

// 名前付きパラメータを `?` や `$1` に変換する関数
function transformNamedParams(query: string, params: { [key: string]: any }) {
  const values: any[] = [];
  let index = 1;

  const transformedQuery = query.replace(/:(\w+)/g, (_, paramName) => {
  console.log(`Found param: ${paramName}`); // デバッグ用
    if (params[paramName] === undefined) {
      throw new Error(`Missing parameter: ${paramName}`);
    }
    values.push(params[paramName]); // 値を配列に追加
    return `$${index++}`; // `$1`, `$2`, ... に変換
  });

  return { transformedQuery, values };
}

// 汎用的なデータ取得関数
async function dbConnect(options: DBConnection) {
    try {
    // 名前付きパラメータを `$1`, `$2` に変換
    const { transformedQuery, values } = transformNamedParams(
      options.sql,
      options.values as { [key: string]: any } // ここでは `values` をオブジェクトとして渡す
    );

    console.log("SQL:", transformedQuery); // デバッグ用
    console.log("Values:", values); // デバッグ用

    const result = await pool.query(transformedQuery, values);
      return result.rows;
    } catch (err) {
      console.error("Error fetching data:", err);
      throw err;
    }
  }
  
export default dbConnect;

// 実行部分

  const query = `
  SELECT
    d.dish_id,
    d.dish_name,
    m1.material_name AS material_name_1,
    q.quantity_1,
    m2.material_name AS material_name_2,
    q.quantity_2
  FROM
    dish_dqx_craftsman d
  LEFT JOIN
    dish_quantity_dqx q ON d.dish_id = q.dish_id
  LEFT JOIN
    dish_material_dqx m1 ON d.material_1 = m1.material_id
  LEFT JOIN
    dish_material_dqx m2 ON d.material_2 = m2.material_id
  WHERE
    d.dish_type = :dishType
    AND d.dish_id = :dishId
    AND d.del_flg = false
  ORDER BY
    d.dish_id
`;

const params = {
  dishType: 4,
    dishId: 401,
};

(async () => {const data = await dbConnect({ sql: query, values: params });
console.log("Fetched data:", data);
})();
