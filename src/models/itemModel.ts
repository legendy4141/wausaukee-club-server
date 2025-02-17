// src/models/itemModel.ts
import pool from '../config/database';

export interface Item {
  item_class: string;
  sales_price_1: number;
  gl_sales_account: number;
  item_id: string;
  item_description: string;
  tax_type: number;
}

export const getItemById = async (id: string): Promise<Item | null> => {
  const result = await pool.query('SELECT * FROM items WHERE item_id = $1', [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};
