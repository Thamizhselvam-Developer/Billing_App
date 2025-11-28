// import React, { useEffect, useState, useMemo, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StatusBar,
//   ScrollView,
//   TextInput,
//   ActivityIndicator,
//   Animated,
//   Modal,
//   Keyboard,
//   Platform,
//   KeyboardAvoidingView,
// } from 'react-native';
// import {
//   Plus,
//   Trash2,
//   User,
//   Package,
//   Save,
//   FileText,
//   Search,
//   X,
//   CheckCircle,
//   AlertCircle,
//   MapPin,
//   Mail,
//   CreditCard,
//   Building2,
//   ShoppingCart,
//   ChevronDown,
//   Briefcase,
//   Smartphone,
// } from 'lucide-react-native';
// import { getProduct } from '../../services/Apis/GetItem.api';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { saveBill } from '../../services/Apis/saveBill';
// import ToastNotification from '../../components/toastModel/ToastNotification';
// import { getNextInvoice } from '../../services/Apis/getNextInvoice';
// import { Toast } from '../../components/toastModel/ToastModel';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../types_interface/navigation.type';
// type NAvigationProps = NativeStackNavigationProp<
//   RootStackParamList
// >;
// interface AddProduct {
//   id: number;
//   name: string;
//   name_english: string;
//   weight?: string;
//   price: number;
//   stock?: number;
// }

// interface CustomerDetails {
//   name: string;
//   phone: string;
//   email: string;
//   address: string;
// }

// interface BillItem {
//   id: string;
//   itemId: number;
//   itemName: string;
//   englishItemName: string;
//   quantity: number;
//   unitPrice: number;
//   amount: number;
//   weight: string;
// }


// const CreateBillScreen = () => {
//   // --- Constants & Config ---
//   const companyDetails = {
//     name: 'NETHRA FOOD PRODUCTS',
//     address: '33, Bharathidasen Street, Mutharayarpalayam, Puducherry - 605003',
//     phone: '9688537216',
//     gst: '33AAVFN1234A1Z5', // Example GST
//   };

//   const bankDetails = {
//     bankName: 'BANK OF BARODA',
//     accountNo: '69480100012900',
//     ifscCode: 'BARB0VJRAJI',
//     branch: 'Pondicherry',
//   };
// const transformBillForBackend = () => {
//   return {
//     buyer: {
//       buyer_name: customer.name.trim(),
//       phone: customer.phone.trim(),
//       address: customer.address.trim(),
//     },
//     invoice_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
//     subtotal: subTotal,
//     total: subTotal, // or add taxes if needed
//     bill_items: billItems.map(item => ({
//       item_id: item.itemId,
//       qty: item.quantity,
//       price: item.unitPrice,
//       amount: item.amount,
//       item_name: item.itemName,
//     })),
//   };
// };

//   // --- State ---
//   const [invoiceNo,setInvoiceNo] = useState('');
//   const [availableProducts, setAvailableProducts] = useState<AddProduct[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showProductModal, setShowProductModal] = useState<string | null>(null);
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

//   const [customer, setCustomer] = useState<CustomerDetails>({
//     name: '',
//     phone: '',
//     email: '',
//     address: '',
//   });
// const navigation = useNavigation<NAvigationProps>()
//   const [billItems, setBillItems] = useState<BillItem[]>([
//     {
//       id: '1',
//       itemId: 0,
//       itemName: '',
//       englishItemName: '',
//       quantity: 1,
//       unitPrice: 0,
//       amount: 0,
//       weight: '',
//     },
//   ]);

//   // --- Animations ---
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideUpAnim = useRef(new Animated.Value(100)).current;

//   // --- Effects ---
//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideUpAnim, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);
// useEffect(()=>{
//     loadInitialData();
// },[])
//   const loadInitialData = async () => {
//     setIsLoading(true);
//     try {
//      const invoice = await getNextInvoice()
//      console.log(invoice)
//      if(invoice){
//      setInvoiceNo(invoice)

//      }
//      console.log(invoice,"DD")
//       const data = await getProduct();
//       setAvailableProducts(data || []);
//     } catch (err) {
//       Toast.error('Failed to load products');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- Computations ---
//   const filteredProducts = useMemo(() => {
//     if (!searchQuery.trim()) return availableProducts;
//     const query = searchQuery.toLowerCase();
//     return availableProducts.filter(
//       p =>
//         p.name.toLowerCase().includes(query) ||
//         p.name_english.toLowerCase().includes(query),
//     );
//   }, [searchQuery, availableProducts]);

