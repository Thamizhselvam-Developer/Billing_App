import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  StatusBar,
  RefreshControl,
  Animated,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  Search,
  X,
  Filter,
  Calendar,
  Download,
  Share2,
  Printer,
  Eye,
  ChevronRight,
  FileText,
  User,
  Phone,
  MapPin,
  IndianRupee,
  Clock,
  TrendingUp,
  Package,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import Pdf from 'react-native-pdf';
import axios from 'axios';
import { API_URL } from '@env';
import { Toast } from '../../components/toastModel/ToastModel';

interface BillItem {
  item_id: number;
  item_name: string;
  name_english: string;
  qty: number;
  price: number;
  amount: number;
}

interface Buyer {
  id: number;
  buyer_name: string;
  phone: string;
  address: string;
}

interface Bill {
  id: number;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  total: number;
  buyer: Buyer;
  items: BillItem[];
  pdf_url?: string;
}


type FilterPeriod = 'all' | '7days' | '1month' | '3months' | '6months' | '1year' | 'custom';

interface FilterState {
  period: FilterPeriod;
  searchQuery: string;
  minAmount?: number;
  maxAmount?: number;
  customStartDate?: string;
  customEndDate?: string;
}

const BillHistoryScreen = () => {
  // State Management
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBillDetailModal, setShowBillDetailModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    period: 'all',
    searchQuery: '',
  });

  // Animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    loadBills();
  }, []);

  // API Call - Load Bills
 const loadBills = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get(`${API_URL}api/bills/all`);

    const rawBills = response.data.data;
  const mappedBills: Bill[] = rawBills
  .filter((b: any) => b.isgenerated === true) // only include generated bills
  .map((b: any) => ({
    id: b.id,
    invoice_number: b.invoice_number,
    invoice_date: b.invoice_date,
    subtotal: b.subtotal,
    total: b.total,
    pdf_url: b.pdf_url,
    isgenerated: b.isgenerated,
    buyer: {
      id: b.buyer.id,
      buyer_name: b.buyer.buyer_name,
      phone: b.buyer.phone,
      address: b.buyer.address,
    },
    items: b.items,
  }));

    setBills(mappedBills);
  } catch (err) {
    console.error('Load bills error:', err);
  } finally {
    setIsLoading(false);
  }
};

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadBills();
    setIsRefreshing(false);
  };

  // Filter Logic
  const getDateRangeFilter = (period: FilterPeriod) => {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return null;
    }

    return startDate;
  };

  const filteredBills = useMemo(() => {
    let filtered = [...bills];

    // Search Filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        bill =>
          bill.invoice_number.toLowerCase().includes(query) ||
          bill.buyer.buyer_name.toLowerCase().includes(query) ||
          bill.buyer.phone.includes(query)
      );
    }

    // Date Range Filter
    if (filters.period !== 'all') {
      const startDate = getDateRangeFilter(filters.period);
      if (startDate) {
        filtered = filtered.filter(bill => {
          const billDate = new Date(bill.invoice_date);
          return billDate >= startDate;
        });
      }
    }

    // Amount Range Filter
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(bill => bill.total >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(bill => bill.total <= filters.maxAmount!);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => 
      new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
    );

    return filtered;
  }, [bills, filters]);

  // Statistics
  const statistics = useMemo(() => {
    const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalBills = filteredBills.length;
    const averageAmount = totalBills > 0 ? totalAmount / totalBills : 0;

    return { totalAmount, totalBills, averageAmount };
  }, [filteredBills]);

  const handleViewPdf = async (bill: Bill) => {
    if (bill.pdf_url) {
      setCurrentPdfUrl(`${API_URL}${bill.pdf_url}`);
      console.log(currentPdfUrl,"CURRETN")
      setShowPdfModal(true);
    } else {
      console.log('Generate PDF for bill:', bill.id);
    }
  };
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        // Android 13+ doesn't need storage permission for scoped storage
        return true;
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to save PDF files',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

