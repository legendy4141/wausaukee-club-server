import { getCustomerById } from '../models/customerModel'; // Importing the function from customerModel.ts

interface CustomerDetails {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Get customer details based on a given Customer ID
export const getCustomerDetails = async (customerId: string): Promise<CustomerDetails> => {
  const customer = await getCustomerById(customerId);

  if (!customer) {
    throw new Error(`Customer with ID ${customerId} not found.`);
  }

  // Mapping database fields to the CustomerDetails interface
  return {
    customer_id: customer.customer_id,
    first_name: customer.customer_name.split(' ')[0], // Assuming customer_name is a full name
    last_name: customer.customer_name.split(' ')[1] || '', // Assuming customer_name contains both first and last name
    email: customer.email,
  };
};
