import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, ChevronRight, StepBack, Search, Calendar, IndianRupee } from 'lucide-react-native';
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
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadBills();
    });
    return unsubscribe;
  }, [navigation]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}api/bills/all`);
      setBills(response.data.data);
      setFilteredBills(response.data.data);
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

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(
        (bill) =>
          bill.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bill.buyer.buyer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBills(filtered);
    }
  }, [searchQuery, bills]);

  const getTotalAmount = () => {
    return filteredBills.reduce((sum, bill) => sum + bill.total, 0);
  };

  const renderBill = ({ item }: { item: Bill }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('BillDetails' as never, { bill: item } as never)
      }
      className="bg-white rounded-2xl p-5 mb-3 border border-slate-100 shadow-sm active:shadow-md active:scale-[0.98]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="bg-indigo-100 px-3 py-1 rounded-full">
              <Text className="text-indigo-700 font-bold text-xs">
                {item.invoice_number}
              </Text>
            </View>
          </View>
          <Text className="text-slate-800 font-semibold text-base mb-1">
            {item.buyer.buyer_name}
          </Text>
          <View className="flex-row items-center">
            <Calendar size={12} color="#94A3B8" />
            <Text className="text-slate-400 text-xs ml-1">
              {item.invoice_date}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <View className="bg-emerald-50 px-3 py-2 rounded-xl mb-2">
            <Text className="text-emerald-700 font-bold text-base">
              ₹{item.total.toLocaleString('en-IN')}
            </Text>
          </View>
          <View className="bg-slate-100 px-2 py-1 rounded-full">
            <Text className="text-slate-600 text-xs font-medium">
              {item.items.length} Item{item.items.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
      <View className="border-t border-slate-100 pt-3 flex-row justify-between items-center">
        <Text className="text-slate-400 text-xs">
          Subtotal: ₹{item.subtotal.toLocaleString('en-IN')}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-indigo-600 text-xs font-semibold mr-1">
            View Details
          </Text>
          <ChevronRight size={14} color="#4F46E5" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <View className="bg-slate-100 p-6 rounded-full mb-4">
        <FileText size={48} color="#94A3B8" />
      </View>
      <Text className="text-slate-600 font-semibold text-lg mb-2">
        No Bills Found
      </Text>
      <Text className="text-slate-400 text-sm text-center px-8">
        {searchQuery ? 'Try adjusting your search' : 'Bills will appear here once created'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <View className="bg-white p-8 rounded-3xl shadow-lg">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4 text-slate-600 font-semibold text-base">
            Loading bills...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-6 shadow-sm">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.navigate('HomeScreen')}
            className="bg-slate-100 p-2 rounded-xl mr-3"
          >
            <StepBack size={20} color="#1E293B" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-slate-900 text-2xl font-bold">
              Bill History
            </Text>
            <Text className="text-slate-500 text-sm mt-0.5">
              {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>

       

        
      </View>

      {/* Bills List */}
      <FlatList
        data={filteredBills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBill}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        ListEmptyComponent={EmptyState}
      />
    </SafeAreaView>
  );
};

export default BillHistory;