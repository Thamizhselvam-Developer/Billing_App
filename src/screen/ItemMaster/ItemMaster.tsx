// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StatusBar,
//   ScrollView,
//   TextInput,
//   Modal,
//   Alert,
//   ActivityIndicator,
//   Animated,
// } from 'react-native';
// import { Plus, Search, Edit2, Trash2, Package, X, Sparkles, TrendingUp, ShoppingBag } from 'lucide-react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { addNewProduct, deleteProduct, updateProduct } from '../../services/Apis/Additem.api';
// import { AddProduct, Product } from '../../types_interface/itemMaster/itemComponent.type';
// import { getProduct } from '../../services/Apis/GetItem.api';
// import { Toast } from '../../components/toastModel/ToastModel';
// import ToastNotification from '../../components/toastModel/ToastNotification';

// const ItemMasterScreen = ({ navigation }: any) => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     name_english: '',
//     weight: '500g',
//     price: 0,
//   });

//   useEffect(() => {
//     loadProducts();
//   }, []);

//   const loadProducts = async () => {
//     try {
//       setIsLoading(true);
//       const getItems = await getProduct();
//       setProducts(getItems);
//     } catch (error) {
//       Toast.error('Failed to load products');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filteredProducts =
//     products &&
//     products.filter((product) => {
//       if (!product) return false;
//       const english = (product.name_english || '').toLowerCase();
//       const tamil = product.name || '';
//       return english.includes(searchQuery.toLowerCase()) || tamil.includes(searchQuery);
//     });

//   const handleAddNew = async () => {
//     setEditingProduct(null);
//     setFormData({ name: '', name_english: '', weight: '500g', price: 0 });
//     setIsModalVisible(true);
//   };

//   const handleEdit = (product: Product) => {
//     setEditingProduct(product);
//     setFormData({
//       name: product.name,
//       name_english: product.name_english,
//       weight: product.weight,
//       price: product.price,
//     });
//     setIsModalVisible(true);
//   };

//   const handleSave = async () => {
//     if (!formData.name.trim() || !formData.name_english.trim()) {
//       Toast.error('Please fill in all required fields');
//       return;
//     }

//     if (formData.price <= 0) {
//       Toast.error('Price must be greater than 0');
//       return;
//     }

//     const newProduct: AddProduct = {
//       name: formData.name.trim(),
//       name_english: formData.name_english.trim(),
//       weight: formData.weight.trim(),
//       price: Number(formData.price),
//     };

//     setIsSaving(true);

//     if (editingProduct) {
//       try {
//         await updateProduct(editingProduct.id, newProduct);
//         const getItem = await getProduct();
//         setProducts(getItem);
//         Toast.success('Product updated successfully! 🎉');
//         setIsModalVisible(false);
//         setEditingProduct(null);
//         setFormData({ name: '', name_english: '', weight: '500g', price: 0 });
//       } catch (err) {
//         Toast.error('Failed to update product');
//       } finally {
//         setIsSaving(false);
//       }
//     } else {
//       try {
//         await addNewProduct(newProduct);
//         const getItems = await getProduct();
//         setProducts(getItems);
//         Toast.success('Product added successfully! ✨');
//         setIsModalVisible(false);
//         setFormData({ name: '', name_english: '', weight: '500g', price: 0 });
//       } catch (err) {
//         Toast.error('Failed to add product');
//       } finally {
//         setIsSaving(false);
//       }
//     }
//   };

//   const handleDelete = async (id: string) => {
//     Alert.alert(
//       '🗑️ Delete Product',
//       'This action cannot be undone. Continue?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await deleteProduct(id);
//               const gettem = await getProduct();
//               setProducts(gettem);
//               Toast.success('Product deleted successfully!');
//             } catch (err) {
//               Toast.error('Failed to delete product');
//             }
//           },
//         },
//       ]
//     );
//   };

