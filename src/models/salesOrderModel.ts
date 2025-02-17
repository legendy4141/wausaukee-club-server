// src/models/salesOrderModel.ts
import pool from '../config/database';

export interface SalesOrder {
  customer_id: string;
  sales_order_proposal_no: string;
  order_date: Date;
  ship_by: Date;
  displayed_terms: string;
  receive_account: string;
  sales_tax_id: string;
  quantity: number;
  description: string;
  gl_account: number;
  unit_price: number;
  amount: number;
  job_id: number;
}

// export const insertSalesOrder = async (order: SalesOrder): Promise<SalesOrder> => {
//   const query = `
//     INSERT INTO sales_order (
//       customer_id,
//       sales_order_proposal_no,
//       order_date,
//       ship_by_date,
//       proposal,
//       proposal_accepted,
//       closed,
//       quote_number,
//       drop_ship,
//       ship_to_name,
//       ship_to_address_line_1,
//       ship_to_address_line_2,
//       ship_to_city,
//       ship_to_state,
//       ship_to_zip,
//       ship_to_country,
//       customer_po,
//       ship_via,
//       discount,
//       displayed_terms,
//       sales_rep_id,
//       accounts_receivable_account,
//       sales_tax,
//       invoice_note,
//       note_prints_after_line_items,
//       statement_note,
//       stmt_note_prints_before_ref,
//       internal_note,
//       number_of_distributions,
//       so_proposal_distribution,
//       quantity,
//       item_id,
//       description,
//       gl_account,
//       unit_price,
//       tax_type,
//       upc_sku,
//       weight,
//       amount,
//       job_id,
//       sales_tax_agency_id
//     ) VALUES (
//       $1, $2, $3, $4, $5, $6, $7,
//       $8, $9, $10, $11, $12, $13, $14, $15, $16,
//       $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
//       $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40
//     )
//     RETURNING *;
//   `;
//   const values = [
//     order.customer_id,
//     order.sales_order_proposal_no,
//     order.order_date,
//     order.ship_by,
//     order.proposal,
//     order.proposal_accepted,
//     order.closed,
//     order.quote_no || null,
//     order.drop_ship,
//     order.ship_to_name || null,
//     order.ship_to_address_line_one || null,
//     order.ship_to_address_line_two || null,
//     order.ship_to_city || null,
//     order.ship_to_state || null,
//     order.ship_to_zipcode || null,
//     order.ship_to_country || null,
//     order.customer_po || null,
//     order.ship_via || null,
//     order.discount_amount,
//     order.displayed_terms || 'Net 15th of Next Month', // Default value
//     order.sales_representative_id || null,
//     order.accounts_receivable_account || '107', // Default to '107'
//     order.sales_tax_id || 'WST',
//     order.invoice_note || null,
//     order.note_prints_after_line_items || null,
//     order.statement_note || null,
//     order.stmt_note_prints_before_ref || null,
//     order.internal_note || null,
//     order.number_of_distributions,
//     order.so_proposal_distribution,
//     order.quantity,
//     order.item_id,
//     order.description || null,
//     order.gl_account || null,
//     order.unit_price,
//     order.tax_type || null,
//     order.upc_sku || null,
//     order.weight || null,
//     order.amount,
//     order.job_id || null,
//     order.sales_tax_agency_id || null,
//   ];

//   const result = await pool.query(query, values);
//   return result.rows[0];
// };
