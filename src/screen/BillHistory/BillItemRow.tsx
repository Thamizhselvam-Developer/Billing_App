import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Plus, Minus, Trash2 } from 'lucide-react-native';
import { Toast } from '../../components/toastModel/ToastModel';

interface BillItemProps {
  index: number;
  item: any;
  updateItemQty: (index: number, newQty: number) => void;
  updateItemPrice: (index: number, newPrice: number) => void;
  updateItemName: (index: number, newName: string) => void;
  removeItem: (index: number) => void;
  isOnlyItem: boolean;
}

const BillItemRow: React.FC<BillItemProps> = ({
  index,
  item,
  updateItemQty,
  updateItemPrice,
  updateItemName,
  removeItem,
  isOnlyItem,
}) => {
  return (
    <View className={`py-3 ${!isOnlyItem ? 'border-b border-slate-100 mb-3' : ''}`}>
      {/* Item Name */}
      <View className="mb-2">
        <Text className="text-slate-600 text-xs mb-1">Item Name</Text>
        <TextInput
          value={item.item_name || ''}
          onChangeText={(text) => updateItemName(index, text)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
          placeholder="Enter item name"
        />
      </View>

      {/* Quantity & Price */}
      <View className="flex-row gap-2 mb-2">
        <View className="flex-1">
          <Text className="text-slate-600 text-xs mb-1">Quantity</Text>
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-lg">
            <TouchableOpacity
              onPress={() => updateItemQty(index, item.qty - 1)}
              className="p-2"
            >
              <Minus size={16} color="#64748B" />
            </TouchableOpacity>
            <TextInput
              value={item.qty.toString()}
              onChangeText={(text) =>
                updateItemQty(index, parseInt(text) || 1)
              }
              className="flex-1 text-center text-slate-900 font-semibold"
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={() => updateItemQty(index, item.qty + 1)}
              className="p-2"
            >
              <Plus size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1">
          <Text className="text-slate-600 text-xs mb-1">Price (₹)</Text>
          <TextInput
            value={item.price.toString()}
            onChangeText={(text) =>
              updateItemPrice(index, parseFloat(text) || 0)
            }
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </View>

      {/* Amount & Remove */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-slate-500 text-xs">Amount</Text>
          <Text className="text-slate-900 font-bold text-lg">
            ₹{item.amount.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => removeItem(index)}
          className="bg-red-50 p-2 rounded-lg"
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BillItemRow;
