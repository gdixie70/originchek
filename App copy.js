import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import ProductInfoScreen from './screens/ProductInfoScreen'; // Assicurati di averlo creato

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'OriginCheck' }} />
        <Stack.Screen name="ProductInfo" component={ProductInfoScreen} options={{ title: 'Dettagli Prodotto' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
