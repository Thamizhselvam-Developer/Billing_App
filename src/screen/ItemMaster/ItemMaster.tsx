import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Plus, Search, Edit2, Trash2, Package, X, Sparkles, TrendingUp, ShoppingBag } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addNewProduct, deleteProduct, updateProduct } from '../../services/Apis/Additem.api';
import { AddProduct, Product } from '../../types_interface/itemMaster/itemComponent.type';
import { getProduct } from '../../services/Apis/GetItem.api';
import { Toast } from '../../components/toastModel/ToastModel';
import ToastNotification from '../../components/toastModel/ToastNotification';

const ItemMasterScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_english: '',
    weight: '500g',
    price: 0,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const getItems = await getProduct();
      setProducts(getItems);
    } catch (error) {
      Toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts =
    products &&
    products.filter((product) => {
      if (!product) return false;
      const english = (product.name_english || '').toLowerCase();
      const tamil = product.name || '';
      return english.includes(searchQuery.toLowerCase()) || tamil.includes(searchQuery);
    });

  const handleAddNew = async () => {
    setEditingProduct(null);
    setFormData({ name: '', name_english: '', weight: '500g', price: 0 });
    setIsModalVisible(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_english: product.name_english,
      weight: product.weight,
      price: product.price,
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.name_english.trim()) {
      Toast.error('Please fill in all required fields');
      return;
    }

    if (formData.price <= 0) {
      Toast.error('Price must be greater than 0');
      return;
    }

    const newProduct: AddProduct = {
      name: formData.name.trim(),
      name_english: formData.name_english.trim(),
      weight: formData.weight.trim(),
      price: Number(formData.price),
    };

    setIsSaving(true);

    if (editingProduct) {
      try {
        await updateProduct(editingProduct.id, newProduct);
        const getItem = await getProduct();
        setProducts(getItem);
        Toast.success('Product updated successfully! 🎉');
        setIsModalVisible(false);
        setEditingProduct(null);
        setFormData({ name: '', name_english: '', weight: '500g', price: 0 });
      } catch (err) {
        Toast.error('Failed to update product');
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        await addNewProduct(newProduct);
        const getItems = await getProduct();
        setProducts(getItems);
        Toast.success('Product added successfully! ✨');
        setIsModalVisible(false);
        setFormData({ name: '', name_english: '', weight: '500g', price: 0 });
      } catch (err) {
        Toast.error('Failed to add product');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      '🗑️ Delete Product',
      'This action cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              const gettem = await getProduct();
              setProducts(gettem);
              Toast.success('Product deleted successfully!');
            } catch (err) {
              Toast.error('Failed to delete product');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 items-center justify-center">
        <View className="items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4 text-lg font-semibold">Loading inventory...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ToastNotification />

      <View className="bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-start justify-between mb-6">
            <View className="flex-1">
              <View className="flex-row items-center mb-3">
                <View className="bg-blue-400 rounded-2xl p-2 mr-3 shadow-lg">
                  <ShoppingBag color="white" size={24} strokeWidth={2.5} />
                </View>
                <View>
                  <Text className="text-3xl font-black text-gray-900 tracking-tight">
                    Item Master
                  </Text>
                  <Text className="text-sm text-gray-500 font-medium mt-0.5">
                    Inventory Management
                  </Text>
                </View>
              </View>

              {/* Stats Pills */}
              <View className="flex-row items-center flex-wrap">
                <View className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 mr-2 mb-2">
                  <Text className="text-emerald-700 text-xs font-bold">
                    ● {products.length} Products
                  </Text>
                </View>
                <View className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-2">
                  <Text className="text-blue-700 text-xs font-bold">
                    ✓ Active
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAddNew}
              activeOpacity={0.8}
              className="bg-blue-500 rounded-3xl shadow-2xl"
              style={{
                elevation: 12,
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
              }}
            >
              <View className="px-6 py-4 flex-row items-center">
                <Plus color="white" size={24} strokeWidth={3} />
                <Text className="text-white font-black text-base ml-2">Add</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Premium Search Bar */}
          <View className="relative">
            <View
              className="bg-white rounded-3xl px-5 py-4 flex-row items-center border-2 border-gray-200 shadow-sm"
              style={{
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
              }}
            >
              <Search color="#9CA3AF" size={22} strokeWidth={2.5} />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-900 font-semibold"
                placeholder="Search products..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} className="bg-gray-100 rounded-full p-2">
                  <X color="#6B7280" size={18} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Products Grid */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      >
        {filteredProducts.map((product, index) => (
          <View
            key={product.id}
            className="bg-white rounded-3xl p-5 mb-4 border border-gray-100"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            }}
          >
            <View className="flex-row">
              {/* Product Icon */}
              <View className="mr-4">
                <View
                  className="bg-purple-200 rounded-3xl p-4 shadow-sm"
                  style={{
                    elevation: 2,
                    shadowColor: '#9333EA',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                  }}
                >
                  <Package color="#9333EA" size={36} strokeWidth={2.5} />
                </View>
              </View>

              {/* Product Info */}
              <View className="flex-1">
                <View className="mb-3">
                  <Text className="text-xl font-black text-gray-900 mb-1 leading-tight">
                    {product.name_english}
                  </Text>
                  <Text className="text-base text-gray-500 font-medium">
                    {product.name}
                  </Text>
                </View>

                {/* Tags Row */}
                <View className="flex-row items-center mb-4 flex-wrap">
                  <View className="bg-blue-100 border border-blue-200 rounded-2xl px-4 py-2 mr-2 mb-2">
                    <Text className="text-blue-700 text-sm font-bold">
                      {product.weight}
                    </Text>
                  </View>
                  <View className="bg-amber-100 border border-amber-200 rounded-2xl px-3 py-2 mb-2">
                    <Text className="text-amber-700 text-xs font-bold">● In Stock</Text>
                  </View>
                </View>

                {/* Price & Actions */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-end">
                    <Text className="text-3xl font-black text-emerald-600">
                      ₹{product.price}
                    </Text>
                    <View className="ml-2 mb-1 bg-emerald-100 rounded-full p-1.5">
                      <TrendingUp color="#059669" size={16} strokeWidth={2.5} />
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => handleEdit(product)}
                      activeOpacity={0.7}
                      className="bg-blue-100 border border-blue-200 rounded-2xl px-4 py-3 mr-2 shadow-sm"
                      style={{
                        elevation: 2,
                        shadowColor: '#3B82F6',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                      }}
                    >
                      <Edit2 color="#3B82F6" size={20} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(product.id)}
                      activeOpacity={0.7}
                      className="bg-red-100 border border-red-200 rounded-2xl px-4 py-3 shadow-sm"
                      style={{
                        elevation: 2,
                        shadowColor: '#EF4444',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                      }}
                    >
                      <Trash2 color="#EF4444" size={20} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Premium Empty State */}
        {filteredProducts.length === 0 && (
          <View className="items-center justify-center py-20 px-6">
            <View className="bg-blue-300 rounded-full p-12 mb-6 shadow-lg">
              <Package color="#D1D5DB" size={80} strokeWidth={1.5} />
            </View>
            <Text className="text-gray-900 text-2xl font-black mb-3 text-center">
              {searchQuery ? 'No Results Found' : 'Start Your Inventory'}
            </Text>
            <Text className="text-gray-500 text-base text-center mb-6 px-4 leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Add your first product to get started with inventory management'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={handleAddNew}
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl px-8 py-4 shadow-xl"
                style={{
                  elevation: 8,
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <View className="flex-row items-center">
                  <Plus color="white" size={22} strokeWidth={3} />
                  <Text className="text-white font-black text-base ml-2">Add Product</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Premium Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View
            className="bg-white rounded-t-[40px]"
            style={{
              maxHeight: '92%',
              elevation: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            {/* Modal Header */}
            <View className="px-6 pt-8 pb-6 border-b border-gray-100">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-blue-500 rounded-3xl p-4 mr-4 shadow-lg">
                    {editingProduct ? (
                      <Edit2 color="white" size={28} strokeWidth={2.5} />
                    ) : (
                      <Sparkles color="white" size={28} strokeWidth={2.5} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-black text-gray-900 mb-1">
                      {editingProduct ? 'Edit Product' : 'New Product'}
                    </Text>
                    <Text className="text-sm text-gray-500 font-medium">
                      {editingProduct ? 'Update product details' : 'Add to your inventory'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="bg-gray-100 rounded-full p-3 ml-2"
                  activeOpacity={0.7}
                >
                  <X color="#6B7280" size={24} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="px-6 pt-6 pb-8" showsVerticalScrollIndicator={false}>
              <View className="mb-5">
                <Text className="text-sm font-black text-gray-700 mb-3 ml-1">
                  Product Name (Tamil) *
                </Text>
                <View
                  className="bg-gray-50 border-2 border-gray-200 rounded-3xl px-5 py-4 shadow-sm"
                  style={{
                    elevation: 1,
                  }}
                >
                  <TextInput
                    className="text-base text-gray-900 font-semibold"
                    placeholder="தினை அரிசி"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^A-Za-z\u0B80-\u0BFF ]+/g, '');
                      setFormData({ ...formData, name: cleaned });
                    }}
                  />
                </View>
              </View>

              <View className="mb-5">
                <Text className="text-sm font-black text-gray-700 mb-3 ml-1">
                  Product Name (English) *
                </Text>
                <View
                  className="bg-gray-50 border-2 border-gray-200 rounded-3xl px-5 py-4 shadow-sm"
                  style={{
                    elevation: 1,
                  }}
                >
                  <TextInput
                    className="text-base text-gray-900 font-semibold"
                    placeholder="Thinai Arisi"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name_english}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^A-Za-z\u0B80-\u0BFF ]+/g, '');
                      setFormData({ ...formData, name_english: cleaned });
                    }}
                  />
                </View>
              </View>

              <View className="mb-5">
                <Text className="text-sm font-black text-gray-700 mb-3 ml-1">
                  Weight / Quantity
                </Text>
                <View
                  className="bg-gray-50 border-2 border-gray-200 rounded-3xl px-5 py-4 shadow-sm"
                  style={{
                    elevation: 1,
                  }}
                >
                  <TextInput
                    className="text-base text-gray-900 font-semibold"
                    placeholder="500g, 1kg, etc."
                    placeholderTextColor="#9CA3AF"
                    value={formData.weight}
                    onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-black text-gray-700 mb-3 ml-1">
                  Price (₹) *
                </Text>
                <View
                  className="bg-gray-50 border-2 border-gray-200 rounded-3xl px-5 py-4 shadow-sm"
                  style={{
                    elevation: 1,
                  }}
                >
                  <TextInput
                    className="text-base text-gray-900 font-semibold"
                    placeholder="85"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={formData.price.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price: Number(text) || 0 })
                    }
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.8}
                className={`${
                  isSaving ? 'bg-gray-400' : 'bg-purple-500'
                } rounded-3xl py-5 items-center shadow-2xl mb-4`}
                style={{
                  elevation: 12,
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                }}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-lg font-black tracking-wide">
                    {editingProduct ? '✓ Update Product' : '+ Add Product'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ItemMasterScreen;