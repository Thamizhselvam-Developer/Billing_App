import { API_URL } from "@env";
import axios from "axios";

export const getNextInvoice = async (): Promise<string | null> => {
  try {
    const response = await axios.get(
     `${API_URL}api/bills/next-invoice`)
    return response.data.invoice_number;
  } catch (error: any) {
    console.error('Error fetching next invoice:', error.message || error);
    return null; // return null on failure
  }
};