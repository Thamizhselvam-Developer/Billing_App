import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Download,
  Edit,
  Phone,
  MapPin,
  Calendar,
  Hash,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { Toast } from '../../components/toastModel/ToastModel';
import { API_URL } from '@env';

// --- Types ---
interface BillItem {
  name_english: string;
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
  name?:string;
  name_english?:string
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  total: number;
  buyer: Buyer;
  items: BillItem[];
}

const BillDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bill } = route.params as { bill: Bill };
  
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}api/bills/generate-pdf`, {
        id: bill.id,
        invoice_number: bill.invoice_number,
        invoice_date: bill.invoice_date,
        subtotal: bill.subtotal,
        total: bill.total,
        buyer: bill.buyer,
        items: bill.items,
      });

      if (response.status === 200) {
        Toast.success('PDF generated successfully!');
        // Handle PDF download/view here
        // You might want to open the PDF URL or download it
        if (response.data.pdf_url) {
          // Open PDF or download
          // Linking.openURL(response.data.pdf_url);
        }
      }
    } catch (err) {
      console.error(err);
      Toast.error('Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditBill' as never, { bill } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-slate-900 text-xl font-bold flex-1">
          Bill Details
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* Invoice Info Card */}
        <View className="bg-indigo-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Hash size={16} color="#4F46E5" />
            <Text className="text-indigo-900 font-bold text-lg ml-2">
              {bill.invoice_number}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Calendar size={14} color="#6366F1" />
            <Text className="text-indigo-700 text-sm ml-2">
              {bill.invoice_date}
            </Text>
          </View>
        </View>

        {/* Buyer Details Card */}
        <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-slate-700 font-bold text-base mb-3">
            Buyer Information
          </Text>
          <View>
            <Text className="text-slate-900 font-semibold text-base mb-2">
              {bill.buyer.buyer_name}
            </Text>
            <View className="flex-row items-center mb-2">
              <Phone size={14} color="#64748B" />
              <Text className="text-slate-600 text-sm ml-2">
                {bill.buyer.phone}
              </Text>
            </View>
            <View className="flex-row items-start">
              <MapPin size={14} color="#64748B" style={{ marginTop: 2 }} />
              <Text className="text-slate-600 text-sm ml-2 flex-1">
                {bill.buyer.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Items List */}
        <View className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-slate-700 font-bold text-base mb-3">
            Items ({bill.items.length})
          </Text>
          {bill.items.map((item, index) => (
            <View
              key={index}
              className={`py-3 ${
                index !== bill.items.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-slate-800 font-semibold flex-1">
                  {item?.item_name } - {item?.name_english}
                </Text>
                <Text className="text-slate-900 font-bold">
                  ₹{item.amount.toLocaleString()}
                </Text>
              </View>
              <Text className="text-slate-500 text-xs">
                Qty: {item.qty} × ₹{item.price.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Total Summary */}
        <View className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-600 text-sm">Subtotal</Text>
            <Text className="text-slate-700 font-semibold">
              ₹{bill.subtotal.toLocaleString()}
            </Text>
          </View>
          <View className="border-t border-slate-200 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-slate-900 font-bold text-lg">Total</Text>
            <Text className="text-indigo-600 font-bold text-xl">
              ₹{bill.total.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Buttons */}
      <View className="px-5 py-4 bg-white border-t border-slate-200">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleEdit}
            className="flex-1 bg-slate-100 py-4 rounded-xl flex-row justify-center items-center"
          >
            <Edit size={20} color="#475569" />
            <Text className="text-slate-700 font-semibold ml-2">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={generatePDF}
            disabled={generating}
            className="flex-1 bg-indigo-600 py-4 rounded-xl flex-row justify-center items-center"
          >
            {generating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Download size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">
                  Generate PDF
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BillDetails;