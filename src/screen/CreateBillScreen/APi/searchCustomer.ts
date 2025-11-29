// APi/searchCustomer.ts
import { API_URL } from "@env";
import axios from "axios";

export interface CustomerSearchResult {
  id: number;
  buyer_name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const searchCustomers = async (
  query: string
): Promise<CustomerSearchResult[]> => {
  if (query.length < 2) return [];

  try {
    const response = await axios.get(
      `${API_URL}search/buyers?query=${encodeURIComponent(query)}`
    );
console.log(response)
    return response.data.data || [];
  } catch (error) {
    console.error("Search customers API error:", error);
    return [];
  }
};