//   const subTotal = useMemo(
//     () => billItems.reduce((sum, item) => sum + item.amount, 0),
//     [billItems],
//   );
//   // --- Actions ---
//   const addNewItem = () => {
//     const newItem: BillItem = {
//       id: Date.now().toString(),
//       itemId: 0,
//       itemName: '',
//       englishItemName: '',
//       quantity: 1,
//       unitPrice: 0,
//       amount: 0,
//       weight: '',
//     };
//     setBillItems([...billItems, newItem]);
//   };

//   const removeItem = (id: string) => {
//     if (billItems.length > 1) {
//       setBillItems(prev => prev.filter(item => item.id !== id));
//     }
//   };

//   const selectProduct = (itemId: string, product: AddProduct) => {
//     setBillItems(prevItems =>
//       prevItems.map(item => {
//         if (item.id !== itemId) return item;
//         return {
//           ...item,
//           itemId: product.id,
//           itemName: product.name,
//           englishItemName: product.name_english,
//           weight: product.weight ?? '',
//           unitPrice: product.price,
//           amount: item.quantity * product.price,
//         };
//       }),
//     );
//     setShowProductModal(null);
//     setSearchQuery('');
//   };

//   const validateBillData = (): boolean => {
//     const errors: Record<string, string> = {};
//     if (!customer.name.trim()) errors.customerName = 'Name is required';
//     if (customer.phone && !/^\d{10}$/.test(customer.phone))
//       errors.customerPhone = 'Invalid phone';

//     const hasInvalidItems = billItems.some((item, idx) => {
//       if (item.itemId === 0) {
//         errors[`item_${idx}`] = 'Select a product';
//         return true;
//       }
//       return false;
//     });

//     if (subTotal <= 0) errors.total = 'Total cannot be zero';

//     setFieldErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//  const handleSaveBill = async () => {
//     const isValid = validateBillData();

//   if (!isValid) {

//     const allErrors = Object.values(fieldErrors).filter(msg => msg).join('\n');
//     Toast.error(allErrors || 'Please check the form for errors.');
//     return;
//   }
//   setIsSaving(true);
//   Keyboard.dismiss();

//   try {
//     const backendPayload = transformBillForBackend();
//     console.log("Payload to backend:", backendPayload);

//     const result = await saveBill(backendPayload); 
//     console.log(result)
//     Toast.success('Bill generated successfully!');

//     setTimeout(() => {
//       setIsSaving(false);
//      navigation.navigate('HomeScreen')
//     }, 1000);
//   } catch (error) {
//     Toast.error('Failed to save');
//     setIsSaving(false);
//   }
// };


//   const handleNameChange = (t: string) => {
//     setCustomer(prev => ({ ...prev, name: t }));
//     setFieldErrors(prev => ({ ...prev, customerName: '' }));
//   };

//   const handlePhoneChange = (t: string) => {
//     setCustomer(prev => ({ ...prev, phone: t }));
//     setFieldErrors(prev => ({ ...prev, customerPhone: '' }));
//   };

//   const handleAddressChange = (t: string) => {
//     setCustomer(prev => ({ ...prev, address: t }));
//   };

//   const SectionHeader = ({ icon: Icon, title, color = '#4F46E5' }: any) => (
//     <View className="flex-row items-center mb-4">
//       <View className={`p-2 rounded-lg bg-indigo-50 mr-3`}>
//         <Icon color={color} size={20} strokeWidth={2.5} />
//       </View>
//       <Text className="text-slate-800 font-bold text-lg tracking-tight">
//         {title}
//       </Text>
//     </View>
//   );
 

//   if (isLoading) {
//     return (
//       <View className="flex-1 bg-white justify-center items-center">
//         <ActivityIndicator size="large" color="#4F46E5" />
//         <Text className="text-slate-500 mt-4 font-medium tracking-wide">
//           Preparing Dashboard...
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1 bg-slate-50">
//       <StatusBar barStyle="dark-content" backgroundColor="#0F172A" />
//     <ToastNotification/>
//       <View className="bg-blue-900 pb-6 pt-2 px-6 shadow-lg z-10">
//         <View className="flex-row justify-between items-start">
//           <View>
//             <Text className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">
//               New Invoice
//             </Text>
//             <Text className="text-white text-2xl font-black tracking-tight">
//               Create Bill
//             </Text>
//             <Text className="text-white text-sm font-medium mt-1">
//               {companyDetails.name}
//             </Text>
//           </View>
//           <View className="items-end justify-center my-auto">
//             <View className="bg-indigo-600/20 px-3 py-1 rounded-full border border-indigo-500/30 mb-1 my-auto">
//               <Text className="text-indigo-300 text-lg font-bold">
//                 {invoiceNo}
//               </Text>
//             </View>
           
