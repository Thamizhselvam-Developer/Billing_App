// BillItemCard.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Trash2, Package, ChevronDown } from 'lucide-react-native'; // your icons

export interface BillItem {
  id: string;
  itemId: number;
  itemName: string;
  englishItemName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  weight?: string;
}

interface Props {
  item: BillItem;
  index: number;
  canDelete: boolean;
  onDelete: (id: string) => void;
  onSelectProduct: (id: string) => void;
  handleQuantityChange: (id: string, delta: number) => void;
  onPriceChange: (id: string, price: string) => void;
  error?: string;
}

const BillItemCard: React.FC<Props> = ({
  item,
  index,
  canDelete,
  onDelete,
  onSelectProduct,
  handleQuantityChange,
  onPriceChange,
  error,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const increase = useCallback(() => {
    if (isUpdating) return;
    setIsUpdating(true);
    handleQuantityChange(item.id, 1);
    setIsUpdating(false);
  }, [item.id, handleQuantityChange, isUpdating]);

  const decrease = useCallback(() => {
    if (isUpdating || item.quantity <= 1) return;
    setIsUpdating(true);
    handleQuantityChange(item.id, -1);
    setIsUpdating(false);
  }, [item.id, handleQuantityChange, item.quantity, isUpdating]);

  return (
    <View className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
      {/* Header */}
      <View className="flex-row justify-between mb-2">
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Item #{index + 1}
        </Text>

        {canDelete && (
          <TouchableOpacity onPress={() => onDelete(item.id)} activeOpacity={0.7} className="bg-red-50 rounded-lg px-2 py-1">
            <Trash2 size={16} color="#EF4444" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Product selector */}
      <TouchableOpacity
        onPress={() => onSelectProduct(item.id)}
        className={`flex-row items-center bg-slate-50 border ${error ? 'border-red-300' : 'border-slate-200'} rounded-xl p-3 mb-3`}
        activeOpacity={0.7}
      >
        <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${item.itemId ? 'bg-indigo-100' : 'bg-slate-200'}`}>
          <Package size={20} color={item.itemId ? '#4F46E5' : '#94A3B8'} />
        </View>
        <View className="flex-1">
          {item.itemName ? (
            <>
              <Text className="text-slate-800 font-bold text-base">{item.itemName}</Text>
              <Text className="text-slate-500 text-xs">
                {item.englishItemName} {item.weight ? `• ${item.weight}` : ''}
              </Text>
            </>
          ) : (
            <Text className="text-slate-400 font-medium italic">Tap to select product...</Text>
          )}
        </View>
        <ChevronDown size={16} color="#94A3B8" />
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-xs mb-2 ml-1 font-medium">⚠️ {error}</Text>}

      {/* Price, Quantity, Total */}
      <View className="flex-row gap-3">
        {/* Price */}
        <View className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
          <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1 ml-1">Price</Text>
          <View className="flex-row items-center">
            <Text className="text-slate-400 text-xs mr-1">₹</Text>
            <TextInput
              value={item.unitPrice > 0 ? item.unitPrice.toString() : ''}
              keyboardType="numeric"
              className="text-slate-800 font-bold text-base p-0 min-w-[40px]"
              onChangeText={(text) => onPriceChange(item.id, text)}
              placeholder="0"
              placeholderTextColor="#CBD5E1"
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Quantity */}
        <View className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100 items-center">
          <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Qty</Text>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={decrease} className={`rounded-lg p-2 ${item.quantity <= 1 ? 'bg-slate-200' : 'bg-white shadow-sm'}`} activeOpacity={0.7}>
              <Text className={`font-black text-base ${item.quantity <= 1 ? 'text-slate-400' : 'text-slate-700'}`}>−</Text>
            </TouchableOpacity>

            <Text className="mx-4 text-slate-800 font-black text-lg min-w-[28px] text-center">{item.quantity}</Text>

            <TouchableOpacity onPress={increase} className="rounded-lg p-2 bg-white shadow-sm" activeOpacity={0.7}>
              <Text className="font-black text-base text-slate-700">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total */}
        <View className="flex-1 bg-green-50 rounded-xl p-2 border border-green-100 justify-center items-end pr-3">
          <Text className="text-green-600 text-[10px] font-bold uppercase mb-0.5">Total</Text>
          <Text className="text-green-700 font-black text-lg">₹{item.amount.toFixed(0)}</Text>
        </View>
      </View>
    </View>
  );
};

export default BillItemCard;
