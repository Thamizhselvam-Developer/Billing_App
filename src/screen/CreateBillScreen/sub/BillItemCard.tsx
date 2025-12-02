import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Minus, Plus, Trash2, Package } from 'lucide-react-native';
import { useBillStore } from '../zust/useBillStore';

interface BillItemCardProps {
  item: {
    id: string;
    itemId: number;
    itemName: string;
    englishItemName: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    weight: string;
  };
  index: number;
  onSelectProduct: (id: string) => void;
  error?: string;
}

export const BillItemCard: React.FC<BillItemCardProps> = ({
  item,
  index,
  onSelectProduct,
  error,
}) => {
  // Get actions from Zustand store
  const removeBillItem = useBillStore((state) => state.removeBillItem);
  const updateBillItemQuantity = useBillStore((state) => state.updateBillItemQuantity);
  const updateBillItemPrice = useBillStore((state) => state.updateBillItemPrice);

  // FIXED: Handlers that properly use the item.id
  const handleIncreaseQty = () => {
    updateBillItemQuantity(item.id, 1);
  };

  const handleDecreaseQty = () => {
    updateBillItemQuantity(item.id, -1);
  };

  const handlePriceChange = (text: string) => {
    updateBillItemPrice(item.id, text);
  };

  const handleDelete = () => {
    removeBillItem(item.id);
  };

  return (
    <View
      className={`bg-white rounded-2xl p-4 mb-4 border ${
        error ? 'border-red-300' : 'border-slate-200'
      } shadow-sm`}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="bg-indigo-100 px-3 py-1 rounded-full">
          <Text className="text-indigo-700 font-bold text-xs">Item #{index + 1}</Text>
        </View>
        <TouchableOpacity
          onPress={handleDelete}
          className="bg-red-50 p-2 rounded-full active:bg-red-100"
          activeOpacity={0.7}
        >
          <Trash2 size={18} color="#EF4444" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Product Selection */}
      <TouchableOpacity
        onPress={() => onSelectProduct(item.id)}
        className={`flex-row items-center bg-slate-50 border ${
          error ? 'border-red-300' : 'border-slate-200'
        } rounded-xl px-4 py-3 mb-3`}
        activeOpacity={0.7}
      >
        <Package color="#64748B" size={20} />
        <View className="flex-1 ml-3">
          {item.itemName ? (
            <>
              <Text className="text-slate-800 font-bold text-base">{item.itemName}</Text>
              <Text className="text-slate-500 text-sm">{item.englishItemName}</Text>
              {item.weight && (
                <Text className="text-slate-400 text-xs mt-0.5">{item.weight}</Text>
              )}
            </>
          ) : (
            <Text className="text-slate-400 font-medium">Select Product</Text>
          )}
        </View>
        {item.itemName && (
          <View className="bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-green-700 font-bold text-xs">✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-xs mb-3 ml-1 font-medium">⚠️ {error}</Text>
      )}

      {/* Quantity and Price */}
      <View className="flex-row space-x-3">
        {/* Quantity Controls */}
        <View className="flex-1 ">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">
            Quantity
          </Text>
         <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
  {/* Decrease Button */}
  <TouchableOpacity
    onPress={handleDecreaseQty}
    className={`px-4 py-3 ${
      item.quantity <= 1 ? 'bg-slate-200' : 'bg-slate-100'
    }`}
    activeOpacity={0.7}
    disabled={item.quantity <= 1}
  >
    <Minus
      size={18}
      color={item.quantity <= 1 ? '#94A3B8' : '#475569'}
      strokeWidth={2.5}
    />
  </TouchableOpacity>

  {/* Quantity Display */}
  <View className="flex-1 items-center justify-center px-4">
    <Text className="text-slate-800 font-bold text-lg">{item.quantity}</Text>
  </View>

  {/* Increase Button */}
  <TouchableOpacity
    onPress={handleIncreaseQty}
    className="px-4 py-3 bg-indigo-600 rounded-xl mr-2 active:bg-indigo-700"
    activeOpacity={0.7}
  >
    <Plus size={18} color="white" strokeWidth={2.5} />
  </TouchableOpacity>
</View>
        </View>

      
        <View className="flex-1">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">
            Unit Price
          </Text>
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl">
            <Text className="text-slate-500 font-bold ml-4 ">₹</Text>
            <TextInput
              className="flex-1 text-slate-800 font-bold text-center "
              keyboardType="decimal-pad"
              value={item.unitPrice.toString()}
              onChangeText={handlePriceChange}
              placeholder="0"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
      </View>

      {/* Total Amount */}
      <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-between items-center">
        <Text className="text-slate-500 text-xs font-bold uppercase tracking-wide">
          Item Total
        </Text>
        <Text className="text-slate-900 text-xl font-black">₹{item.amount.toFixed(2)}</Text>
      </View>
    </View>
  );
};