const handleDownloadPdf = async (bill: Bill) => {
  try {
    if (!bill.pdf_url) {
      Alert.alert('Error', 'PDF URL not available');
      return;
    }

    setDownloading(true); // START LOADER

    const pdfUrl = `${API_URL}${bill.pdf_url}`;
    const fileName = `Bill_${bill.invoice_number}.pdf`;

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      setDownloading(false); // STOP LOADER
      Alert.alert('Permission Denied', 'Storage permission is required to download');
      return;
    }

    const { fs } = ReactNativeBlobUtil;
    let downloadDir = fs.dirs.DownloadDir;
    if (Platform.OS === 'ios') downloadDir = fs.dirs.DocumentDir;

    const filePath = `${downloadDir}/${fileName}`;

    const configOptions =
      Platform.OS === 'android'
        ? {
            fileCache: true,
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              mediaScannable: true,
              title: fileName,
              description: 'Downloading invoice PDF',
              mime: 'application/pdf',
              path: filePath,
            },
          }
        : { fileCache: true, path: filePath };

    Toast.success('Download started...');

    const response = await ReactNativeBlobUtil.config(configOptions).fetch(
      'GET',
      pdfUrl
    );

    console.log('PDF downloaded:', response.path());

    if (Platform.OS === 'ios') {
      ReactNativeBlobUtil.ios.openDocument(response.path());
    }

    Toast.success('PDF downloaded successfully!');

    Alert.alert(
      'Download Complete',
      `Invoice saved to ${
        Platform.OS === 'ios' ? 'Documents' : 'Downloads'
      }\n\nFile: ${fileName}`,
      [
        { text: 'OK' },
        Platform.OS === 'android'
          ? {
              text: 'Open',
              onPress: () => {
                ReactNativeBlobUtil.android.actionViewIntent(
                  response.path(),
                  'application/pdf'
                );
              },
            }
          : null,
      ].filter(Boolean) as any
    );
  } catch (error) {
    console.error('Download error:', error);
    Toast.error('Failed to download PDF');
    Alert.alert('Error', 'Failed to download PDF. Please try again.');
  } finally {
    setDownloading(false); // STOP LOADER ALWAYS
  }
};