//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 items-center justify-center">
//         <View className="items-center">
//           <ActivityIndicator size="large" color="#3B82F6" />
//           <Text className="text-gray-600 mt-4 text-lg font-semibold">Loading inventory...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
//       <ToastNotification />

//       <View className="bg-white/80 backdrop-blur-xl border-b border-gray-100">
//         <View className="px-6 pt-4 pb-6">
//           <View className="flex-row items-start justify-between mb-6">
//             <View className="flex-1">
//               <View className="flex-row items-center mb-3">
//                 <View className="bg-blue-400 rounded-2xl p-2 mr-3 shadow-lg">
//                   <ShoppingBag color="white" size={24} strokeWidth={2.5} />
//                 </View>
//                 <View>
//                   <Text className="text-3xl font-black text-gray-900 tracking-tight">
//                     Item Master
//                   </Text>
//                   <Text className="text-sm text-gray-500 font-medium mt-0.5">
//                     Inventory Management
//                   </Text>
//                 </View>
//               </View>

//               {/* Stats Pills */}
//               <View className="flex-row items-center flex-wrap">
//                 <View className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 mr-2 mb-2">
//                   <Text className="text-emerald-700 text-xs font-bold">
//                     ● {products.length} Products
//                   </Text>
//                 </View>
//                 <View className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-2">
//                   <Text className="text-blue-700 text-xs font-bold">
//                     ✓ Active
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity
//               onPress={handleAddNew}
//               activeOpacity={0.8}
//               className="bg-blue-500 rounded-3xl shadow-2xl"
//               style={{
//                 elevation: 12,
//                 shadowColor: '#3B82F6',
//                 shadowOffset: { width: 0, height: 8 },
//                 shadowOpacity: 0.4,
//                 shadowRadius: 16,
//               }}
//             >
//               <View className="px-6 py-4 flex-row items-center">
//                 <Plus color="white" size={24} strokeWidth={3} />
//                 <Text className="text-white font-black text-base ml-2">Add</Text>
//               </View>
//             </TouchableOpacity>
//           </View>

//           {/* Premium Search Bar */}
//           <View className="relative">
//             <View
//               className="bg-white rounded-3xl px-5 py-4 flex-row items-center border-2 border-gray-200 shadow-sm"
//               style={{
//                 elevation: 3,
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 2 },
//                 shadowOpacity: 0.06,
//                 shadowRadius: 8,
//               }}
//             >
//               <Search color="#9CA3AF" size={22} strokeWidth={2.5} />
//               <TextInput
//                 className="flex-1 ml-3 text-base text-gray-900 font-semibold"
//                 placeholder="Search products..."
//                 placeholderTextColor="#9CA3AF"
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//               />
//               {searchQuery.length > 0 && (
//                 <TouchableOpacity onPress={() => setSearchQuery('')} className="bg-gray-100 rounded-full p-2">
//                   <X color="#6B7280" size={18} />
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//         </View>
//       </View>

//       {/* Products Grid */}
//       <ScrollView
//         className="flex-1"
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
//       >
//         {filteredProducts.map((product, index) => (
//           <View
//             key={index}
//             className="bg-white rounded-3xl p-5 mb-4 border border-gray-100"
//             style={{
//               elevation: 4,
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: 4 },
//               shadowOpacity: 0.08,
//               shadowRadius: 12,
//             }}
//           >
//             <View className="flex-row">
//               {/* Product Icon */}
//               <View className="mr-4">
//                 <View
//                   className="bg-purple-200 rounded-3xl p-4 shadow-sm"
//                   style={{
//                     elevation: 2,
//                     shadowColor: '#9333EA',
//                     shadowOffset: { width: 0, height: 2 },
//                     shadowOpacity: 0.15,
//                     shadowRadius: 6,
//                   }}
//                 >
//                   <Package color="#9333EA" size={36} strokeWidth={2.5} />
//                 </View>
//               </View>

