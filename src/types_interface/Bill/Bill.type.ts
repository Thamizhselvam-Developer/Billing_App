export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
}







export interface BillItem {
  id: string ;
  itemId: number | undefined; // Actual database ID for item_master
  itemName: string;
  englishItemName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  weight: string;
}
