// store/useBillStore.ts
import { create } from 'zustand';
import { Toast } from '../../../components/toastModel/ToastModel';

interface Product {
  id: number;
  name: string;
  name_english: string;
  weight?: string;
  price: number;
  stock?: number;
}

interface CustomerDetails {
  buyer_name: string;
  phone: string;
  email: string;
  address: string;
}

interface BillItem {
  id: string;
  itemId: number;
  itemName: string;
  englishItemName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  weight: string;
}

interface ValidationErrors {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  [key: string]: string | undefined;
}

interface BillStore {
  // State
  customer: CustomerDetails;
  billItems: BillItem[];
  errors: ValidationErrors;
  invoiceNo: string;
  availableProducts: Product[];
  isLoading: boolean;
  isSaving: boolean;
  showProductModal: string | null;

  // Computed values
  subTotal: () => number;
  itemCount: () => number;

  // Actions
  setInvoiceNo: (invoice: string) => void;
  setAvailableProducts: (products: Product[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setShowProductModal: (id: string | null) => void;
  
  updateCustomer: (customer: CustomerDetails) => void;
  addBillItem: () => void;
  removeBillItem: (id: string) => void;
  updateBillItemQuantity: (id: string, delta: number) => void;
  updateBillItemPrice: (id: string, priceText: string) => void;
  selectProductForItem: (itemId: string, product: Product) => void;
  
  setErrors: (errors: ValidationErrors) => void;
  clearError: (key: string) => void;
  validateForm: () => boolean;
  buildBillPayload: () => any;
  resetBill: () => void;
}

const INITIAL_CUSTOMER: CustomerDetails = {
  buyer_name: '',
  phone: '',
  email: '',
  address: '',
};

const createInitialBillItem = (): BillItem => ({
  id: Date.now().toString() + Math.random(),
  itemId: 0,
  itemName: '',
  englishItemName: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  weight: '',
});

export const useBillStore = create<BillStore>((set, get) => ({
  // Initial State
  customer: INITIAL_CUSTOMER,
  billItems: [createInitialBillItem()],
  errors: {},
  invoiceNo: '',
  availableProducts: [],
  isLoading: true,
  isSaving: false,
  showProductModal: null,

  // Computed values
  subTotal: () => {
    const { billItems } = get();
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  },

  itemCount: () => {
    return get().billItems.length;
  },

  // Simple setters
  setInvoiceNo: (invoice) => set({ invoiceNo: invoice }),
  setAvailableProducts: (products) => set({ availableProducts: products }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSaving: (saving) => set({ isSaving: saving }),
  setShowProductModal: (id) => set({ showProductModal: id }),
  setErrors: (errors) => set({ errors }),

  clearError: (key) => set((state) => {
    const newErrors = { ...state.errors };
    delete newErrors[key];
    return { errors: newErrors };
  }),

  // Update customer
  updateCustomer: (updatedCustomer) => set((state) => {
    const newErrors = { ...state.errors };
    delete newErrors.customerName;
    delete newErrors.customerPhone;
    delete newErrors.customerAddress;
    return { customer: updatedCustomer, errors: newErrors };
  }),

  // Add bill item
  addBillItem: () => set((state) => ({
    billItems: [...state.billItems, createInitialBillItem()],
  })),

  // Remove bill item
  removeBillItem: (id) => set((state) => {
    if (state.billItems.length <= 1) {
      // You'll need to import Toast or handle this differently
      Toast.error('At least one item is required');
      return state;
    }
    return {
      billItems: state.billItems.filter((item) => item.id !== id),
    };
  }),

  // FIXED: Update bill item quantity
  updateBillItemQuantity: (id, delta) => set((state) => ({
    billItems: state.billItems.map((item) => {
      if (item.id !== id) return item;
      
      const newQuantity = Math.max(1, item.quantity + delta);
      const newAmount = newQuantity * item.unitPrice;
      
      return {
        ...item,
        quantity: newQuantity,
        amount: newAmount,
      };
    }),
  })),

  // Update bill item price
  updateBillItemPrice: (id, priceText) => set((state) => {
    const price = parseFloat(priceText) || 0;
    return {
      billItems: state.billItems.map((item) =>
        item.id === id
          ? {
              ...item,
              unitPrice: price,
              amount: item.quantity * price,
            }
          : item
      ),
    };
  }),

  // Select product for item
  selectProductForItem: (itemId, product) => set((state) => {
    const itemIndex = state.billItems.findIndex((i) => i.id === itemId);
    
    const newBillItems = state.billItems.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        itemId: product.id,
        itemName: product.name,
        englishItemName: product.name_english,
        weight: product.weight ?? '',
        unitPrice: product.price,
        amount: item.quantity * product.price,
      };
    });

    const newErrors = { ...state.errors };
    if (itemIndex !== -1) {
      delete newErrors[`item_${itemIndex}`];
    }

    return { billItems: newBillItems, errors: newErrors };
  }),

  // Validate form
  validateForm: () => {
    const { customer, billItems, subTotal } = get();
    const newErrors: ValidationErrors = {};

    if (!customer.buyer_name.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (customer.phone && !/^\d{10}$/.test(customer.phone)) {
      newErrors.customerPhone = 'Phone must be 10 digits';
    }

    billItems.forEach((item, index) => {
      if (item.itemId === 0) {
        newErrors[`item_${index}`] = 'Please select a product';
      }
    });

    if (subTotal() <= 0) {
      newErrors.total = 'Total amount must be greater than zero';
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  // Build bill payload
  buildBillPayload: () => {
    const { customer, billItems, subTotal } = get();
    return {
      buyer: {
        buyer_name: customer.buyer_name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: subTotal(),
      total: subTotal(),
      bill_items: billItems.map((item) => ({
        item_id: item.itemId,
        qty: item.quantity,
        price: item.unitPrice,
        amount: item.amount,
        item_name: item.itemName,
      })),
    };
  },

 
  resetBill: () => set({
    customer: INITIAL_CUSTOMER,
    billItems: [createInitialBillItem()],
    errors: {},
    isSaving: false,
    showProductModal: null,
  }),
}));