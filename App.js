import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PremiumProvider } from './contexts/PremiumContext';

import SplashScreen from './screens/SplashScreen';
import HomeTabs from './screens/HomeTabs';
import ProductInfoScreen from './screens/ProductInfoScreen';
import PreferitiScreen from './screens/PreferitiScreen';
import BrandHierarchyScreen from './screens/BrandHierarchyScreen';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PremiumProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ProductInfo"
              component={ProductInfoScreen}
              options={{ title: 'Dettagli Prodotto' }}
            />
            <Stack.Screen
              name="Preferiti"
              component={PreferitiScreen}
              options={{ title: 'Preferiti' }}
            />
            <Stack.Screen
              name="BrandHierarchy"
              component={BrandHierarchyScreen}
              options={{ title: 'Struttura Aziendale' }}
            />
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </GestureHandlerRootView>
    </PremiumProvider>
  );
}
