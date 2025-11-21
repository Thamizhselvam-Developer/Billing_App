// itemApi.ts

import { API_URL } from "@env";
import axios from 'axios'
import { AddProduct } from "../../types_interface/itemMaster/itemComponent.type";


export const getProduct = async () => {

  try {
    const response = await axios.get(`${API_URL}api/get_items`);
    console.log(response)
    return response.data.data;
  } catch (error: any) {
    console.log(error.response)
    console.log('❌ Failed to get product:', error);
    // throw error;
  }
};
