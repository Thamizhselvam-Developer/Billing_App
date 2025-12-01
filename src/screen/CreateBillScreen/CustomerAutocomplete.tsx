import { useCallback, useState } from "react";
import { CustomerDetails } from "../../types_interface/Bill/Bill.type";
import { Text } from "react-native";

export const CustomerAutocomplete: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  onCustomerSelect: (customer: CustomerDetails) => void;
  searchFunction: (query: string) => Promise<CustomerDetails[]>;
  error?: string;
}> = ({ value, onValueChange, onCustomerSelect, searchFunction, error }) => {
  const [suggestions, setSuggestions] = useState<CustomerDetails[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);

  const debounce = useDebounce();

  const performSearch = useCallback(
    async (searchText: string) => {
      if (searchText.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false);
        return;
      }

      try {
        const results = await searchFunction(searchText);
        const validResults = results.filter((r) => r.buyer_name);
        setSuggestions(validResults);
        setShowSuggestions(validResults.length > 0);
      } catch (error) {
        console.error('Customer search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    },
    [searchFunction]
  );

  const debouncedSearch = useCallback(debounce(performSearch, 800), [performSearch]);

  const handleTextChange = useCallback(
    (text: string) => {
      onValueChange(text);

      if (hasManuallySelected) {
        setHasManuallySelected(false);
      }

      if (text.length < 3) {
        setShowSuggestions(false);
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      debouncedSearch(text);
    },
    [onValueChange, hasManuallySelected, debouncedSearch]
  );

  const handleFocus = useCallback(() => {
    if (!hasManuallySelected && suggestions.length > 0 && value.length >= 3) {
      setShowSuggestions(true);
    }
  }, [hasManuallySelected, suggestions.length, value.length]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  const selectCustomer = useCallback(
    (customer: CustomerDetails) => {
      onCustomerSelect(customer);
      setShowSuggestions(false);
      setSuggestions([]);
      setHasManuallySelected(true);
      setIsSearching(false);
      Keyboard.dismiss();
    },
    [onCustomerSelect]
  );
const navigation = useNavigation<NavigationProps>();
 useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior if needed
    });
    return unsubscribe;
  }, [navigation]);
  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setShowSuggestions(false);
    });
    return () => keyboardDidHide.remove();
  }, []);

  return (
    <View className="mb-4">
      <View
        className={`flex-row items-center bg-slate-50 border ${
          error ? 'border-red-300' : 'border-slate-200'
        } rounded-xl px-4 py-3`}
      >
        <Briefcase color="#64748B" size={20} />
        <TextInput
          className="flex-1 ml-3 text-slate-800 font-medium text-base"
          placeholder="Customer / Business Name *"
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {isSearching && (
          <View className="ml-2">
            <ActivityIndicator size="small" color="#4F46E5" />
          </View>
        )}
      </View>

      {!hasManuallySelected && value.length > 0 && value.length < 3 && (
        <Text className="text-slate-400 text-xs mt-1.5 ml-1">
          💡 Type at least 3 characters to search previous customers
        </Text>
      )}

      {error && (
        <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">⚠️ {error}</Text>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View className="mt-2 bg-white border border-indigo-200 rounded-xl shadow-2xl max-h-64 overflow-hidden">
          <View className="px-3 py-2 bg-indigo-50 border-b border-indigo-100">
            <Text className="text-indigo-600 text-xs font-bold uppercase tracking-wide">
              📋 Previous Customers ({suggestions.length})
            </Text>
          </View>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`${suggestion.buyer_name}-${suggestion.phone}-${index}`}
                onPress={() => selectCustomer(suggestion)}
                className="p-4 border-b border-slate-100 active:bg-indigo-50"
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-slate-900 font-bold text-base mb-1.5">
                      {suggestion.buyer_name}
                    </Text>
                    {suggestion.phone && (
                      <View className="flex-row items-center mb-1">
                        <View className="bg-green-100 rounded-full px-2.5 py-1">
                          <Text className="text-green-700 text-xs font-bold">📱 {suggestion.phone}</Text>
                        </View>
                      </View>
                    )}
                    {suggestion.address && (
                      <Text className="text-slate-500 text-sm mt-1" numberOfLines={2}>
                        📍 {suggestion.address}
                      </Text>
                    )}
                  </View>
                  <View className="bg-indigo-600 rounded-full p-2 mt-1">
                    <CheckCircle size={18} color="white" strokeWidth={2.5} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