//               {/* Product Info */}
//               <View className="flex-1">
//                 <View className="mb-3">
//                   <Text className="text-xl font-black text-gray-900 mb-1 leading-tight">
//                     {product.name_english}
//                   </Text>
//                   <Text className="text-base text-gray-500 font-medium">
//                     {product.name}
//                   </Text>
//                 </View>

//                 {/* Tags Row */}
//                 <View className="flex-row items-center mb-4 flex-wrap">
//                   <View className="bg-blue-100 border border-blue-200 rounded-2xl px-4 py-2 mr-2 mb-2">
//                     <Text className="text-blue-700 text-sm font-bold">
//                       {product.weight}
//                     </Text>
//                   </View>
                  
//                 </View>

//                 {/* Price & Actions */}
//                 <View className="flex-row items-center justify-between">
//                   <View className="flex-row items-end">
//                     <Text className="text-3xl font-black text-emerald-600">
//                       ₹{product.price}
//                     </Text>
//                     <View className="ml-2 mb-1 bg-emerald-100 rounded-full p-1.5">
//                       <TrendingUp color="#059669" size={16} strokeWidth={2.5} />
//                     </View>
//                   </View>

//                   {/* Action Buttons */}
//                   <View className="flex-row items-center">
//                     <TouchableOpacity
//                       onPress={() => handleEdit(product)}
//                       activeOpacity={0.7}
//                       className="bg-blue-100 border border-blue-200 rounded-2xl px-4 py-3 mr-2 shadow-sm"
//                       style={{
//                         elevation: 2,
//                         shadowColor: '#3B82F6',
//                         shadowOffset: { width: 0, height: 2 },
//                         shadowOpacity: 0.15,
//                         shadowRadius: 4,
//                       }}
//                     >
//                       <Edit2 color="#3B82F6" size={20} strokeWidth={2.5} />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => handleDelete(product.id)}
//                       activeOpacity={0.7}
//                       className="bg-red-100 border border-red-200 rounded-2xl px-4 py-3 shadow-sm"
//                       style={{
//                         elevation: 2,
//                         shadowColor: '#EF4444',
//                         shadowOffset: { width: 0, height: 2 },
//                         shadowOpacity: 0.15,
//                         shadowRadius: 4,
//                       }}
//                     >
//                       <Trash2 color="#EF4444" size={20} strokeWidth={2.5} />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </View>
//         ))}

//         {/* Premium Empty State */}
//         {filteredProducts.length === 0 && (
//           <View className="items-center justify-center py-20 px-6">
//             <View className="bg-blue-300 rounded-full p-12 mb-6 shadow-lg">
//               <Package color="#D1D5DB" size={80} strokeWidth={1.5} />
//             </View>
//             <Text className="text-gray-900 text-2xl font-black mb-3 text-center">
//               {searchQuery ? 'No Results Found' : 'Start Your Inventory'}
//             </Text>
//             <Text className="text-gray-500 text-base text-center mb-6 px-4 leading-relaxed">
//               {searchQuery
//                 ? 'Try adjusting your search terms'
//                 : 'Add your first product to get started with inventory management'}
//             </Text>
//             {!searchQuery && (
//               <TouchableOpacity
//                 onPress={handleAddNew}
//                 className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl px-8 py-4 shadow-xl"
//                 style={{
//                   elevation: 8,
//                   shadowColor: '#3B82F6',
//                   shadowOffset: { width: 0, height: 4 },
//                   shadowOpacity: 0.3,
//                   shadowRadius: 8,
//                 }}
//               >
//                 <View className="flex-row items-center">
//                   <Plus color="white" size={22} strokeWidth={3} />
//                   <Text className="text-white font-black text-base ml-2">Add Product</Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
//       </ScrollView>

