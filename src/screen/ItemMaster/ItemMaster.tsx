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
} from 'react-native';
import { Plus, Search, Edit2, Trash2, Package, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addNewProduct, deleteProduct, updateProduct } from '../../services/Apis/Additem.api';
import { AddProduct, Product } from '../../types_interface/itemMaster/itemComponent.type';
import { getProduct } from '../../services/Apis/GetItem.api';



const ItemMasterScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<Product[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_english: '',
    weight: '500g',
    price: 0,

  });
useEffect(()=>{
  (async()=>{
  const getItems =await getProduct()
  setProducts(getItems)
  })
  ();
},[])
console.log(products.map((item)=>item),"DDDDDDDD")
const filteredProducts =
  products &&
  products.filter((product) => {
    if (!product) return false; 
    const english = (product.name_english || "").toLowerCase();
    const tamil = product.name || "";

    return (
      english.includes(searchQuery.toLowerCase()) ||
      tamil.includes(searchQuery)
    );
  });


const handleAddNew = async () => {
 setIsModalVisible(true)
  const product: AddProduct = {
    name: '',
    name_english: '',
    weight: '500g',
    price: 0,
  };

  
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

  // const handleDelete = (id: string) => {
  //   setProducts(products.filter((p) => p.id !== id));
  // };

const handleSave = async () => {
  const newProduct: AddProduct = {
    name: formData.name,
    name_english: formData.name_english,
    weight: formData.weight,
    price: Number(formData.price),
  };

  if (editingProduct) {
    try {
      const updated = await updateProduct(editingProduct.id, newProduct);
      console.log(updated)
      const getItem = await getProduct()
      setProducts(getItem)
      Alert.alert('Product updated successfully!');
    } catch (err) {
      Alert.alert('Failed to update product. Check console.');
    }
  } else {
    try {
      const result = await addNewProduct(newProduct);
      setProducts([...products, result]);
      const getItems = await getProduct()
        setProducts(getItems)
      Alert.alert('Product added successfully!');
    } catch (err) {
      Alert.alert('Failed to add product. Check console.');
    }
  }

  setIsModalVisible(false);
  setEditingProduct(null);
  setFormData({ name: '', name_english: '', weight: '500g', price: 0});
};

const handleDelete = async (id: string) => {
  Alert.alert(
    'Delete Product',
    'Are you sure you want to delete this product?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id);
            const gettem =await getProduct()
            setProducts(gettem)
            Alert.alert('Product deleted successfully!');
          } catch (err) {
            Alert.alert('Failed to delete product. Check console.');
          }
        },
      },
    ]
  );
};



  const getStockColor = (stock: number) => {
    if (stock < 20) return 'text-red-500 bg-red-50';
    if (stock < 40) return 'text-orange-500 bg-orange-50';
    return 'text-green-500 bg-green-50';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="bg-white shadow-md">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-3xl font-extrabold text-gray-800">📦 Item Master</Text>
              <Text className="text-sm text-gray-500 mt-1">
                {products.length} Products Available
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleAddNew}
              className="bg-blue-500 rounded-full p-3 shadow-lg active:opacity-80"
              style={{
                elevation: 5,
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            >
              <Plus color="white" size={24} />
            </TouchableOpacity>
          </View>

          <View className="bg-gray-100 rounded-2xl px-4 py-3 flex-row items-center">
            <Search color="#9CA3AF" size={20} />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-800"
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>


      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-6 pt-4">
          {filteredProducts.map((product) => (
            <View
              key={product.id}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
              style={{
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <View className="flex-row items-start">
                <View className="bg-purple-50 rounded-xl p-3 mr-3">
                  <Package color="#9333EA" size={28} />
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">
                    {product.name_english}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">{product.name}</Text>

                  <View className="flex-row items-center mt-3 flex-wrap">
                    <View className="bg-blue-50 rounded-lg px-3 py-1 mr-2 mb-2">
                      <Text className="text-blue-600 text-xs font-semibold">
                        {product.weight}
                      </Text>
                    </View>
                   
                  </View>

                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-2xl font-bold text-green-600">
                      ₹{product.price}
                    </Text>

                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => handleEdit(product)}
                        className="bg-blue-50 rounded-full p-2 mr-2"
                      >
                        <Edit2 color="#3B82F6" size={18} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(product.id)}
                        className="bg-red-50 rounded-full p-2"
                      >
                        <Trash2 color="#EF4444" size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {filteredProducts.length === 0 && (
            <View className="items-center justify-center py-20">
              <Package color="#D1D5DB" size={64} />
              <Text className="text-gray-400 text-lg font-semibold mt-4">
                No products found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            <View className="px-6 pt-6 pb-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="bg-gray-100 rounded-full p-2"
                >
                  <X color="#6B7280" size={24} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="px-6 pt-4 pb-6">
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Product Name (Tamil)
                </Text>
             <TextInput
  className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800"
  placeholder="தினை அரிசி"
  value={formData.name}
  onChangeText={(text) => {
    // Tamil Unicode range: \u0B80–\u0BFF
    const cleaned = text.replace(/[^A-Za-z\u0B80-\u0BFF ]+/g, "");
    setFormData({ ...formData, name: cleaned });
  }}
/>

              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Product Name (English)
                </Text>
       <TextInput
  className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800"
  placeholder="Thinai Arisi"
  value={formData.name_english}
  onChangeText={(text) => {
    const cleaned = text.replace(/[^A-Za-z\u0B80-\u0BFF ]+/g, "");
    setFormData({ ...formData, name_english: cleaned });
  }}
/>


              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Weight</Text>
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800"
                  placeholder="500g"
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Price (₹)</Text>
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800"
                  placeholder="85"
                  keyboardType="numeric"
                  value={formData.price.toString()}
                  onChangeText={(text) => setFormData({ ...formData, price:  Number(text)  })}
                />
              </View>

              

           

              <TouchableOpacity
                onPress={handleSave}
                className="bg-blue-500 rounded-2xl py-4 items-center shadow-lg active:opacity-80"
                style={{
                  elevation: 5,
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <Text className="text-white text-lg font-bold">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ItemMasterScreen;