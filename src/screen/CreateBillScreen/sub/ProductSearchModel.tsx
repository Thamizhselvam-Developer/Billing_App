// components/ProductSearchModal.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Search, X, Package, Plus } from 'lucide-react-native';
import { useBillStore } from '../zust/useBillStore';

interface Product {
  id: number;
  name: string;
  name_english: string;
  weight?: string;
  price: number;
  stock?: number;
}

const ProductSearchModal: React.FC = () => {
  // Get state and actions from Zustand
  const showProductModal = useBillStore((state) => state.showProductModal);
  const availableProducts = useBillStore((state) => state.availableProducts);
  const setShowProductModal = useBillStore((state) => state.setShowProductModal);
  const selectProductForItem = useBillStore((state) => state.selectProductForItem);

  // Local state for search
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts;
    const query = searchQuery.toLowerCase();
    return availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.name_english.toLowerCase().includes(query)
    );
  }, [searchQuery, availableProducts]);

  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    if (showProductModal) {
      selectProductForItem(showProductModal, product);
      setShowProductModal(null);
      setSearchQuery('');
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSearchQuery('');
    setShowProductModal(null);
  };

  const visible = showProductModal !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-slate-900/60 justify-end">
        <TouchableOpacity
          className="flex-1"
          onPress={handleClose}
          activeOpacity={1}
        />

        <View className="bg-slate-50 h-[75%] rounded-t-[32px] overflow-hidden">
          {/* Drag Handle */}
          <View className="w-full items-center pt-3 pb-2 bg-white">
            <View className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </View>

          {/* Header with Search */}
          <View className="px-5 pb-4 bg-white border-b border-slate-100">
            <Text className="text-xl font-black text-slate-800 mb-4">
              Select Product
            </Text>

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
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Products List */}
          <ScrollView
            className="flex-1 px-5 pt-4"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleSelectProduct(item)}
                  className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row justify-between items-center active:scale-[0.98]"
                  activeOpacity={0.7}
                >
                  <View className="flex-1 mr-3">
                    <Text className="text-slate-800 font-bold text-base mb-0.5">
                      {item.name}
                    </Text>
                    <Text className="text-slate-500 text-sm mb-2">
                      {item.name_english}
                    </Text>
                    {item.weight && (
                      <View className="bg-slate-100 px-2 py-0.5 rounded self-start">
                        <Text className="text-slate-600 text-xs font-bold">
                          {item.weight}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-black text-slate-800">
                      ₹{item.price}
                    </Text>
                    <View className="bg-indigo-600 rounded-full p-1 mt-1">
                      <Plus size={16} color="white" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="items-center py-10 opacity-50">
                <Package size={48} color="#94A3B8" />
                <Text className="text-slate-500 font-medium mt-4">
                  {searchQuery ? 'No products found' : 'No products available'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ProductSearchModal;