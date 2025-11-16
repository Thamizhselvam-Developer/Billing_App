
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../types_interface/navigation.type';
import HomeScreen from '../../screen/Home/HomeScreen';
import ItemMasterScreen from '../../screen/ItemMaster/ItemMaster';
import CreateBillScreen from '../../screen/CreateBillScreen/CreateBillScreen';

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
          component={ItemMasterScreen}
        />
            <Stack.Screen
          name="CreateBillScreen"
          component={CreateBillScreen}
        />
    </Stack.Navigator>
  );
}