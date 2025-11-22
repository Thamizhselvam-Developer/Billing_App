import { API_URL } from "@env";
import axios from "axios";

export const getNextInvoice = async () => {
  try {
    const response = await axios.get(
     `${API_URL}api/bills/next-invoice`)
     console.log(response)
    return response.data.invoice_number;
  } catch (error: any) {
    console.log(error.response,"ERR")
    console.error('Error fetching next invoice:', error.message || error);
    return null; // return null on failure
  }
};