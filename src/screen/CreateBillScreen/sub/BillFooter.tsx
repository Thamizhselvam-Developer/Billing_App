import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FileText } from 'lucide-react-native';
import { useBillStore } from '../zust/useBillStore';

export const BillFooter = ({ onSave }: { onSave: () => void }) => {
  const totalAmount = useBillStore((s) => s.subTotal());
  const itemCount = useBillStore((s) => s.itemCount());
  const isSaving = useBillStore((s) => s.isSaving);

  return (
    <View className="absolute bottom-0 w-full bg-white border-t border-slate-200 pb-6 pt-4 px-5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">

      <View className="flex-row justify-between items-end mb-4">
        <View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">
            Total Amount
          </Text>

          <Text className="text-slate-900 text-3xl font-black tracking-tight">
            ₹{totalAmount.toFixed(2)}
          </Text>
        </View>

        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-700 text-xs font-bold">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={()=>onSave()}
        disabled={isSaving}
        className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg ${
          isSaving ? 'bg-indigo-400' : 'bg-indigo-600 active:bg-indigo-700'
        } shadow-indigo-200`}
        activeOpacity={0.8}
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text className="text-white font-bold text-lg mr-2">
              Generate Invoice
            </Text>
            <FileText color="white" size={20} strokeWidth={2.5} />
          </>
        )}
      </TouchableOpacity>

    </View>
  );
};