const handleSharePdf = async (bill: Bill) => {
  console.log(bill,"BILL TO SHARE")
  if (!bill.pdf_url) {
    Alert.alert('Error', 'PDF URL not available');
    return;
  }

  try {
    const { dirs } = ReactNativeBlobUtil.fs;
    const fileName = `Invoice_${bill.invoice_number}.pdf`;
    const tempPath = `${dirs.CacheDir}/${fileName}`;
let pdfFullUrl = bill.pdf_url;

// Make sure it starts with /
if (!pdfFullUrl.startsWith('/')) {
  pdfFullUrl = '/' + pdfFullUrl;
}

pdfFullUrl = API_URL + pdfFullUrl;

const response = await ReactNativeBlobUtil.config({
  fileCache: true,
  path: tempPath,
}).fetch('GET', pdfFullUrl);
    // Share from local path
    const shareOptions = {
      title: `Bill ${bill.invoice_number}`,
      message: `Bill for ${bill.buyer.buyer_name} - Total: ₹${bill.total}`,
      url: Platform.OS === 'ios' ? response.path() : `file://${response.path()}`,
      type: 'application/pdf',
      subject: `Invoice ${bill.invoice_number}`,
      failOnCancel: false,
    };

    await Share.open(shareOptions);

    // Optional: cleanup temp file after 5 seconds
    setTimeout(() => {
      ReactNativeBlobUtil.fs.unlink(response.path()).catch((err) => {
        console.log('Cleanup error:', err);
      });
    }, 5000);

  } catch (error: any) {
    console.error('Share error:', error);
    if (error.message !== 'User did not share') {
      Toast.error('Failed to share PDF');
    }
  }
};
  const handlePrintPdf = async (bill: Bill) => {
    try {
      if (!bill.pdf_url) {
        console.log('PDF URL not available');
        return;
      }

      await RNPrint.print({
        filePath: `${API_URL}${bill.pdf_url}`,
      });
    } catch (error) {
      console.error('Print error:', error);
    }
  };

  // UI Components
  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <View className="bg-white rounded-2xl p-4 flex-1 border border-slate-100 shadow-sm">
      <View className={`w-10 h-10 rounded-full bg-${color}-100 items-center justify-center mb-2`}>
        <Icon size={20} color={color === 'indigo' ? '#4F46E5' : color === 'green' ? '#10B981' : '#F59E0B'} />
      </View>
      <Text className="text-slate-500 text-xs font-medium mb-1">{label}</Text>
      <Text className="text-slate-900 text-lg font-black">{value}</Text>
    </View>
  );

  const FilterChip = ({ label, isActive, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 ${
        isActive ? 'bg-indigo-600' : 'bg-slate-100'
      }`}
    >
      <Text className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-600'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const BillCard = ({ bill }: { bill: Bill }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedBill(bill);
        setShowBillDetailModal(true);
      }}
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm active:scale-[0.98]"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className="bg-indigo-100 px-2 py-1 rounded-lg mr-2">
              <Text className="text-indigo-700 font-black text-xs">
                {bill.invoice_number}
              </Text>
            </View>
            <View className="bg-slate-100 px-2 py-1 rounded-lg">
              <Text className="text-slate-600 font-medium text-xs">
                {new Date(bill.invoice_date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <Text className="text-slate-900 font-bold text-lg mb-1">
            {bill.buyer.buyer_name}
          </Text>
          <View className="flex-row items-center">
            <Phone size={12} color="#64748B" />
            <Text className="text-slate-500 text-sm ml-1">{bill.buyer.phone}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-green-600 font-black text-2xl">
            ₹{bill.total.toFixed(0)}
          </Text>
          <View className="bg-green-100 px-2 py-0.5 rounded-full mt-1">
            <Text className="text-green-700 text-xs font-bold">
              {bill.items?.length  || 0} items
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row gap-2 pt-3 border-t border-slate-100">
        <TouchableOpacity
          onPress={() => handleViewPdf(bill)}
          className="flex-1 bg-indigo-50 py-2 rounded-xl flex-row items-center justify-center"
        >
          <Eye size={16} color="#4F46E5" />
          <Text className="text-indigo-600 font-bold text-xs ml-1">View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSharePdf(bill)}
          className="flex-1 bg-blue-50 py-2 rounded-xl flex-row items-center justify-center"
        >
          <Share2 size={16} color="#3B82F6" />
          <Text className="text-blue-600 font-bold text-xs ml-1">Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDownloadPdf(bill)}
          className="flex-1 bg-emerald-50 py-2 rounded-xl flex-row items-center justify-center"
        >
          <Download size={16} color="#10B981" />
          <Text className="text-emerald-600 font-bold text-xs ml-1">Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handlePrintPdf(bill)}
          className="flex-1 bg-amber-50 py-2 rounded-xl flex-row items-center justify-center"
        >
          <Printer size={16} color="#F59E0B" />
          <Text className="text-amber-600 font-bold text-xs ml-1">Print</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View className="flex-1 bg-slate-900/60 justify-end">
        <TouchableOpacity className="flex-1" onPress={() => setShowFilterModal(false)} />
        
        <View className="bg-white h-[70%] rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-slate-900 text-2xl font-black">Filters</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Time Period */}
            <Text className="text-slate-700 font-bold text-sm mb-3">Time Period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              <FilterChip
                label="All Time"
                isActive={filters.period === 'all'}
                onPress={() => setFilters(prev => ({ ...prev, period: 'all' }))}
              />
              <FilterChip
                label="Last 7 Days"
                isActive={filters.period === '7days'}
                onPress={() => setFilters(prev => ({ ...prev, period: '7days' }))}
              />
              <FilterChip
                label="1 Month"
                isActive={filters.period === '1month'}
                onPress={() => setFilters(prev => ({ ...prev, period: '1month' }))}
              />
              <FilterChip
                label="3 Months"
                isActive={filters.period === '3months'}
                onPress={() => setFilters(prev => ({ ...prev, period: '3months' }))}
              />
              <FilterChip
                label="6 Months"
                isActive={filters.period === '6months'}
                onPress={() => setFilters(prev => ({ ...prev, period: '6months' }))}
              />
              <FilterChip
                label="1 Year"
                isActive={filters.period === '1year'}
                onPress={() => setFilters(prev => ({ ...prev, period: '1year' }))}
              />
            </ScrollView>

            {/* Amount Range */}
            <Text className="text-slate-700 font-bold text-sm mb-3">Amount Range</Text>
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1">
                <TextInput
                  className="bg-slate-100 rounded-xl px-4 py-3 text-slate-800 font-medium"
                  placeholder="Min Amount"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={filters.minAmount?.toString() || ''}
                  onChangeText={text => 
                    setFilters(prev => ({ ...prev, minAmount: text ? parseFloat(text) : undefined }))
                  }
                />
              </View>
              <View className="flex-1">
                <TextInput
                  className="bg-slate-100 rounded-xl px-4 py-3 text-slate-800 font-medium"
                  placeholder="Max Amount"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={filters.maxAmount?.toString() || ''}
                  onChangeText={text => 
                    setFilters(prev => ({ ...prev, maxAmount: text ? parseFloat(text) : undefined }))
                  }
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => {
                  setFilters({
                    period: 'all',
                    searchQuery: '',
                  });
                }}
                className="flex-1 bg-slate-100 py-3 rounded-xl"
              >
                <Text className="text-slate-700 font-bold text-center">Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                className="flex-1 bg-indigo-600 py-3 rounded-xl"
              >
                <Text className="text-white font-bold text-center">Apply</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const BillDetailModal = () => (
    <Modal
      visible={showBillDetailModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBillDetailModal(false)}
    >
      <View className="flex-1 bg-slate-900/60 justify-end">
        <TouchableOpacity className="flex-1" onPress={() => setShowBillDetailModal(false)} />
      {selectedBill && (
  <View className="bg-white h-[85%] rounded-t-3xl">
    <View className="px-6 py-4 border-b border-slate-100">
      <View className="flex-row justify-between items-center">
        <Text className="text-slate-900 text-xl font-black">Bill Details</Text>
        <TouchableOpacity onPress={() => setShowBillDetailModal(false)}>
          <X size={24} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>

    <ScrollView className="flex-1 px-6 py-4">
      {/* Invoice Info */}
      <View className="bg-indigo-50 rounded-2xl p-4 mb-4">
        <Text className="text-indigo-900 font-black text-2xl mb-1">
          {selectedBill.invoice_number}
        </Text>
        <Text className="text-indigo-600 text-sm">
          {new Date(selectedBill.invoice_date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Customer Details */}
      <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200">
        <Text className="text-slate-700 font-bold text-sm mb-3">Customer Details</Text>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <User size={16} color="#64748B" />
            <Text className="text-slate-800 font-medium ml-2">
              {selectedBill.buyer.buyer_name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Phone size={16} color="#64748B" />
            <Text className="text-slate-800 font-medium ml-2">
              {selectedBill.buyer.phone}
            </Text>
          </View>
          {selectedBill.buyer.address && (
            <View className="flex-row items-start">
              <MapPin size={16} color="#64748B" style={{ marginTop: 2 }} />
              <Text className="text-slate-800 font-medium ml-2 flex-1">
                {selectedBill.buyer.address}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Items */}
      <View className="bg-white rounded-2xl p-4 mb-4 border border-slate-200">
        <Text className="text-slate-700 font-bold text-sm mb-3">Items</Text>
        {selectedBill.items?.map((item, index) => (
          <View
            key={index}
            className="flex-row justify-between items-center py-3 border-b border-slate-100 last:border-0"
          >
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-base">
                {item.item_name}
              </Text>
              <Text className="text-slate-500 text-sm">
                {item.qty} × ₹{item.price}
              </Text>
            </View>
            <Text className="text-slate-900 font-black text-lg">
              ₹{item.amount.toFixed(0)}
            </Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View className="bg-green-50 rounded-2xl p-4 mb-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-green-700 font-bold text-lg">Total Amount</Text>
          <Text className="text-green-900 font-black text-3xl">
            ₹{selectedBill.total.toFixed(2)}
          </Text>
        </View>
      </View>
    </ScrollView>

    {/* Action Buttons */}
    <View className="px-6 py-4 border-t border-slate-100 flex-row gap-3">
      <TouchableOpacity
        onPress={() => handleViewPdf(selectedBill)}
        className="flex-1 bg-indigo-600 py-3 rounded-xl flex-row items-center justify-center"
      >
        <Eye size={18} color="white" />
        <Text className="text-white font-bold ml-2">View PDF</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleSharePdf(selectedBill)}
        className="flex-1 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center"
      >
        <Share2 size={18} color="white" />
        <Text className="text-white font-bold ml-2">Share</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

      </View>
    </Modal>
  );

  const PdfViewModal = () => (
    <Modal
      visible={showPdfModal}
      animationType="slide"
      onRequestClose={() => setShowPdfModal(false)}
    >
      <SafeAreaView className="flex-1 bg-slate-900">
        <View className="flex-row justify-between items-center px-4 py-3 bg-slate-800">
          <Text className="text-white font-bold text-lg">Bill Preview</Text>
          <TouchableOpacity onPress={() => setShowPdfModal(false)}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
        {currentPdfUrl && (
           <Pdf
            trustAllCerts={false}
            source={{ uri: currentPdfUrl, cache: true }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages) => {
              console.log(`PDF loaded: ${numberOfPages} pages`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}/${numberOfPages}`);
            }}
            onError={(error) => {
              console.error('PDF error:', error);
              Toast.error('Failed to load PDF');
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-slate-500 mt-4 font-medium">Loading bills...</Text>
      </SafeAreaView>
    );
  }

  // Main Render
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#1E293B" />
    {downloading && (
  <View className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
    <ActivityIndicator size="large" color="#fff" />
    <Text className="text-white mt-3 text-lg font-semibold">
      Downloading PDF...
    </Text>
  </View>
  )}
      {/* Header */}
      <View className="bg-slate-800 pb-6 pt-2 px-6 shadow-lg">
        <Text className="text-white text-2xl font-black mb-1">Bill History</Text>
        <Text className="text-slate-400 text-sm">
          View and manage all your invoices
        </Text>
      </View>

      <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
        {/* Statistics */}
        <View className="px-5 py-4">
          <View className="flex-row gap-3 mb-4">
            <StatCard
              icon={FileText}
              label="Total Bills"
              value={statistics.totalBills}
              color="indigo"
            />
            <StatCard
              icon={IndianRupee}
              label="Total Amount"
              value={`₹${statistics.totalAmount.toFixed(0)}`}
              color="green"
            />
          </View>
        </View>

        {/* Search & Filter */}
        <View className="px-5 mb-4">
          <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 border border-slate-200">
              <Search size={20} color="#94A3B8" />
              <TextInput
                className="flex-1 ml-3 text-slate-800 font-medium py-3"
                placeholder="Search by name, invoice, phone..."
                placeholderTextColor="#94A3B8"
                value={filters.searchQuery}
                onChangeText={text => setFilters(prev => ({ ...prev, searchQuery: text }))}
              />
              {filters.searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}>
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              className="bg-indigo-600 w-12 h-12 rounded-xl items-center justify-center"
            >
              <Filter size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Active Filter Indicator */}
          {filters.period !== 'all' && (
            <View className="mt-3 bg-indigo-50 px-3 py-2 rounded-lg flex-row items-center">
              <Calendar size={14} color="#4F46E5" />
              <Text className="text-indigo-600 text-xs font-bold ml-2">
                Showing: {filters.period.replace(/(\d+)/, '$1 ').replace('days', 'Days').replace('month', 'Month').replace('year', 'Year')}
              </Text>
            </View>
          )}
        </View>

        {/* Bill List */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {filteredBills.length > 0 ? (
            filteredBills.map(bill => <BillCard key={bill.id} bill={bill} />)
          ) : (
            <View className="items-center py-20 opacity-50">
              <FileText size={64} color="#94A3B8" />
              <Text className="text-slate-500 font-bold text-lg mt-4">
                No bills found
              </Text>
              <Text className="text-slate-400 text-sm mt-2">
                Try adjusting your filters
              </Text>
            </View>
          )}
          <View className="h-6" />
        </ScrollView>
      </Animated.View>

      {/* Modals */}
      <FilterModal />
      <BillDetailModal />
      <PdfViewModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  pdf: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 130,
    justifyContent: 'center',
  },
  downloadButton: {
    backgroundColor: '#4F46E5',
  },
  shareButton: {
    backgroundColor: '#10B981',
  },
  printButton: {
    backgroundColor: '#F59E0B',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerTotal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
});

export default BillHistoryScreen;