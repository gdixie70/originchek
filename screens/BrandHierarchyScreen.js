// BrandHierarchyScreen.js
import { useEffect, useState } from 'react';
import { fetchCompanyInfo } from '../api/fetchCompanyInfo';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, ActivityIndicator } from 'react-native';

export default function BrandHierarchyScreen({ route }) {
  const brand = route?.params?.brand || '';
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchCompanyInfo(brand);
      setCompanyInfo(data);
      setLoading(false);
    };
    getData();
  }, [brand]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Chi c'è dietro il marchio</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FFCC00" />
      ) : companyInfo ? (
        <View style={styles.card}>
          <Text style={styles.label}>Nome società:</Text>
          <Text style={styles.value}>{companyInfo.name}</Text>

          <Text style={styles.label}>Paese di registrazione:</Text>
          <Text style={styles.value}>{companyInfo.jurisdiction}</Text>

          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{companyInfo.status}</Text>

          <Text style={styles.label}>Company Number:</Text>
          <Text style={styles.value}>{companyInfo.companyNumber}</Text>

          <Text style={styles.label}>Link OpenCorporates:</Text>
          <Text style={[styles.value, { color: '#1e90ff' }]} onPress={() => Linking.openURL(companyInfo.url)}>
            {companyInfo.url}
          </Text>
        </View>
      ) : (
        <Text style={styles.warning}>Nessuna informazione trovata per questo marchio.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#003399',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFCC00',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#003399',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  warning: {
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#FF3333',
    padding: 12,
    borderRadius: 8,
  }
});
