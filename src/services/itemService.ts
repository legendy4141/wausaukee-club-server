import { getItemById } from '../models/itemModel'; // Importing the function from itemModel.ts

interface ItemDetails {
  item_id: string;
  gl_account: number;
  unit_price: number;
  tax_type: number;
  description: string;
}

// Get item details based on a given Item ID
export const getItemDetails = async (itemId: string): Promise<ItemDetails> => {
  const item = await getItemById(itemId);

  if (!item) {
    throw new Error(`Item with ID ${itemId} not found.`);
  }

  return {
    item_id: item.item_id,
    description: item.item_description,
    gl_account: item.gl_sales_account,
    tax_type: item.tax_type,
    unit_price: item.sales_price_1,
  };
};
