import { API_URL } from "@env";
import axios from "axios";

export const saveBill=async(payload:any)=>{
try {
    const response = await axios.post(`${API_URL}api/bills/create`,payload);
    return response.data.data;
  } catch (error: any) {
    console.log(error.response)
    console.log('❌ Failed to get product:', error);
    // throw error;
  }
}