//       {/* Premium Modal */}
//       <Modal
//         visible={isModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setIsModalVisible(false)}
//       >
//         <View className="flex-1 bg-black/70 justify-end">
//           <View
//             className="bg-white rounded-t-[40px]"
//             style={{
//               maxHeight: '92%',
//               elevation: 24,
//               shadowColor: '#000',
//               shadowOffset: { width: 0, height: -8 },
//               shadowOpacity: 0.3,
//               shadowRadius: 20,
//             }}
//           >
//             {/* Modal Header */}
//             <View className="px-6 pt-8 pb-6 border-b border-gray-100">
//               <View className="flex-row items-center justify-between">
//                 <View className="flex-row items-center flex-1">
//                   <View className="bg-blue-500 rounded-3xl p-4 mr-4 shadow-lg">
//                     {editingProduct ? (
//                       <Edit2 color="white" size={28} strokeWidth={2.5} />
//                     ) : (
//                       <Sparkles color="white" size={28} strokeWidth={2.5} />
//                     )}
//                   </View>
//                   <View className="flex-1">
//                     <Text className="text-2xl font-black text-gray-900 mb-1">
//                       {editingProduct ? 'Edit Product' : 'New Product'}
//                     </Text>
//                     <Text className="text-sm text-gray-500 font-medium">
//                       {editingProduct ? 'Update product details' : 'Add to your inventory'}
//                     </Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity
//                   onPress={() => setIsModalVisible(false)}
//                   className="bg-gray-100 rounded-full p-3 ml-2"
//                   activeOpacity={0.7}
//                 >
//                   <X color="#6B7280" size={24} strokeWidth={2.5} />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <ScrollView className="px-6 pt-6 pb-8" showsVerticalScrollIndicator={false}>
//               <View className="mb-5">
//                 <Text className="text-sm font-black text-gray-700 mb-3 ml-1">
//                   Product Name (Tamil) *
//                 </Text>
//                 <View
//                   className="bg-gray-50 border-2 border-gray-200 rounded-3xl px-5 py-4 shadow-sm"
//                   style={{
//                     elevation: 1,
//                   }}
//                 >
//                   <TextInput
//                     className="text-base text-gray-900 font-semibold"
//                     placeholder="தினை அரிசி"
//                     placeholderTextColor="#9CA3AF"
//                     value={formData.name}
//                     onChangeText={(text) => {
//                       const cleaned = text.replace(/[^A-Za-z\u0B80-\u0BFF ]+/g, '');
//                       setFormData({ ...formData, name: cleaned });
//                     }}
//                   />
//                 </View>
//               </View>

//               <View className="mb-5">
//                 <Text className="text-sm font-black text-gray-700 mb-3 ml-1">
//                   Product Name (English) *
//                 </Text>
//                 <View
//                   className="bg-gray-50 border-2 border-gray-200 rounded-3xl px-5 py-4 shadow-sm"
//                   style={{
//                     elevation: 1,
//                   }}
//                 >
//                   <TextInput
//                     className="text-base text-gray-900 font-semibold"
//                     placeholder="Thinai Arisi"
//                     placeholderTextColor="#9CA3AF"
//                     value={formData.name_english}
//                     onChangeText={(text) => {
//                       const cleaned = text.replace(/[^A-Za-z\u0B80-\u0BFF ]+/g, '');
//                       setFormData({ ...formData, name_english: cleaned });
//                     }}
//                   />
//                 </View>
//               </View>

//               <View className="mb-5">
//                 <Text className="text-sm font-black text-gray-700 mb-3 ml-1">
//                   Weight / Quantity
//                 </Text>
//                 <View
//                   className="bg-gray-50 border-2 border-gray-200 rounded-3xl px-5 py-4 shadow-sm"
//                   style={{
//                     elevation: 1,
//                   }}
//                 >
//                   <TextInput
//                     className="text-base text-gray-900 font-semibold"
//                     placeholder="500g, 1kg, etc."
//                     placeholderTextColor="#9CA3AF"
//                     value={formData.weight}
//                     onChangeText={(text) => setFormData({ ...formData, weight: text })}
//                   />
//                 </View>
//               </View>

