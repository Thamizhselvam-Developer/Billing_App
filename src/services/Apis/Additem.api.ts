// itemApi.ts

import { API_URL } from "@env";
import axios from 'axios'
import { AddProduct } from "../../types_interface/itemMaster/itemComponent.type";


export const addNewProduct = async (product: AddProduct) => {
    console.log(product,"PRODUCT",API_URL)
  try {
    const response = await axios.post(`${API_URL}api/items/addItem`, product);
    if(response.data.sucess ==true && response.data.message==='Item processed successfully')
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Failed to add product:', error);
    // throw error;
  }
};
export const updateProduct = async (id: string, data: AddProduct) => {
  console.log(id,data)
  try {
    const response = await axios.patch(`${API_URL}api/item/update/${id}`, data);
    console.log(response,)
    return response.data.data;
  } catch (error) {
    // console.log(error?.response)
    throw error;
  }
};


export const deleteProduct = async (id: string) => {
  try {
    const response = await axios.patch(`${API_URL}api/item/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};