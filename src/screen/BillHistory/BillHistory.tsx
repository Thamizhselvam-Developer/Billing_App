import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, ChevronRight, StepBack } from 'lucide-react-native';
import axios from 'axios';
import ToastNotification from '../../components/toastModel/ToastNotification';
import { useNavigation } from '@react-navigation/native';
import { Toast } from '../../components/toastModel/ToastModel';
import { API_URL } from '@env';

// --- Types ---
interface BillItem {
  item_id: number;
  qty: number;
  price: number;
  amount: number;
  item_name?: string;
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

const BillHistory = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const loadBills = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}api/bills/all`);
      console.log(response);
      setBills(response.data.data);
    } catch (err) {
      console.log(err);
      Toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const renderBill = ({ item }: { item: Bill }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('BillDetails' as never, { bill: item } as never)
      }
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-200 shadow-sm"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-slate-800 font-bold text-lg">
            {item.invoice_number}
          </Text>
          <Text className="text-slate-500 text-sm mt-1">
            {item.buyer.buyer_name}
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            {item.invoice_date} • ₹{item.total.toLocaleString()}
          </Text>
          <Text className="text-slate-400 text-xs mt-1">
            {item.items.length} Item{item.items.length > 1 ? 's' : ''}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="bg-indigo-50 p-2 rounded-full mr-2">
            <FileText size={20} color="#4F46E5" />
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 text-slate-500 font-medium">
          Loading bills...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5 pt-4">
      <View className='flex-row gap-4 items-center mb-3'>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
        <StepBack/>

        </TouchableOpacity>
        <Text className="text-slate-900 text-2xl font-bold">
        Bill History
      </Text>
      </View>
      
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBill}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

export default BillHistory;