//           </View>
//         </View>
//       </View>

//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         className="flex-1"
//       >
//         <ScrollView
//           className="flex-1"
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 140 }}
//         >
//           <Animated.View
//             style={{
//               opacity: fadeAnim,
//               transform: [{ translateY: slideUpAnim }],
//             }}
//             className="px-5 pt-6 space-y-6"
//           >
//      <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
//   <SectionHeader
//     icon={User}
//     title="Customer Details"
//     color="#4F46E5"
//   />

//   {/* Customer / Business Name */}
//   <View className="mb-4 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
//     <Briefcase color="#64748B" size={20} />
//     <TextInput
//       className="flex-1 ml-3 text-slate-800 font-medium text-base"
//       placeholder="Customer / Business Name *"
//       placeholderTextColor="#94A3B8"
//       value={customer.name}
//       onChangeText={handleNameChange}
//     />
//   </View>

//   {/* Phone */}
//   <View className="mb-4 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
//   <Smartphone color="#64748B" size={20} />
//   <TextInput
//     className="flex-1 ml-3 text-slate-800 font-medium text-base"
//     placeholder="Phone"
//     placeholderTextColor="#94A3B8"
//     keyboardType="number-pad"
//     maxLength={10} // Limit to 10 digits
//     value={customer.phone}
//     onChangeText={(text) => {
//       // Remove non-digit characters
//       const digitsOnly = text.replace(/\D/g, '');
//       handlePhoneChange(digitsOnly);
//     }}
//   />
// </View>


//   {/* Delivery Address */}
//   <View className="mb-4 flex-row items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
//     <MapPin color="#64748B" size={20} style={{ marginTop: 6 }} />
//     <TextInput
//       className="flex-1 ml-3 text-slate-800 font-medium text-base"
//       placeholder="Delivery Address"
//       placeholderTextColor="#94A3B8"
//       multiline
//       numberOfLines={3}
//       value={customer.address}
//       onChangeText={handleAddressChange}
//     />
//   </View>
// </View>

