// itemApi.ts

import { API_URL } from "@env";
import axios from 'axios'
import { AddProduct } from "../../types_interface/itemMaster/itemComponent.type";


export const addNewProduct = async (product: AddProduct) => {
    console.log(product,"PRODUCT",API_URL)
  try {
    const response = await axios.post(`${API_URL}api/items/addItem`, product);
    console.log('✅ Product added:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to add product:', error);
    throw error;
  }
};
