
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


import { RootStackParamList } from '../../types_interface/navigation.type';
import { useBillStore } from './zust/useBillStore';
import { getNextInvoiceNumber } from '../../services/Apis/Bill.api';
import { getProduct } from '../../services/Apis/GetItem.api';
import { Toast } from '../../components/toastModel/ToastModel';
import { searchCustomers } from './APi/searchCustomer';
import { saveBill } from '../../services/Apis/saveBill';
import ToastNotification from '../../components/toastModel/ToastNotification';
import CustomerDetailsForm from './sub/CustomerDetailForm';
import { BillItemsSection } from './sub/BillItemSection';
import { BillFooter } from './sub/BillFooter';
import ProductSearchModal from './sub/ProductSearchModel';


type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const COMPANY_DETAILS = {
  name: 'NETHRA FOOD PRODUCTS',
  address: '33, Bharathidasen Street, Mutharayarpalayam, Puducherry - 605003',
  phone: '9688537216',
  gst: '33AAVFN1234A1Z5',
};

const CreateBillScreen = () => {
  const navigation = useNavigation<NavigationProps>();

  const invoiceNo = useBillStore((state) => state.invoiceNo);
  const isLoading = useBillStore((state) => state.isLoading);
  const errors = useBillStore((state) => state.errors);

  const setInvoiceNo = useBillStore((state) => state.setInvoiceNo);
  const setAvailableProducts = useBillStore((state) => state.setAvailableProducts);
  const setIsLoading = useBillStore((state) => state.setIsLoading);
  const setIsSaving = useBillStore((state) => state.setIsSaving);
  const validateForm = useBillStore((state) => state.validateForm);
  const buildBillPayload = useBillStore((state) => state.buildBillPayload);
  const resetBill = useBillStore((state) => state.resetBill);


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;


  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


useEffect(() => {
  resetBill();
  loadInitialData();
}, []);
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [invoice, products] = await Promise.all([
        getNextInvoiceNumber(),
        getProduct(),
      ]);
      console.log('Invoice Number:', invoice);
console.log('Products:', products);
      if (invoice) setInvoiceNo(invoice);
      setAvailableProducts(products || []);
    } catch (err) {
      Toast.error('Failed to load initial data');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCustomers = async (query: string) => {
    try {
      const results = await searchCustomers(query);
      return (results || []).map((result: any) => ({
        buyer_name: result.buyer_name || '',
        phone: result.phone || '',
        email: result.email || '',
        address: result.address || '',
      }));
    } catch (error) {
      console.error('Customer search error:', error);
      return [];
    }
  };

  // Handle save bill
  const handleSaveBill = async () => {
    const isValid = validateForm();

    if (!isValid) {
      const errorMessages = Object.entries(errors)
        .filter(([key, msg]) => msg)
        .map(([_, msg]) => msg)
        .join('\n');

      Toast.error(errorMessages || 'Please check the form for errors.');
      return;
    }

    setIsSaving(true);
    Keyboard.dismiss();

    try {
      const payload = buildBillPayload();
      await saveBill(payload);

      Toast.success('Bill generated successfully!');

      setTimeout(() => {
        resetBill();
        setIsSaving(false);
        navigation.navigate('HomeScreen');
      }, 1000);
    } catch (error) {
      console.error('Save bill error:', error);
      Toast.error('Failed to save bill. Please try again.');
      setIsSaving(false);
    }
  };

  // Loading state
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

  // Main render
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
                {invoiceNo || 'Loading...'}
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
          keyboardShouldPersistTaps="handled"
        >
        
            {/* Customer Details Section - Only needs searchCustomers prop */}
            <CustomerDetailsForm searchCustomers={handleSearchCustomers} />

            {/* Bill Items Section - No props needed at all! */}
            <BillItemsSection />

            <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Footer - Only needs onSave callback */}
      <BillFooter onSave={handleSaveBill} />

      {/* Product Search Modal - No props needed! */}
      <ProductSearchModal />
    </SafeAreaView>
  );
};

export default CreateBillScreen;