//             {/* Items Section */}
//             <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
//               <View className="flex-row justify-between items-center mb-4">
//                 <SectionHeader
//                   icon={ShoppingCart}
//                   title="Items Cart"
//                   color="#F59E0B"
//                 />
//                 <TouchableOpacity
//                   onPress={addNewItem}
//                   className="bg-indigo-50 px-3 py-1.5 rounded-full flex-row items-center border border-indigo-100"
//                 >
//                   <Plus size={14} color="#4F46E5" />
//                   <Text className="text-indigo-600 text-xs font-bold ml-1">
//                     ADD ITEM
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {billItems.map((item, index) => (
//                 <View
//                   key={item.id}
//                   className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0"
//                 >
//                   <View className="flex-row justify-between mb-2">
//                     <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//                       Item #{index + 1}
//                     </Text>
//                     {billItems.length > 1 && (
//                       <TouchableOpacity onPress={() => removeItem(item.id)}>
//                         <Trash2 size={16} color="#EF4444" />
//                       </TouchableOpacity>
//                     )}
//                   </View>

//                   <TouchableOpacity
//                     onPress={() => setShowProductModal(item.id)}
//                     className={`flex-row items-center bg-slate-50 border ${
//                       fieldErrors[`item_${index}`]
//                         ? 'border-red-300'
//                         : 'border-slate-200'
//                     } rounded-xl p-3 mb-3`}
//                   >
//                     <View
//                       className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
//                         item.itemId ? 'bg-indigo-100' : 'bg-slate-200'
//                       }`}
//                     >
//                       <Package
//                         size={20}
//                         color={item.itemId ? '#4F46E5' : '#94A3B8'}
//                       />
//                     </View>
//                     <View className="flex-1">
//                       {item.itemName ? (
//                         <>
//                           <Text className="text-slate-800 font-bold text-base">
//                             {item.itemName}
//                           </Text>
//                           <Text className="text-slate-500 text-xs">
//                             {item.englishItemName}{' '}
//                             {item.weight ? `• ${item.weight}` : ''}
//                           </Text>
//                         </>
//                       ) : (
//                         <Text className="text-slate-400 font-medium italic">
//                           Tap to select product...
//                         </Text>
//                       )}
//                     </View>
//                     <ChevronDown size={16} color="#94A3B8" />
//                   </TouchableOpacity>

//                   {/* Calculations */}
//                   <View className="flex-row gap-3">
//                     <View className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
//                       <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1 ml-1">
//                         Price
//                       </Text>
//                       <View className="flex-row items-center">
//                         <Text className="text-slate-400 text-xs mr-1">₹</Text>
//                         <TextInput
//                           value={item.unitPrice.toString()}
//                           keyboardType="numeric"
//                           className="text-slate-800 font-bold text-base p-0 min-w-[40px]"
//                           onChangeText={text => {
//                             const price = parseFloat(text) || 0;
//                             setBillItems(prev =>
//                               prev.map(i =>
//                                 i.id === item.id
//                                   ? {
//                                       ...i,
//                                       unitPrice: price,
//                                       amount: i.quantity * price,
//                                     }
//                                   : i,
//                               ),
//                             );
//                           }}
//                         />
//                       </View>
//                     </View>
//                     <View className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100 items-center">
//                       <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">
//                         Qty
//                       </Text>
//                       <View className="flex-row items-center">
//                         <TouchableOpacity
//                           onPress={() => {
//                             const newQty = Math.max(1, item.quantity - 1);
//                             setBillItems(prev =>
//                               prev.map(i =>
//                                 i.id === item.id
//                                   ? {
//                                       ...i,
//                                       quantity: newQty,
//                                       amount: newQty * i.unitPrice,
//                                     }
//                                   : i,
//                               ),
//                             );
//                           }}
//                           className="bg-white rounded p-1 shadow-sm"
//                         >
//                           <Text className="text-slate-600 font-bold">-</Text>
//                         </TouchableOpacity>
//                         <Text className="mx-3 text-slate-800 font-bold text-base">
//                           {item.quantity}
//                         </Text>
//                         <TouchableOpacity
//                           onPress={() => {
//                             const newQty = item.quantity + 1;
//                             setBillItems(prev =>
//                               prev.map(i =>
//                                 i.id === item.id
//                                   ? {
//                                       ...i,
//                                       quantity: newQty,
//                                       amount: newQty * i.unitPrice,
//                                     }
//                                   : i,
//                               ),
//                             );
//                           }}
//                           className="bg-white rounded p-1 shadow-sm"
//                         >
//                           <Text className="text-slate-600 font-bold">+</Text>
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                     <View className="flex-1 bg-green-50 rounded-xl p-2 border border-green-100 justify-center items-end pr-3">
//                       <Text className="text-green-600 text-[10px] font-bold uppercase mb-0.5">
//                         Total
//                       </Text>
//                       <Text className="text-green-700 font-black text-lg">
//                         ₹{item.amount.toFixed(0)}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               ))}
//             </View>

         

//             {/* Spacer for sticky footer */}
//             <View className="h-6" />
//           </Animated.View>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* Sticky Footer & Total */}
//       <View className="absolute bottom-0 w-full bg-white border-t border-slate-200 pb-6 pt-4 px-5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">
//         <View className="flex-row justify-between items-end mb-4">
//           <View>
//             <Text className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">
//               Total Amount
//             </Text>
//             <Text className="text-slate-900 text-3xl font-black tracking-tight">
//               ₹{subTotal.toFixed(2)}
//             </Text>
//           </View>
//           <View className="bg-green-100 px-3 py-1 rounded-full">
//             <Text className="text-green-700 text-xs font-bold">
//               {billItems.length} Items
//             </Text>
//           </View>
//         </View>

//         <TouchableOpacity
//           onPress={handleSaveBill}
//           disabled={isSaving}
//           className="bg-indigo-600 w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-200 active:bg-indigo-700"
//         >
//           {isSaving ? (
//             <ActivityIndicator color="white" />
//           ) : (
//             <>
//               <Text className="text-white font-bold text-lg mr-2">
//                 Generate Invoice
//               </Text>
//               <FileText color="white" size={20} strokeWidth={2.5} />
//             </>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Product Search Modal */}
//       <Modal
//         visible={showProductModal !== null}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowProductModal(null)}
//       >
//         <View className="flex-1 bg-slate-900/60 justify-end">
//           {/* Close on tap outside */}
//           <TouchableOpacity
//             className="flex-1"
//             onPress={() => setShowProductModal(null)}
//           />

//           <View className="bg-slate-50 h-[75%] rounded-t-[32px] overflow-hidden">
//             {/* Drag Handle */}
//             <View className="w-full items-center pt-3 pb-2 bg-white">
//               <View className="w-12 h-1.5 bg-slate-300 rounded-full" />
//             </View>

//             <View className="px-5 pb-4 bg-white border-b border-slate-100">
//               <Text className="text-xl font-black text-slate-800 mb-4">
//                 Select Product
//               </Text>
//               <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-12">
//                 <Search color="#94A3B8" size={20} />
//                 <TextInput
//                   className="flex-1 ml-3 text-slate-800 font-medium text-base"
//                   placeholder="Search products..."
//                   placeholderTextColor="#94A3B8"
//                   value={searchQuery}
//                   onChangeText={setSearchQuery}
//                   autoFocus
//                 />
//                 {searchQuery.length > 0 && (
//                   <TouchableOpacity onPress={() => setSearchQuery('')}>
//                     <X size={18} color="#94A3B8" />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>

//             <ScrollView
//               className="flex-1 px-5 pt-4"
//               contentContainerStyle={{ paddingBottom: 40 }}
//             >
//               {filteredProducts.length > 0 ? (
//                 filteredProducts.map(item => (
//                   <TouchableOpacity
//                     key={item.id}
//                     onPress={() => selectProduct(showProductModal!, item)}
//                     className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row justify-between items-center active:scale-[0.98]"
//                   >
//                     <View className="flex-1">
//                       <Text className="text-slate-800 font-bold text-base mb-0.5">
//                         {item.name}
//                       </Text>
//                       <Text className="text-slate-500 text-sm mb-2">
//                         {item.name_english}
//                       </Text>
//                       <View className="flex-row gap-2">
//                         {item.weight && (
//                           <View className="bg-slate-100 px-2 py-0.5 rounded text-xs">
//                             <Text className="text-slate-600 text-xs font-bold">
//                               {item.weight}
//                             </Text>
//                           </View>
//                         )}
//                         <View className="bg-indigo-50 px-2 py-0.5 rounded text-xs">
                         
//                         </View>
//                       </View>
//                     </View>
//                     <View className="items-end">
//                       <Text className="text-lg font-black text-slate-800">
//                         ₹{item.price}
//                       </Text>
//                       <View className="bg-indigo-600 rounded-full p-1 mt-1">
//                         <Plus size={16} color="white" />
//                       </View>
//                     </View>
//                   </TouchableOpacity>
//                 ))
//               ) : (
//                 <View className="items-center py-10 opacity-50">
//                   <Package size={48} color="#94A3B8" />
//                   <Text className="text-slate-500 font-medium mt-4">
//                     No products found
//                   </Text>
//                 </View>
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default CreateBillScreen;



import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Animated,
  Modal,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Plus,
  Trash2,
  User,
  Package,
  FileText,
  Search,
  X,
  CheckCircle,
  MapPin,
  ChevronDown,
  Briefcase,
  Smartphone,
  ShoppingCart,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Services
import { getProduct } from '../../services/Apis/GetItem.api';
import { saveBill } from '../../services/Apis/saveBill';
import { getNextInvoice } from '../../services/Apis/getNextInvoice';

// Components
import ToastNotification from '../../components/toastModel/ToastNotification';
import { Toast } from '../../components/toastModel/ToastModel';

// Types
import { RootStackParamList } from '../../types_interface/navigation.type';
import { searchCustomers } from './APi/searchCustomer';

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

interface AddProduct {
  id: number;
  name: string;
  name_english: string;
  weight?: string;
  price: number;
  stock?: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface BillItem {
  id: string;
  itemId: number;
  itemName: string;
  englishItemName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  weight: string;
}

// Constants
const COMPANY_DETAILS = {
  name: 'NETHRA FOOD PRODUCTS',
  address: '33, Bharathidasen Street, Mutharayarpalayam, Puducherry - 605003',
  phone: '9688537216',
  gst: '33AAVFN1234A1Z5',
};

const BANK_DETAILS = {
  bankName: 'BANK OF BARODA',
  accountNo: '69480100012900',
  ifscCode: 'BARB0VJRAJI',
  branch: 'Pondicherry',
};

const INITIAL_BILL_ITEM: BillItem = {
  id: '1',
  itemId: 0,
  itemName: '',
  englishItemName: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
  weight: '',
};

const INITIAL_CUSTOMER: CustomerDetails = {
  name: '',
  phone: '',
  email: '',
  address: '',
};

// Utility Functions
const debounce = (func: Function, delay: number) => {
  let timeoutId: number; // NOT NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};


const CreateBillScreen = () => {
  const navigation = useNavigation<NavigationProps>();

  // State Management
  const [invoiceNo, setInvoiceNo] = useState('');
  const [availableProducts, setAvailableProducts] = useState<AddProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Customer Auto-Suggestion States
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerDetails[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  const [customer, setCustomer] = useState<CustomerDetails>(INITIAL_CUSTOMER);
  const [billItems, setBillItems] = useState<BillItem[]>([INITIAL_BILL_ITEM]);

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;

  // Debounced Customer Search
  const debouncedSearchCustomers = useRef(
    debounce(async (searchText: string) => {
      if (searchText.length < 2) {
        setCustomerSuggestions([]);
        setShowCustomerSuggestions(false);
        setIsSearchingCustomers(false);
        return;
      }

      setIsSearchingCustomers(true);
      try {
        const results = await searchCustomers(searchText);
        setCustomerSuggestions(results || []);
        // Show suggestions only if we have results
        setShowCustomerSuggestions((results || []).length > 0);
      } catch (error) {
        console.error('Customer search error:', error);
        setCustomerSuggestions([]);
        setShowCustomerSuggestions(false);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 300) // Reduced delay for faster response
  ).current;
  // Effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setShowCustomerSuggestions(false);
    });

    return () => {
      keyboardDidHide.remove();
    };
  }, []);

  // Data Loading
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [invoice, products] = await Promise.all([
        getNextInvoice(),
        getProduct(),
      ]);

      if (invoice) setInvoiceNo(invoice);
      setAvailableProducts(products || []);
    } catch (err) {
      Toast.error('Failed to load initial data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Computed Values
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts;
    const query = searchQuery.toLowerCase();
    return availableProducts.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        p.name_english.toLowerCase().includes(query),
    );
  }, [searchQuery, availableProducts]);

  const subTotal = useMemo(
    () => billItems.reduce((sum, item) => sum + item.amount, 0),
    [billItems],
  );

  // Customer Handlers
  const handleNameChange = useCallback((text: string) => {
    setCustomer(prev => ({ ...prev, name: text }));
    setFieldErrors(prev => ({ ...prev, customerName: '' }));
    debouncedSearchCustomers(text);
  }, []);

  const handlePhoneChange = useCallback((text: string) => {
    setCustomer(prev => ({ ...prev, phone: text }));
    setFieldErrors(prev => ({ ...prev, customerPhone: '' }));
  }, []);

  const handleAddressChange = useCallback((text: string) => {
    setCustomer(prev => ({ ...prev, address: text }));
  }, []);

  const selectCustomerFromSuggestion = useCallback((selectedCustomer: CustomerDetails) => {
    setCustomer({
      name: selectedCustomer.name,
      phone: selectedCustomer.phone,
      email: selectedCustomer.email || '',
      address: selectedCustomer.address,
    });
    setShowCustomerSuggestions(false);
    setCustomerSuggestions([]);
    Keyboard.dismiss();
  }, []);

  // Bill Item Handlers
  const addNewItem = useCallback(() => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      itemId: 0,
      itemName: '',
      englishItemName: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      weight: '',
    };
    setBillItems(prev => [...prev, newItem]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setBillItems(prev => (prev.length > 1 ? prev.filter(item => item.id !== id) : prev));
  }, []);

  const selectProduct = useCallback((itemId: string, product: AddProduct) => {
    setBillItems(prevItems =>
      prevItems.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          itemId: product.id,
          itemName: product.name,
          englishItemName: product.name_english,
          weight: product.weight ?? '',
          unitPrice: product.price,
          amount: item.quantity * product.price,
        };
      }),
    );
    setShowProductModal(null);
    setSearchQuery('');
  }, []);

  const updateItemQuantity = useCallback((itemId: string, delta: number) => {
    setBillItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          amount: newQty * item.unitPrice,
        };
      }),
    );
  }, []);

  const updateItemPrice = useCallback((itemId: string, priceText: string) => {
    const price = parseFloat(priceText) || 0;
    setBillItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              unitPrice: price,
              amount: item.quantity * price,
            }
          : item,
      ),
    );
  }, []);

  // Validation
  const validateBillData = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!customer.name.trim()) {
      errors.customerName = 'Customer name is required';
    }
    
    if (customer.phone && !/^\d{10}$/.test(customer.phone)) {
      errors.customerPhone = 'Phone must be 10 digits';
    }

    billItems.forEach((item, idx) => {
      if (item.itemId === 0) {
        errors[`item_${idx}`] = 'Please select a product';
      }
    });

    if (subTotal <= 0) {
      errors.total = 'Total amount cannot be zero';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [customer, billItems, subTotal]);

  // Save Bill
  const transformBillForBackend = useCallback(() => {
    return {
      buyer: {
        buyer_name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
      },
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: subTotal,
      total: subTotal,
      bill_items: billItems.map(item => ({
        item_id: item.itemId,
        qty: item.quantity,
        price: item.unitPrice,
        amount: item.amount,
        item_name: item.itemName,
      })),
    };
  }, [customer, subTotal, billItems]);

  const handleSaveBill = async () => {
    const isValid = validateBillData();

    if (!isValid) {
      const allErrors = Object.values(fieldErrors).filter(msg => msg).join('\n');
      Toast.error(allErrors || 'Please check the form for errors.');
      return;
    }

    setIsSaving(true);
    Keyboard.dismiss();

    try {
      const backendPayload = transformBillForBackend();
      await saveBill(backendPayload);
      
      Toast.success('Bill generated successfully!');

      setTimeout(() => {
        setIsSaving(false);
        navigation.navigate('HomeScreen');
      }, 1000);
    } catch (error) {
      console.error('Save bill error:', error);
      Toast.error('Failed to save bill');
      setIsSaving(false);
    }
  };

  // UI Components
  const SectionHeader = ({ icon: Icon, title, color = '#4F46E5' }: any) => (
    <View className="flex-row items-center mb-4">
      <View className="p-2 rounded-lg bg-indigo-50 mr-3">
        <Icon color={color} size={20} strokeWidth={2.5} />
      </View>
      <Text className="text-slate-800 font-bold text-lg tracking-tight">
        {title}
      </Text>
    </View>
  );

  const CustomerSuggestionsDropdown = () => (
    showCustomerSuggestions && customerSuggestions.length > 0 && (
      <View className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60">
        <ScrollView nestedScrollEnabled>
          {customerSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => selectCustomerFromSuggestion(suggestion)}
              className="p-4 border-b border-slate-100 active:bg-slate-50"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-slate-800 font-bold text-base mb-1">
                    {suggestion.name}
                  </Text>
                  <Text className="text-slate-500 text-sm mb-1">
                    📱 {suggestion.phone}
                  </Text>
                  {suggestion.address && (
                    <Text className="text-slate-400 text-xs" numberOfLines={1}>
                      📍 {suggestion.address}
                    </Text>
                  )}
                </View>
                <View className="bg-indigo-100 rounded-full p-2">
                  <CheckCircle size={16} color="#4F46E5" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  );

  const CustomerDetailsSection = () => (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <SectionHeader icon={User} title="Customer Details" color="#4F46E5" />

      {/* Customer Name with Auto-Suggestion */}
      <View className="mb-4">
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <Briefcase color="#64748B" size={20} />
          <TextInput
            className="flex-1 ml-3 text-slate-800 font-medium text-base"
            placeholder="Customer / Business Name *"
            placeholderTextColor="#94A3B8"
            value={customer.name}
            onChangeText={handleNameChange}
            onFocus={() => {
              if (customerSuggestions.length > 0) {
                setShowCustomerSuggestions(true);
              }
            }}
          />
          {isSearchingCustomers && (
            <ActivityIndicator size="small" color="#4F46E5" />
          )}
        </View>
        <CustomerSuggestionsDropdown />
      </View>

      {/* Phone */}
      <View className="mb-4 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <Smartphone color="#64748B" size={20} />
        <TextInput
          className="flex-1 ml-3 text-slate-800 font-medium text-base"
          placeholder="Phone"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          maxLength={10}
          value={customer.phone}
          onChangeText={(text) => {
            const digitsOnly = text.replace(/\D/g, '');
            handlePhoneChange(digitsOnly);
          }}
        />
      </View>

      {/* Address */}
      <View className="mb-4 flex-row items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <MapPin color="#64748B" size={20} style={{ marginTop: 6 }} />
        <TextInput
          className="flex-1 ml-3 text-slate-800 font-medium text-base"
          placeholder="Delivery Address"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
          value={customer.address}
          onChangeText={handleAddressChange}
        />
      </View>
    </View>
  );

  const BillItemCard = ({ item, index }: { item: BillItem; index: number }) => (
    <View className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
      <View className="flex-row justify-between mb-2">
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Item #{index + 1}
        </Text>
        {billItems.length > 1 && (
          <TouchableOpacity onPress={() => removeItem(item.id)}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setShowProductModal(item.id)}
        className={`flex-row items-center bg-slate-50 border ${
          fieldErrors[`item_${index}`] ? 'border-red-300' : 'border-slate-200'
        } rounded-xl p-3 mb-3`}
      >
        <View
          className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
            item.itemId ? 'bg-indigo-100' : 'bg-slate-200'
          }`}
        >
          <Package size={20} color={item.itemId ? '#4F46E5' : '#94A3B8'} />
        </View>
        <View className="flex-1">
          {item.itemName ? (
            <>
              <Text className="text-slate-800 font-bold text-base">
                {item.itemName}
              </Text>
              <Text className="text-slate-500 text-xs">
                {item.englishItemName} {item.weight ? `• ${item.weight}` : ''}
              </Text>
            </>
          ) : (
            <Text className="text-slate-400 font-medium italic">
              Tap to select product...
            </Text>
          )}
        </View>
        <ChevronDown size={16} color="#94A3B8" />
      </TouchableOpacity>

      {/* Price, Quantity, Total */}
      <View className="flex-row gap-3">
        <View className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
          <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1 ml-1">
            Price
          </Text>
          <View className="flex-row items-center">
            <Text className="text-slate-400 text-xs mr-1">₹</Text>
            <TextInput
              value={item.unitPrice.toString()}
              keyboardType="numeric"
              className="text-slate-800 font-bold text-base p-0 min-w-[40px]"
              onChangeText={text => updateItemPrice(item.id, text)}
            />
          </View>
        </View>

        <View className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100 items-center">
          <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">
            Qty
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => updateItemQuantity(item.id, -1)}
              className="bg-white rounded p-1 shadow-sm"
            >
              <Text className="text-slate-600 font-bold">-</Text>
            </TouchableOpacity>
            <Text className="mx-3 text-slate-800 font-bold text-base">
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => updateItemQuantity(item.id, 1)}
              className="bg-white rounded p-1 shadow-sm"
            >
              <Text className="text-slate-600 font-bold">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 bg-green-50 rounded-xl p-2 border border-green-100 justify-center items-end pr-3">
          <Text className="text-green-600 text-[10px] font-bold uppercase mb-0.5">
            Total
          </Text>
          <Text className="text-green-700 font-black text-lg">
            ₹{item.amount.toFixed(0)}
          </Text>
        </View>
      </View>
    </View>
  );

  const ItemsSection = () => (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <View className="flex-row justify-between items-center mb-4">
        <SectionHeader icon={ShoppingCart} title="Items Cart" color="#F59E0B" />
        <TouchableOpacity
          onPress={addNewItem}
          className="bg-indigo-50 px-3 py-1.5 rounded-full flex-row items-center border border-indigo-100"
        >
          <Plus size={14} color="#4F46E5" />
          <Text className="text-indigo-600 text-xs font-bold ml-1">
            ADD ITEM
          </Text>
        </TouchableOpacity>
      </View>

      {billItems.map((item, index) => (
        <BillItemCard key={item.id} item={item} index={index} />
      ))}
    </View>
  );

  const ProductSearchModal = () => (
    <Modal
      visible={showProductModal !== null}
      transparent
      animationType="slide"
      onRequestClose={() => setShowProductModal(null)}
    >
      <View className="flex-1 bg-slate-900/60 justify-end">
        <TouchableOpacity
          className="flex-1"
          onPress={() => setShowProductModal(null)}
        />

        <View className="bg-slate-50 h-[75%] rounded-t-[32px] overflow-hidden">
          <View className="w-full items-center pt-3 pb-2 bg-white">
            <View className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </View>

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
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            className="flex-1 px-5 pt-4"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => selectProduct(showProductModal!, item)}
                  className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row justify-between items-center active:scale-[0.98]"
                >
                  <View className="flex-1">
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
                  No products found
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const StickyFooter = () => (
    <View className="absolute bottom-0 w-full bg-white border-t border-slate-200 pb-6 pt-4 px-5 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">
      <View className="flex-row justify-between items-end mb-4">
        <View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">
            Total Amount
          </Text>
          <Text className="text-slate-900 text-3xl font-black tracking-tight">
            ₹{subTotal.toFixed(2)}
          </Text>
        </View>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-700 text-xs font-bold">
            {billItems.length} Items
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSaveBill}
        disabled={isSaving}
        className="bg-indigo-600 w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-indigo-200 active:bg-indigo-700"
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

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-slate-500 mt-4 font-medium tracking-wide">
          Preparing Dashboard...
        </Text>
      </View>
    );
  }

  // Main Render
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#0F172A" />
      <ToastNotification />

      {/* Header */}
      <View className="bg-blue-900 pb-6 pt-2 px-6 shadow-lg z-10">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">
              New Invoice
            </Text>
            <Text className="text-white text-2xl font-black tracking-tight">
              Create Bill
            </Text>
            <Text className="text-white text-sm font-medium mt-1">
              {COMPANY_DETAILS.name}
            </Text>
          </View>
          <View className="items-end justify-center my-auto">
            <View className="bg-indigo-600/20 px-3 py-1 rounded-full border border-indigo-500/30 mb-1 my-auto">
              <Text className="text-indigo-300 text-lg font-bold">
                {invoiceNo}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }}
            className="px-5 pt-6 space-y-6"
          >
            <CustomerDetailsSection />
            <ItemsSection />
            <View className="h-6" />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StickyFooter />
      <ProductSearchModal />
    </SafeAreaView>
  );
};

export default CreateBillScreen;