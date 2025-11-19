import axios from 'axios';
import { BillItem, CustomerDetails } from '../../types_interface/Bill/Bill.type';
import { API_URL } from '@env';

// Base API configuration
const API_BASE_URL = 'https://your-api-domain.com/api'; // Replace with your actual API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = ''; // Get from AsyncStorage or auth context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request payload interfaces
export interface CreateBillPayload {
  invoice_number: string;
  buyer: {
    buyer_name: string;
    phone?: string;
    address?: string;
  };
  invoice_date: string; // Format: YYYY-MM-DD
  subtotal: number;
  total: number;
  bill_items: Array<{
    item_id: number;
    qty: number;
    price: number;
    amount: number;
  }>;
}

// Response interfaces
export interface CreateBillResponse {
  success: boolean;
  message: string;
  data: {
    bill_id: number;
    invoice_number: string;
    buyer_id: number;
    pdf_url?: string;
    created_at: string;
  };
}

/**
 * Create a new bill with buyer and items
 */
export const createBill = async (
  invoiceNo: string,
  customer: CustomerDetails,
  billItems: BillItem[],
  invoiceDate: string
): Promise<CreateBillResponse> => {
  try {
    const subtotal = billItems.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal;

    const formattedDate = formatDateForDB(invoiceDate);

    const payload: CreateBillPayload = {
      invoice_number: invoiceNo,
      buyer: {
        buyer_name: customer.name,
        phone: customer.phone || undefined,
        address: customer.address || undefined,
      },
      invoice_date: formattedDate,
      subtotal,
      total,
      bill_items: billItems.map((item) => ({
        item_id: item.itemId ?? 0, 
        qty: item.quantity,
        price: item.unitPrice,
        amount: item.amount,
      })),
    };

    console.log('Creating bill with payload:', payload);
console.log(API_URL)
    const response = await axios.post(`${API_URL}api/bills/create`, payload);
console.log(response)
    return response.data;
  } catch (error: any) {
    console.log(error,"ERROR")
    if (axios.isAxiosError(error)) {
    //   throw new Error(
    //     error.response?.data?.message || 
    //     error.message || 
    //     'Failed to create bill'
    //   );
    }
    
    throw new Error('An unexpected error occurred');
  }
};


const formatDateForDB = (dateString: string): string => {
  if (dateString.includes('-')) {
    return dateString;
  }
  
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  
  return new Date().toISOString().split('T')[0];
};


export const getNextInvoiceNumber = async (): Promise<string> => {
  try {
    const response = await api.get<{ invoice_number: string }>('/bills/next-invoice');
    return response.data.invoice_number;
  } catch (error) {
    console.error('Error fetching next invoice number:', error);
    return `INV${Date.now().toString().slice(-6)}`;
  }
};

export const getBillById = async (billId: number) => {
  try {
    const response = await api.get(`/bills/${billId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bill:', error);
    throw error;
  }
};

/**
 * Download PDF
 */
export const downloadBillPDF = async (billId: number): Promise<string> => {
  try {
    const response = await api.get(`/bills/${billId}/pdf`);
    return response.data.pdf_url;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};