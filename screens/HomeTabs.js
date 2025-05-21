import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import i18n from '../i18n';

import HistoryScreen from './HistoryScreen';
import ScanScreen from './ScanScreen';
import EuroNewsScreen from './EuroNewsScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SearchScreen from '../screens/SearchScreen'; // ✅ import corretto

const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FFCC00',
        tabBarInactiveTintColor: '#ffffff',
        tabBarStyle: {
          backgroundColor: '#003399',
          borderTopColor: 'transparent',
          height: 90,
          paddingBottom: 5,
          paddingTop: 15,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          paddingBottom: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Storico"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Storico',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analisi"
        component={AnalysisScreen}
        options={{
          tabBarLabel: i18n.t('analysis'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-pie" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Scansiona"
        component={ScanScreen}
        options={{
          tabBarLabel: () => <Text style={{ color: '#fff' }}>Scansiona</Text>,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="barcode-scan" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Euro News"
        component={EuroNewsScreen}
        options={{
          tabBarLabel: i18n.t('news'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="newspaper" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Cerca"
        component={SearchScreen}
        options={{
          tabBarLabel: i18n.t('search'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;
