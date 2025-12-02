// components/CustomerDetailsForm.tsx
import React from 'react';
import { View, Text, TextInput, Platform } from 'react-native';
import { User, MapPin, Smartphone } from 'lucide-react-native';
import { useBillStore } from '../zust/useBillStore';
import { CustomerAutocomplete } from '../CustomerAutocomplete';


interface CustomerDetailsFormProps {
  searchCustomers: (query: string) => Promise<any[]>;
}

const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({ searchCustomers }) => {
  // Get state from Zustand
  const customer = useBillStore((state) => state.customer);
  const errors = useBillStore((state) => state.errors);
  const updateCustomer = useBillStore((state) => state.updateCustomer);

  // Handlers
  const handleNameChange = (name: string) => {
    updateCustomer({ ...customer, buyer_name: name });
  };

  const handleCustomerSelect = (selectedCustomer: any) => {
    updateCustomer(selectedCustomer);
  };

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '').slice(0, 10);
    updateCustomer({ ...customer, phone: digitsOnly });
  };

  const handleAddressChange = (text: string) => {
    updateCustomer({ ...customer, address: text });
  };

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <View className="flex-row items-center mb-4">
        <View className="p-2 rounded-lg bg-indigo-50 mr-3">
          <User color="#4F46E5" size={20} strokeWidth={2.5} />
        </View>
        <Text className="text-slate-800 font-bold text-lg tracking-tight">
          Customer Details
        </Text>
      </View>

      {/* Name with Autocomplete */}
      <CustomerAutocomplete
        value={customer.buyer_name}
        onValueChange={handleNameChange}
        onCustomerSelect={handleCustomerSelect}
        searchFunction={searchCustomers}
        error={errors.customerName}
      />

      {/* Address */}
      <View className="flex-row items-start bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4">
        <MapPin color="#64748B" size={20} style={{ marginTop: 6 }} />
        <TextInput
          className="flex-1 ml-3 text-slate-800 font-medium text-base"
          placeholder="Delivery Address"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
          value={customer.address}
          onChangeText={handleAddressChange}
          textAlignVertical="top"
          autoComplete="off"
        />
      </View>

      {/* Phone Input with Autocomplete Prevention */}
      <View className="mb-4">
        <View
          className={`flex-row items-center bg-slate-50 border ${
            errors.customerPhone ? 'border-red-300' : 'border-slate-200'
          } rounded-xl px-4 py-3`}
        >
          <Smartphone color="#64748B" size={20} />
          <TextInput
            className="flex-1 ml-3 text-slate-800 font-medium text-base"
            placeholder="Phone Number (10 digits)"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={10}
            value={customer.phone}
            onChangeText={handlePhoneChange}
            // CRITICAL FIXES for Android autocomplete issue
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            autoCorrect={false}
            // Additional Android-specific props
            {...Platform.select({
              android: {
                importantForAutofill: 'no',
                autoComplete: 'off',
              },
            })}
          />
        </View>
        {errors.customerPhone && (
          <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">
            ⚠️ {errors.customerPhone}
          </Text>
        )}
      </View>
    </View>
  );
};

export default CustomerDetailsForm;