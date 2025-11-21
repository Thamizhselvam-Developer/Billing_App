
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types_interface/navigation.type';
import HomeScreen from '../../screen/Home/HomeScreen';
import CreateBillScreen from '../../screen/CreateBillScreen/CreateBillScreen';
import ItemMaster from '../../screen/ItemMaster/ItemMaster';
import BillHistory from '../../screen/BillHistory/BillHistory';
import BillDetails from '../../screen/BillHistory/BillDetails';
import EditBill from '../../screen/BillHistory/EditBill';


const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList
>;
export function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
     <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
 
        />
           <Stack.Screen
          name="ItemMaster"
          component={ItemMaster}
        />
            <Stack.Screen
          name="CreateBillScreen"
          component={CreateBillScreen}
        />
              <Stack.Screen
          name="BillHistory"
          component={BillHistory}
        />

                <Stack.Screen
          name="BillDetails"
          component={BillDetails}
        />

                <Stack.Screen
          name="EditBill"
          component={EditBill}
        />
    </Stack.Navigator>
  );
}