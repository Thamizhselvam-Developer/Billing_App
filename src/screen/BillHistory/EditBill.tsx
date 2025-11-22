import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Search,
  X,
  Package,
  ChevronDown,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { Toast } from '../../components/toastModel/ToastModel';
import { API_URL } from '@env';
import { getProduct } from '../../services/Apis/GetItem.api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types_interface/navigation.type';

// --- Types ---
interface BillItem {
  item_id: number;
  qty: number;
  price: number;
  amount: number;
  item_name?: string;
  name_english?: string;
}

interface Buyer {
  buyer_name: string;
  phone: string;
  address: string;
}

interface Bill {
  id: number;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  total: number;
  buyer: Buyer;
  items: BillItem[];
}

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const EditBill = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const { bill } = route.params as { bill: Bill };

  // --- States ---
  const [invoiceNumber, setInvoiceNumber] = useState(bill.invoice_number);
  const [invoiceDate, setInvoiceDate] = useState(bill.invoice_date);
  const [buyerName, setBuyerName] = useState(bill.buyer.buyer_name);
  const [buyerPhone, setBuyerPhone] = useState(bill.buyer.phone);
  const [buyerAddress, setBuyerAddress] = useState(bill.buyer.address);
  const [items, setItems] = useState<BillItem[]>(bill.items);
  const [saving, setSaving] = useState(false);

  // --- Product Modal ---
  const [showProductModal, setShowProductModal] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch products on mount
    const fetchProducts = async () => {
      try {
        const res = await getProduct();
        setProducts(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_english?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectProduct = (itemIndex: number, product: any) => {
    console.log(product);
    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      item_id: product.id,
      item_name: product.name,
      name_english: product.name_english,
      price: product.price,
      amount: product.price * updatedItems[itemIndex].qty,
    };
    setItems(updatedItems);
    setShowProductModal(null);
    setSearchQuery('');
  };

  // --- Item Handlers ---
  const addNewItem = () => {
    const newItem: BillItem = {
      item_id: Date.now(),
      qty: 1,
      price: 0,
      amount: 0,
      item_name: '',
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      Toast.error('Bill must have at least one item');
      return;
    }
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setItems(items.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const updateItemQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updatedItems = [...items];
    updatedItems[index].qty = newQty;
    updatedItems[index].amount = newQty * updatedItems[index].price;
    setItems(updatedItems);
  };

  const updateItemPrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;
    const updatedItems = [...items];
    updatedItems[index].price = newPrice;
    updatedItems[index].amount = newPrice * updatedItems[index].qty;
    setItems(updatedItems);
  };

  const calculateTotals = (currentItems: BillItem[]) => {
    const subtotal = currentItems.reduce((sum, item) => sum + item.amount, 0);
    return { subtotal, total: subtotal };
  };

  const saveBill = async () => {
    if (!buyerName.trim()) return Toast.error('Buyer name is required');
    if (!buyerPhone.trim()) return Toast.error('Buyer phone is required');
    if (items.some((item) => item.price === 0))
      return Toast.error('All items must have a price');

    setSaving(true);
    try {
      const { subtotal, total } = calculateTotals(items);
      const updatedBill = {
        id: bill.id,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        subtotal,
        total,
        buyer: { buyer_name: buyerName, phone: buyerPhone, address: buyerAddress },
        items,
      };
      const res = await axios.patch(`${API_URL}api/bills/update/${bill.id}`, updatedBill);
      if (res.data.success) {
        Toast.success('Bill updated successfully!');
        navigation.navigate('BillHistory');
      }
    } catch (err) {
      Toast.error('Failed to update bill');
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, total } = calculateTotals(items);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-xl font-bold flex-1">Edit Bill</Text>
        <TouchableOpacity
          onPress={saveBill}
          disabled={saving}
          className="bg-indigo-600 px-4 py-2 rounded-lg flex-row items-center"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Save size={18} color="#fff" />
              <Text className="text-white font-semibold ml-2">Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* Invoice Info */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200">
          <Text className="text-slate-700 font-bold text-base mb-3">Invoice Information</Text>
          <TextInput
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 mb-3"
            editable={false}
          />
          <TextInput
            value={invoiceDate}
            onChangeText={setInvoiceDate}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Buyer Details */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200">
          <Text className="text-slate-700 font-bold text-base mb-3">Buyer Information</Text>
          <TextInput
            value={buyerName}
            onChangeText={setBuyerName}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 mb-3"
            placeholder="Enter buyer name"
          />
          <TextInput
            value={buyerPhone}
            onChangeText={setBuyerPhone}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 mb-3"
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          <TextInput
            value={buyerAddress}
            onChangeText={setBuyerAddress}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
            placeholder="Enter address"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Items List */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-700 font-bold text-base">Items ({items.length})</Text>
            <TouchableOpacity
              onPress={addNewItem}
              className="bg-indigo-600 px-3 py-2 rounded-lg flex-row items-center"
            >
              <Plus size={16} color="#fff" />
              <Text className="text-white font-semibold ml-1 text-sm">Add</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View
              key={index}
              className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0"
            >
              {/* Item Header with Number and Delete */}
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Item #{index + 1}
                </Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Product Selection Button */}
              <TouchableOpacity
                onPress={() => setShowProductModal(index)}
                className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3"
              >
                <View
                  className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                    item.item_id ? 'bg-indigo-100' : 'bg-slate-200'
                  }`}
                >
                  <Package size={20} color={item.item_id ? '#4F46E5' : '#94A3B8'} />
                </View>
                <View className="flex-1">
                  {item.item_name ? (
                    <>
                      <Text className="text-slate-800 font-bold text-base">
                        {item.item_name}
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        {item.name_english || ''}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-slate-400 font-medium italic">
                      Tap to select product...
                    </Text>
                  )}
                </View>
                <ChevronDown size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Price, Quantity, and Total Controls */}
              <View className="flex-row gap-3">
                {/* Price Input */}
                <View className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1 ml-1">
                    Price
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-slate-400 text-xs mr-1">₹</Text>
                    <TextInput
                      value={item.price?.toString() || '0'}
                      keyboardType="numeric"
                      className="text-slate-800 font-bold text-base p-0 min-w-[40px]"
                      onChangeText={(text) => {
                        const price = parseFloat(text) || 0;
                        updateItemPrice(index, price);
                      }}
                    />
                  </View>
                </View>

                {/* Quantity Controls */}
                <View className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100 items-center">
                  <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">
                    Qty
                  </Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => {
                        const newQty = Math.max(1, (item.qty || 1) - 1);
                        updateItemQty(index, newQty);
                      }}
                      className="bg-white rounded p-1 shadow-sm"
                    >
                      <Text className="text-slate-600 font-bold">-</Text>
                    </TouchableOpacity>
                    <Text className="mx-3 text-slate-800 font-bold text-base">
                      {item.qty || 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        const newQty = (item.qty || 1) + 1;
                        updateItemQty(index, newQty);
                      }}
                      className="bg-white rounded p-1 shadow-sm"
                    >
                      <Text className="text-slate-600 font-bold">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Total Amount Display */}
                <View className="flex-1 bg-green-50 rounded-xl p-2 border border-green-100 justify-center items-end pr-3">
                  <Text className="text-green-600 text-[10px] font-bold uppercase mb-0.5">
                    Total
                  </Text>
                  <Text className="text-green-700 font-black text-lg">
                    ₹{(item.amount || 0).toFixed(0)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View className="bg-indigo-50 rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-indigo-700 text-sm">Subtotal</Text>
            <Text className="text-indigo-900 font-semibold">₹{subtotal.toLocaleString()}</Text>
          </View>
          <View className="border-t border-indigo-200 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-indigo-900 font-bold text-lg">Total</Text>
            <Text className="text-indigo-600 font-bold text-xl">₹{total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Product Modal */}
      <Modal
        visible={showProductModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductModal(null)}
      >
        <View className="flex-1 bg-slate-900/60 justify-end">
          <TouchableOpacity className="flex-1" onPress={() => setShowProductModal(null)} />
          <View className="bg-slate-50 h-[75%] rounded-t-[32px] overflow-hidden">
            <View className="w-full items-center pt-3 pb-2 bg-white">
              <View className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </View>
            <View className="px-5 pb-4 bg-white border-b border-slate-100">
              <Text className="text-xl font-black text-slate-800 mb-4">Select Product</Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-12">
                <Search color="#94A3B8" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-slate-800 font-medium text-base"
                  placeholder="Search products..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => selectProduct(showProductModal!, product)}
                    className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row justify-between items-center"
                  >
                    <View className="flex-1">
                      <Text className="text-slate-800 font-bold text-base">{product.name}</Text>
                      <Text className="text-slate-500 text-sm">{product.name_english}</Text>
                      <Text className="text-indigo-600 text-xs">Stock: {product.stock ?? 'N/A'}</Text>
                    </View>
                    <Text className="text-lg font-black text-slate-800">₹{product.price}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="items-center py-10 opacity-50">
                  <Package size={48} color="#94A3B8" />
                  <Text className="text-slate-500 font-medium mt-4">No products found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EditBill;