import { View, Text } from 'react-native';
import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { RootStack } from './src/components/navigation/navigation';
// const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>

      <RootStack />
          
      </SafeAreaProvider>
    </NavigationContainer>
  );
}



// export default function App() {
//   return (
//     <HomeScreen/> 
//   );
// }