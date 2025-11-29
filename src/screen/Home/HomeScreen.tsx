import React, { JSX, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
} from 'react-native';
import '../../../global.css';
import {
  CirclePlus,
  Home,
  Receipt,
  Package,
  User,
  Bell,
  ArrowRight,
  FileText,
  LucideProps,
} from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types_interface/navigation.type';
import { SafeAreaView } from 'react-native-safe-area-context';
import { salesData } from './sales';
import { API_URL } from '@env';
import axios from 'axios';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomeScreen'
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

type MenuItem = {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  bgColor: string;
  iconBg: string;
  onPress: () => void;
};

type FooterItem = {
  id: string;
  label: string;
  icon: JSX.Element;
  activeIcon?: JSX.Element;
  isSpecial?: boolean;
  onPress: () => void;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
const [todaySale, setTodaySale] = useState(0);
const [monthSale, setMonthSale] = useState(0);
useEffect(() => {
  fetchSales();
}, []);

const fetchSales = async () => {
  try {
    // Get today's sale
    const dailyResponse = await axios.get(`${API_URL}api/report/daily`);
    console.log(dailyResponse.data);
    const {total} =  dailyResponse.data;
    setTodaySale(total || 0);

    // Get month sale
    const monthlyResponse = await axios.get(`${API_URL}api/report/monthly`);
    const {total: monthlyTotal} =  monthlyResponse.data;
    setMonthSale(monthlyTotal || 0);

  } catch (error) {
    console.log("Error fetching sales:", error);
  }
};
  const shadowStyle = {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  };

  const menuItems: MenuItem[] = [
    {
      id: 1,
      title: 'Create New Bill',
      subtitle: 'Generate new invoice',
      icon: <FileText size={32} color="#1d4ed8" />,
      bgColor: 'bg-blue-500',
      iconBg: 'bg-blue-100',
      onPress: () => navigation.navigate('CreateBillScreen'),
    },
      {
      id: 1,
      title: 'Bill History',
      subtitle: 'View past transactions',
      icon: <FileText size={32} color="#1d4ed8" />,
      bgColor: 'bg-indigo-500',
      iconBg: 'bg-blue-100',
      onPress: () => navigation.navigate('BillHistoryScreen'),
    },
    {
      id: 2,
      title: 'Generate Pdf',
      subtitle: 'Generate invoice as pdf',
      icon: <Receipt size={32} color="#059669" />,
      bgColor: 'bg-green-500',
      iconBg: 'bg-green-100',
      onPress: () => navigation.navigate('BillHistory'),
    },
    {
      id: 3,
      title: 'Items',
      subtitle: 'Manage your inventory',
      icon: <Package size={32} color="#7c3aed" />,
      bgColor: 'bg-purple-500',
      iconBg: 'bg-purple-100',
      onPress: () => navigation.navigate('ItemMaster'),
    },
  ];

 const footerItems: FooterItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home size={26} />,
    activeIcon: <Home size={26} color="#2563eb" />,
    onPress: () => setActiveTab('home'),
  },
  {
    id: 'bills',
    label: 'Bills',
    icon: <Receipt size={26} />,
    activeIcon: <Receipt size={26} color="#2563eb" />,
    onPress: () => {
      setActiveTab('bills');
      navigation.navigate('BillHistory');
    },
  },
  {
    id: 'create',
    label: 'Create',
    // Removed isSpecial flag and reduced icon size
    icon: <CirclePlus size={26} color="#2563eb" />,
    activeIcon: <CirclePlus size={26} color="#2563eb" />,
    onPress: () => {
      setActiveTab('create');
      navigation.navigate('CreateBillScreen');
    },
  },
  {
    id: 'items',
    label: 'Items',
    icon: <Package size={26} />,
    activeIcon: <Package size={26} color="#2563eb" />,
    onPress: () => {
      setActiveTab('items');
      navigation.navigate('ItemMaster');
    },
  },
];

  return (
    <SafeAreaView className="flex-1 bg-gray-50  ">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
  <View className="bg-white shadow-md  ">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-3xl font-extrabold text-gray-800">
                 Nethra Food Products
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
   
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mt-4">
            <View className="bg-blue-50 rounded-xl px-4 py-3 flex-1 mr-2">
              <Text className="text-blue-600 text-xs font-semibold">TODAY</Text>
              <Text className="text-blue-900 text-lg font-bold mt-1">₹{todaySale}</Text>
            </View>
            <View className="bg-green-50 rounded-xl px-4 py-3 flex-1 ml-2">
              <Text className="text-green-600 text-xs font-semibold">MONTH</Text>
              <Text className="text-green-900 text-lg font-bold mt-1">₹{monthSale}</Text>
            </View>
          </View>
        </View>
</View>
      {/* Header */}
    

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 pt-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Quick Actions</Text>

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className={`${item.bgColor} rounded-3xl p-5 mb-4 shadow-lg active:opacity-90`}
              style={shadowStyle}
            >
              <View className="flex-row items-center">
                <View className={`${item.iconBg} rounded-2xl p-4 mr-4`}>{item.icon}</View>
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold mb-1">{item.title}</Text>
                  <Text className="text-white text-sm opacity-80">{item.subtitle}</Text>
                </View>
                <View className=" bg-opacity-25 rounded-full p-2">
                  <ArrowRight size={22} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          ))}

      
        </View>
      </ScrollView>

      <View
        className="bg-white border-t border-gray-200 absolute bottom-0 left-0 right-0"
        style={{
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        <View className="bg-white border-t border-gray-200 absolute bottom-0 left-0 right-0 py-3">
  <View className="flex-row items-center justify-around">

    {footerItems.map((item) => {
      const isActive = activeTab === item.id;

      if (item.isSpecial) {
        return (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            className="items-center justify-center -mt-9"
          >
            <View className="bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg">
              {item.icon}
            </View>
            <Text className="text-xs font-semibold text-blue-600 mt-1">{item.label}</Text>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          key={item.id}
          onPress={item.onPress}
          className="items-center justify-center w-16"
        >
          <View
            className={`p-2 rounded-xl ${
              isActive ? "bg-blue-50" : "bg-transparent"
            }`}
          >
            {isActive ? item.activeIcon : item.icon}
          </View>

          <Text
            className={`text-xs font-semibold mt-1 ${
              isActive ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    })}

  </View>
</View>

      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