//               <View className="mb-6">
//                 <Text className="text-sm font-black text-gray-700 mb-3 ml-1">
//                   Price (₹) *
//                 </Text>
//                 <View
//                   className="bg-gray-50 border-2 border-gray-200 rounded-3xl px-5 py-4 shadow-sm"
//                   style={{
//                     elevation: 1,
//                   }}
//                 >
//                   <TextInput
//                     className="text-base text-gray-900 font-semibold"
//                     placeholder="85"
//                     placeholderTextColor="#9CA3AF"
//                     keyboardType="numeric"
//                     value={formData.price.toString()}
//                     onChangeText={(text) =>
//                       setFormData({ ...formData, price: Number(text) || 0 })
//                     }
//                   />
//                 </View>
//               </View>

//               <TouchableOpacity
//                 onPress={handleSave}
//                 disabled={isSaving}
//                 activeOpacity={0.8}
//                 className={`${
//                   isSaving ? 'bg-gray-400' : 'bg-purple-500'
//                 } rounded-3xl py-5 items-center shadow-2xl mb-4`}
//                 style={{
//                   elevation: 12,
//                   shadowColor: '#3B82F6',
//                   shadowOffset: { width: 0, height: 6 },
//                   shadowOpacity: 0.4,
//                   shadowRadius: 12,
//                 }}
//               >
//                 {isSaving ? (
//                   <ActivityIndicator color="white" size="small" />
//                 ) : (
//                   <Text className="text-white text-lg font-black tracking-wide">
//                     {editingProduct ? '✓ Update Product' : '+ Add Product'}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default ItemMasterScreen;


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
import { Plus, Search, Edit2, Trash2, Package, X, Sparkles, TrendingUp, ShoppingBag, Archive, ChevronRight } from 'lucide-react-native';
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
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="items-center">
          <View className="bg-blue-100 rounded-full p-6 mb-4">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
          <Text className="text-slate-700 text-base font-bold">Loading inventory...</Text>
          <Text className="text-slate-500 text-sm mt-1">Please wait</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ToastNotification />

      {/* SUPER ENHANCED HEADER */}
      <View className="bg-white border-b border-slate-200">
        <View className="px-5 pt-2 pb-5">
          {/* Top Navigation Bar */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center flex-1">
              <View 
                className="bg-indigo-600 rounded-2xl p-2.5 mr-3"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Archive color="white" size={24} strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-slate-900 tracking-tight">
                  Item Master
                </Text>
                <Text className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage your inventory efficiently
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAddNew}
              activeOpacity={0.7}
              className="bg-blue-600 rounded-2xl"
              style={{
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="px-5 py-3 flex-row items-center">
                <Plus color="white" size={20} strokeWidth={2.5} />
                <Text className="text-white font-bold text-sm ml-1.5">Add New</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats Dashboard */}
          <View className="flex-row items-center mb-5 -mx-1">
            <View className="flex-1 mx-1">
              <View 
                className="bg-white rounded-2xl p-4 border-gray-700 "
                style={{
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-emerald-600 text-xs font-bold uppercase tracking-wide">
                    Total Items
                  </Text>
                  <View className="bg-emerald-500 rounded-lg px-2 py-0.5">
                    <Text className="text-white text-xs font-black">●</Text>
                  </View>
                </View>
                <Text className="text-emerald-900 text-3xl font-black">{products.length}</Text>
                <Text className="text-emerald-600 text-xs font-semibold mt-1">Products in stock</Text>
              </View>
            </View>

            <View className="flex-1 mx-1">
              <View 
                className="bg-white rounded-2xl p-4 border-gray-600"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-blue-600 text-xs font-bold uppercase tracking-wide">
                    Status
                  </Text>
                  <View className="bg-blue-500 rounded-lg px-2 py-0.5">
                    <Text className="text-white text-xs font-black">✓</Text>
                  </View>
                </View>
                <Text className="text-blue-900 text-3xl font-black">Active</Text>
                <Text className="text-blue-600 text-xs font-semibold mt-1">All systems go</Text>
              </View>
            </View>
          </View>

          {/* Premium Search Bar */}
          <View className="relative">
            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
              <Search color="#94A3B8" size={20} strokeWidth={2.5} />
            </View>
            <TextInput
              className="bg-slate-100 rounded-2xl pl-12 pr-12 py-4 text-sm text-slate-900 font-semibold border-2 border-slate-200"
              placeholder="Search products by name..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                className="absolute right-3 top-0 bottom-0 justify-center"
              >
                <View className="bg-slate-300 rounded-full p-1.5">
                  <X color="#475569" size={14} strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* SUPER ENHANCED PRODUCT LIST */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {filteredProducts.map((product, index) => (
          <View
            key={index}
            className="bg-white rounded-3xl mb-3 border border-slate-200 overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="p-4">
              <View className="flex-row items-start">
                {/* Enhanced Product Icon */}
                <View className="mr-4">
                  <View 
                    className="bg-white rounded-2xl p-4 border border-purple-200"
                    style={{
                      shadowColor: '#7C3AED',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Package color="#7C3AED" size={32} strokeWidth={2.5} />
                  </View>
                </View>

                {/* Product Details */}
                <View className="flex-1">
                  {/* Product Names */}
                  <View className="mb-3">
                    <Text className="text-lg font-bold text-slate-900 mb-1 leading-tight">
                      {product.name_english}
                    </Text>
                    <Text className="text-sm text-slate-500 font-medium">
                      {product.name}
                    </Text>
                  </View>

                  {/* Weight Badge */}
                  <View className="mb-3">
                    <View className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 self-start">
                      <Text className="text-slate-700 text-xs font-bold uppercase tracking-wide">
                        📦 {product.weight}
                      </Text>
                    </View>
                  </View>

                  {/* Price Section with Actions */}
                  <View className="flex-row items-center justify-between pt-2 ">
                    {/* Price Display */}
                    <View className="flex-row items-center">
                      <View>
                        <Text className="text-xs text-slate-500 font-semibold mb-0.5">Price</Text>
                        <View className="flex-row items-end">
                          <Text className="text-2xl font-black text-emerald-600">
                            ₹{product.price}
                          </Text>
                          <View className="ml-2 mb-1 bg-emerald-500 rounded-lg px-2 py-1">
                            <Text className="text-white text-xs font-bold">ACTIVE</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => handleEdit(product)}
                        activeOpacity={0.7}
                        className="bg-blue-50 border-2 border-blue-200 rounded-xl p-2.5 mr-2"
                        style={{
                          shadowColor: '#3B82F6',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <Edit2 color="#3B82F6" size={18} strokeWidth={2.5} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(product.id)}
                        activeOpacity={0.7}
                        className="bg-red-50 border-2 border-red-200 rounded-xl p-2.5"
                        style={{
                          shadowColor: '#EF4444',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <Trash2 color="#EF4444" size={18} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}

        {filteredProducts.length === 0 && (
          <View className="items-center justify-center py-16 px-6">
            <View 
              className="bg-blue-500 rounded-3xl p-12 mb-6 border-2 border-slate-300"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Package color="#94A3B8" size={72} strokeWidth={1.5} />
            </View>
            <Text className="text-slate-900 text-2xl font-black mb-2 text-center">
              {searchQuery ? 'No Results Found' : 'No Products Yet'}
            </Text>
            <Text className="text-slate-500 text-base text-center mb-8 px-4 leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search terms or clear the filter'
                : 'Start building your inventory by adding your first product'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={handleAddNew}
                activeOpacity={0.8}
                className="bg-blue-600 rounded-2xl px-8 py-4"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center">
                  <Plus color="white" size={22} strokeWidth={2.5} />
                  <Text className="text-white font-black text-base ml-2">Add Your First Product</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* SUPER ENHANCED MODAL */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            className="bg-white rounded-t-[32px]"
            style={{
              maxHeight: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 24,
            }}
          >
            {/* Enhanced Modal Header */}
            <View className="px-5 pt-6 pb-5 border-b border-slate-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View 
                    className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-3.5 mr-3"
                    style={{
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    {editingProduct ? (
                      <Edit2 color="white" size={26} strokeWidth={2.5} />
                    ) : (
                      <Sparkles color="white" size={26} strokeWidth={2.5} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-black text-slate-900">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </Text>
                    <Text className="text-xs text-slate-500 font-semibold mt-1">
                      {editingProduct ? 'Update the product details below' : 'Fill in the product information'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="bg-slate-100 rounded-xl p-2.5"
                  activeOpacity={0.7}
                >
                  <X color="#64748B" size={22} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="px-5 pt-5 pb-6" showsVerticalScrollIndicator={false}>
              {/* Form Fields with Enhanced Design */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="bg-blue-100 rounded-lg p-1 mr-2">
                    <Text className="text-blue-600 text-xs font-black">1</Text>
                  </View>
                  <Text className="text-xs font-black text-slate-700 uppercase tracking-wide">
                    Product Name (Tamil) *
                  </Text>
                </View>
                <View 
                  className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <TextInput
                    className="text-base text-slate-900 font-bold"
                    placeholder="தினை அரிசி"
                    placeholderTextColor="#94A3B8"
                    value={formData.name}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^A-Za-z\u0B80-\u0BFF ]+/g, '');
                      setFormData({ ...formData, name: cleaned });
                    }}
                  />
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="bg-blue-100 rounded-lg p-1 mr-2">
                    <Text className="text-blue-600 text-xs font-black">2</Text>
                  </View>
                  <Text className="text-xs font-black text-slate-700 uppercase tracking-wide">
                    Product Name (English) *
                  </Text>
                </View>
                <View 
                  className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <TextInput
                    className="text-base text-slate-900 font-bold"
                    placeholder="Foxtail Millet Rice"
                    placeholderTextColor="#94A3B8"
                    value={formData.name_english}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^A-Za-z\u0B80-\u0BFF ]+/g, '');
                      setFormData({ ...formData, name_english: cleaned });
                    }}
                  />
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="bg-blue-100 rounded-lg p-1 mr-2">
                    <Text className="text-blue-600 text-xs font-black">3</Text>
                  </View>
                  <Text className="text-xs font-black text-slate-700 uppercase tracking-wide">
                    Weight / Quantity
                  </Text>
                </View>
                <View 
                  className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <TextInput
                    className="text-base text-slate-900 font-bold"
                    placeholder="500g, 1kg, 2kg"
                    placeholderTextColor="#94A3B8"
                    value={formData.weight}
                    onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  />
                </View>
              </View>

              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <View className="bg-emerald-100 rounded-lg p-1 mr-2">
                    <Text className="text-emerald-600 text-xs font-black">₹</Text>
                  </View>
                  <Text className="text-xs font-black text-slate-700 uppercase tracking-wide">
                    Price (₹) *
                  </Text>
                </View>
                <View 
                  className="bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <TextInput
                    className="text-base text-slate-900 font-bold"
                    placeholder="85"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={formData.price.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price: Number(text) || 0 })
                    }
                  />
                </View>
              </View>

              {/* Enhanced Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.8}
                className={`${
                  isSaving ? 'bg-slate-400' : 'bg-blue-500'
                } rounded-2xl py-4 items-center mb-4`}
                style={{
                  shadowColor: isSaving ? '#94A3B8' : '#3B82F6',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 10,
                }}
              >
                {isSaving ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white text-base font-black ml-2">Saving...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-base font-black tracking-wide">
                    {editingProduct ? '✓ Update Product' : '+ Add Product'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.7}
                className="bg-slate-100 rounded-2xl py-3.5 items-center"
              >
                <Text className="text-slate-600 text-sm font-bold">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ItemMasterScreen;