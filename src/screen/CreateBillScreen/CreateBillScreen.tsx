import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Plus,
  Trash2,
  User,
  Phone,
  Package,
  Save,
  FileText,
  Calendar,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProduct } from '../../services/Apis/GetItem.api';

import { AddProduct } from '../../types_interface/itemMaster/itemComponent.type';
import { createBill, getNextInvoiceNumber } from '../../services/Apis/Bill.api';
import { BillItem, CustomerDetails } from '../../types_interface/Bill/Bill.type';



const CreateBillScreen = ({ navigation }: any) => {
  const companyDetails = {
    name: 'NETHRA FOOD PRODUCTS',
    address:
      '33, Bharathidasen Street, Mutharayarpalayam,\nPuducherry - 605003',
    phone: '9688537216',
    email: 'nethrafoodproducts@gmail.com',
    whatsapp: '9688537216',
    gpay: '9688537216',
  };

  const bankDetails = {
    bankName: 'BANK OF BARODA, PONDICHERRY',
    accountNo: '69480100012900',
    ifscCode: 'BARB0VJRAJI',
    accountHolder: 'P SIVA',
  };

  const [invoiceNo, setInvoiceNo] = useState(
    `INV${Date.now().toString().slice(-6)}`,
  );
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toLocaleDateString('en-GB'),
  );
  const [availableProducts, setAvailableProducts] = useState<AddProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  
  const [billItems, setBillItems] = useState<BillItem[]>([
    {
      id: '1',
      itemId: 0,
      itemName: '',
      englishItemName: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      weight: '',
    },
  ]);

  const [showProductPicker, setShowProductPicker] = useState<string | null>(
    null,
  );

  // Fetch products and next invoice number on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const products = await getProduct();
      setAvailableProducts(products);

      try {
        const nextInvoice = await getNextInvoiceNumber();
        setInvoiceNo(nextInvoice);
              setIsLoading(false);
      } catch (err) {
        console.log('Using client-side invoice generation');
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addNewItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      itemId: 0,
      itemName: '',
      englishItemName: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      weight: '',
    };
    setBillItems([...billItems, newItem]);
  };

  const removeItem = (id: string) => {
    if (billItems.length > 1) {
      setBillItems(billItems.filter(item => item.id !== id));
    }
  };

  const selectProduct = (itemId: string, product: AddProduct) => {
    const { id, name, name_english, weight, price } = product;

    setBillItems(prevItems =>
      prevItems.map(item => {
        if (item.id !== itemId) return item;

        const updatedItem: BillItem = {
          ...item,
          itemId: id ?? undefined, 
          itemName: name,
          englishItemName: name_english,
          weight: weight ?? '',
          unitPrice: price,
          amount: item.quantity * price,
        };

        return updatedItem;
      })
    );

    setShowProductPicker(null);
  };

  const calculateSubTotal = () => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const validateBillData = (): boolean => {
    if (!customer.name.trim()) {
      Alert.alert('Validation Error', 'Please enter customer name');
      return false;
    }

    const hasEmptyItems = billItems.some(
      item => !item.itemName || item.quantity <= 0 || item.itemId === 0,
    );

    if (hasEmptyItems) {
      Alert.alert(
        'Validation Error',
        'Please select items and enter valid quantities for all rows'
      );
      return false;
    }

    const total = calculateSubTotal();
    if (total <= 0) {
      Alert.alert('Validation Error', 'Bill total must be greater than zero');
      return false;
    }

    return true;
  };

  const handleSaveBill = async () => {
    if (!validateBillData()) {
      return;
    }

    setIsSaving(true);
console.log(billItems,"")
    try {
      const response = await createBill(
        invoiceNo,
        customer,
        billItems,
        invoiceDate
      );

      console.log('Bill created successfully:', "response");

      Alert.alert(
        'Success! 🎉',
        `Invoice response.data.invoice_number created successfully!\n\nTotal: ₹${calculateSubTotal().toFixed(2)}`,
        [
          {
            text: 'Create Another',
            onPress: () => resetForm(),
          },
          {
            text: 'View Bills',
            onPress: () => navigation?.navigate('BillHistory', {
              newBillId: response.data.bill_id
            }),
          },
        ],
      );
    } catch (error: any) {
      console.error('Error creating bill:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create bill. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = async () => {
    // Get new invoice number
    try {
      const nextInvoice = await getNextInvoiceNumber();
      setInvoiceNo(nextInvoice);
    } catch {
      setInvoiceNo(`INV${Date.now().toString().slice(-6)}`);
    }

    setInvoiceDate(new Date().toLocaleDateString('en-GB'));
    setCustomer({ name: '', phone: '', email: '', address: '' });
    setBillItems([
      {
        id: '1',
        itemId: 0,
        itemName: '',
        englishItemName: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        weight: '',
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="bg-white shadow-md">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-extrabold text-gray-800">
                📝 Create Bill
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {companyDetails.name}
              </Text>
            </View>
            <View className="bg-blue-50 rounded-xl px-4 py-2">
              <Text className="text-blue-600 text-xs font-semibold">
                {invoiceNo}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-4">
          {/* Company Details */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200">
            <Text className="text-blue-900 font-bold text-base mb-2">
              {companyDetails.name}
            </Text>
            <Text className="text-blue-700 text-sm">
              {companyDetails.address}
            </Text>
            <View className="flex-row flex-wrap mt-2">
              <Text className="text-blue-600 text-xs mr-4">
                📞 {companyDetails.phone}
              </Text>
              <Text className="text-blue-600 text-xs">
                📧 {companyDetails.email}
              </Text>
            </View>
          </View>

          {/* Invoice Details */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Invoice Details
            </Text>
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <FileText color="#6B7280" size={16} />
                <Text className="text-gray-600 ml-2">Invoice No:</Text>
              </View>
              <Text className="text-gray-800 font-semibold">{invoiceNo}</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Calendar color="#6B7280" size={16} />
                <Text className="text-gray-600 ml-2">Date:</Text>
              </View>
              <Text className="text-gray-800 font-semibold">{invoiceDate}</Text>
            </View>
          </View>

          {/* Customer Details */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Bill To Buyer
            </Text>

            <View className="mb-3">
              <View className="flex-row items-center mb-2">
                <User color="#3B82F6" size={18} />
                <Text className="text-gray-700 font-semibold ml-2">Name *</Text>
              </View>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Customer Name"
                value={customer.name}
                onChangeText={text => setCustomer({ ...customer, name: text })}
              />
            </View>

            <View className="mb-3">
              <View className="flex-row items-center mb-2">
                <Phone color="#10B981" size={18} />
                <Text className="text-gray-700 font-semibold ml-2">Phone</Text>
              </View>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={customer.phone}
                onChangeText={text => setCustomer({ ...customer, phone: text })}
              />
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <Package color="#F59E0B" size={18} />
                <Text className="text-gray-700 font-semibold ml-2">
                  Address
                </Text>
              </View>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Delivery Address"
                multiline
                numberOfLines={2}
                value={customer.address}
                onChangeText={text =>
                  setCustomer({ ...customer, address: text })
                }
              />
            </View>
          </View>

          {/* Items Section */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-800">Items</Text>
              <TouchableOpacity
                onPress={addNewItem}
                className="bg-blue-500 rounded-full px-4 py-2 flex-row items-center"
              >
                <Plus color="white" size={16} />
                <Text className="text-white font-semibold ml-1">Add Item</Text>
              </TouchableOpacity>
            </View>

            {billItems.map((item, index) => (
              <View
                key={item.id}
                className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-700 font-bold">
                    Item {index + 1}
                  </Text>
                  {billItems.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      className="bg-red-50 rounded-full p-1"
                    >
                      <Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="mb-2">
                  <Text className="text-gray-600 text-xs mb-1">Item Name *</Text>
                  <TouchableOpacity
                    onPress={() => setShowProductPicker(item.id)}
                    className="bg-white rounded-lg px-3 py-3 border border-gray-300"
                  >
                    <Text
                      className={
                        item.itemName ? 'text-gray-800' : 'text-gray-400'
                      }
                    >
                      {item.itemName || 'Select Product'}
                    </Text>
                  </TouchableOpacity>

                  {showProductPicker === item.id && (
                    <View className="bg-white rounded-lg mt-1 border border-blue-300 shadow-lg">
                      <ScrollView style={{ maxHeight: 200 }}>
                        {availableProducts.map(
                          (product: AddProduct, idx: number) => (
                            <TouchableOpacity
                              key={idx}
                              onPress={() => selectProduct(item.id, product)}
                              className="px-3 py-3 border-b border-gray-100"
                            >
                              <Text className="text-gray-800 font-semibold">
                                {product.name}
                              </Text>
                              <Text className="text-gray-600 text-xs">
                                {product.name_english}
                              </Text>
                              <Text className="text-green-600 text-xs font-semibold">
                                ₹{product.price} {product.weight && `• ${product.weight}`}
                              </Text>
                            </TouchableOpacity>
                          ),
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-600 text-xs mb-1">Quantity *</Text>
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 text-gray-800 border border-gray-300"
                      keyboardType="numeric"
                      value={item.quantity.toString()}
                      onChangeText={text => {
                        const quantity = parseInt(text, 10) || 0;
                        setBillItems(prev =>
                          prev.map(b =>
                            b.id === item.id
                              ? { ...b, quantity, amount: quantity * b.unitPrice }
                              : b,
                          ),
                        );
                      }}
                    />
                  </View>

                  <View className="flex-1 mr-2">
                    <Text className="text-gray-600 text-xs mb-1">Unit Price</Text>
                    <TextInput
                      className="bg-white rounded-lg px-3 py-2 text-gray-800 border border-gray-300"
                      keyboardType="numeric"
                      value={item.unitPrice.toString()}
                      onChangeText={text => {
                        const unitPrice = parseFloat(text) || 0;
                        setBillItems(prev =>
                          prev.map(b =>
                            b.id === item.id
                              ? { ...b, unitPrice, amount: b.quantity * unitPrice }
                              : b,
                          ),
                        );
                      }}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-600 text-xs mb-1">Amount</Text>
                    <View className="bg-green-50 rounded-lg px-3 py-2 border border-green-300">
                      <Text className="text-green-700 font-bold">
                        ₹{item.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Total Section */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
              <Text className="text-gray-600 font-semibold">Sub Total:</Text>
              <Text className="text-gray-800 font-bold text-lg">
                ₹{calculateSubTotal().toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-gray-800 font-bold text-lg">Total:</Text>
              <Text className="text-green-600 font-bold text-2xl">
                ₹{calculateSubTotal().toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Bank Details */}
          <View className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-200">
            <Text className="text-green-900 font-bold text-base mb-2">
              Bank Details
            </Text>
            <Text className="text-green-700 text-sm">
              Bank: {bankDetails.bankName}
            </Text>
            <Text className="text-green-700 text-sm">
              Account No: {bankDetails.accountNo}
            </Text>
            <Text className="text-green-700 text-sm">
              IFSC Code: {bankDetails.ifscCode}
            </Text>
            <Text className="text-green-700 text-sm">
              Account Holder: {bankDetails.accountHolder}
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveBill}
            disabled={isSaving}
            className="bg-blue-500 rounded-2xl py-4 flex-row items-center justify-center shadow-lg mb-6 active:opacity-80"
            style={{
              elevation: 5,
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Save color="white" size={24} />
                <Text className="text-white text-lg font-bold ml-2">
                  Save & Generate Bill
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateBillScreen;