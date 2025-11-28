import axios from "axios";


interface CustomerSearchResult {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export const searchCustomers = async (
  query: string
): Promise<CustomerSearchResult[]> => {
  try {
    const response = await axios.get(
      `YOUR_API_BASE_URL/api/customers/search?q=${encodeURIComponent(query)}`,
     
    );

    if (!response) {
      throw new Error('Failed to search customers');
    }

    const data = await response.data.data;
    return data;
  } catch (error) {
    console.error('Search customers API error:', error);
    throw error;
  }
};