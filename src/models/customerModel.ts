// src/models/customerModel.ts
import pool from '../config/database';

export interface Customer {
  customer_id: string;
  password: string;
  customer_name: string;
  country: string;
  zip: string;
  city: string;
  state: string;
  address1: string;
  address2: string;
  phone: string;
  email: string;
  
  // Additional fields as needed…
}

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const result = await pool.query('SELECT * FROM customers WHERE customer_id = $1', [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getCustomerByEmail = async (email: string): Promise<Customer | null> => {
  const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const createCustomer = async (customerData: Customer): Promise<Customer> => {
  const {
    customer_id, customer_name, address1, address2, city, state, zip, country, phone, email, password
  } = customerData;

  const result = await pool.query(
    `INSERT INTO customers (customer_id, customer_name, address1, address2, city, state, zip, country, sales_tax_id, phone_number, email, password)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [customer_id, customer_name, address1, address2, city, state, zip, country, "WST", phone, email, password]
  );

  return result.rows[0];  // Return the newly created customer
};

export const updateCustomer = async (id: string, password: string) => {
  const result = await pool.query(
    `UPDATE customers
     SET password = $1
     WHERE customer_id = $2
     RETURNING *`,
    [password, id]
  );

  return result.rows[0];
};
