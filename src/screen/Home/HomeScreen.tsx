import React, { JSX, useState } from 'react';
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
      id: 2,
      title: 'Bill History',
      subtitle: 'View past transactions',
      icon: <Receipt size={32} color="#059669" />,
      bgColor: 'bg-green-500',
      iconBg: 'bg-green-100',
      onPress: () => navigation.navigate('BillHistory'),
    },
    {
      id: 3,
      title: 'Item Master',
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
      isSpecial: true,
      icon: <CirclePlus size={40} color="#fff" />,
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
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={26} />,
      activeIcon: <User size={26} color="#2563eb" />,
      onPress: () => setActiveTab('profile'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 border ">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
  <View className="bg-white shadow-md  ">
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-3xl font-extrabold text-gray-800">
                ⭐ Nethra Food Products
              </Text>
              <Text className="text-sm text-gray-500 mt-2">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <TouchableOpacity className="bg-blue-50 rounded-full p-3">
              <Bell size={26} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mt-4">
            <View className="bg-blue-50 rounded-xl px-4 py-3 flex-1 mr-2">
              <Text className="text-blue-600 text-xs font-semibold">TODAY</Text>
              <Text className="text-blue-900 text-lg font-bold mt-1">₹12,450</Text>
            </View>
            <View className="bg-green-50 rounded-xl px-4 py-3 flex-1 ml-2">
              <Text className="text-green-600 text-xs font-semibold">MONTH</Text>
              <Text className="text-green-900 text-lg font-bold mt-1">₹3.2L</Text>
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

          {/* Recent Activity */}
          <View className="mt-6 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">Recent Activity</Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <View className="bg-blue-50 rounded-full p-2 mr-3">
                    <Receipt size={20} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">Invoice #1245</Text>
                    <Text className="text-gray-500 text-xs">2 hours ago</Text>
                  </View>
                </View>
                <Text className="text-green-600 font-bold">₹2,450</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-purple-50 rounded-full p-2 mr-3">
                    <Package size={20} color="#7c3aed" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-800 font-semibold">Item Added</Text>
                    <Text className="text-gray-500 text-xs">5 hours ago</Text>
                  </View>
                </View>
                <Text className="text-gray-400 font-semibold">+3 items</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
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
        <View className="flex-row items-center justify-around px-2 py-2">
          {footerItems.map((item) => {
            const isActive = activeTab === item.id;

            if (item.isSpecial) {
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={item.onPress}
                  className="items-center justify-center -mt-8"
                  style={{ width: 70 }}
                >
                  <View
                    className="bg-blue-500 rounded-full p-4 shadow-lg items-center justify-center"
                    style={{
                      width: 64,
                      height: 64,
                      elevation: 10,
                      shadowColor: '#3B82F6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                    }}
                  >
                    {item.icon}
                  </View>
                  <Text className="text-xs font-semibold text-blue-600 mt-2">{item.label}</Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                className="items-center justify-center py-2 px-3 flex-1"
                style={{ maxWidth: 80 }}
              >
                <View className={`${isActive ? 'bg-blue-50' : 'bg-transparent'} rounded-2xl px-4 py-2`}>
                  {isActive ? item.activeIcon : item.icon}
                </View>
                <Text className={`text-xs font-semibold mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
