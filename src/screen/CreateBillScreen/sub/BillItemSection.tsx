import { Text, TouchableOpacity, View } from "react-native";
import { useBillStore } from "../zust/useBillStore";
import { BillItemCard } from "./BillItemCard";
import { Package, Plus } from "lucide-react-native";

interface BillItemsSectionProps {
  // No props needed anymore - everything comes from Zustand
}

export const BillItemsSection: React.FC<BillItemsSectionProps> = () => {
  // Get state and actions from Zustand
  const billItems = useBillStore((state) => state.billItems);
  const errors = useBillStore((state) => state.errors);
  const addBillItem = useBillStore((state) => state.addBillItem);
  const setShowProductModal = useBillStore((state) => state.setShowProductModal);

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="p-2 rounded-lg bg-indigo-50 mr-3">
            <Package size={20} color="#4F46E5" strokeWidth={2.5} />
          </View>
          <Text className="text-slate-800 font-bold text-lg tracking-tight">
            Bill Items
          </Text>
        </View>
        <View className="bg-indigo-100 px-3 py-1 rounded-full">
          <Text className="text-indigo-700 font-bold text-xs">
            {billItems.length} {billItems.length === 1 ? 'Item' : 'Items'}
          </Text>
        </View>
      </View>

      {/* Bill Items List */}
      {billItems.map((item, index) => (
        <BillItemCard
          key={item.id}
          item={item}
          index={index}
          onSelectProduct={setShowProductModal}
          error={errors[`item_${index}`]}
        />
      ))}

      {/* Add Item Button */}
      <TouchableOpacity
        onPress={addBillItem}
        className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-xl py-4 flex-row items-center justify-center active:bg-indigo-100"
        activeOpacity={0.7}
      >
        <Plus size={20} color="#4F46E5" strokeWidth={2.5} />
        <Text className="text-indigo-600 font-bold text-base ml-2">Add Another Item</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BillItemCard;