import { dbConnections } from "../common/interface/db";

// 使用例
const query = `
  SELECT
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
    AND d.del_flg = false
  ORDER BY
    d.dish_id
`;

const params = {
  dishType: 4,
};

dbConnections(query, params);
