import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BarcodeScanner from '../components/BarcodeScanner';
import { fetchProductByBarcode } from '../services/openFoodFacts';

console.log("🏠 HomeScreen caricato");

const HomeScreen = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [isPremium, setIsPremium] = useState(true); // Cambia tra true e false per testare
  const navigation = useNavigation();

  const handleScan = async (code) => {
    setShowScanner(false);
    console.log("🚀 Simulazione barcode lanciata!", code);

    try {
      const product = await fetchProductByBarcode(code);
      navigation.navigate('ProductInfo', { product, isPremium });
    } catch (error) {
      alert('❌ Prodotto non trovato o errore nella chiamata API.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OriginCheck</Text>
      <Text style={styles.subtitle}>Dietro il marchio</Text>

      <Button
        title={showScanner ? 'Chiudi Scanner' : 'Scansiona Codice a Barre'}
        color={showScanner ? '#dc3545' : '#007bff'}
        onPress={() => setShowScanner(!showScanner)}
      />

      {showScanner && (
        <View style={styles.scannerWrapper}>
          <BarcodeScanner onScan={handleScan} />
        </View>
      )}

      {/* Pulsante per alternare tra versioni Free e Premium */}
      <Button
        title={`Passa a ${isPremium ? 'Free' : 'Premium'}`}
        color={isPremium ? '#ff9f00' : '#00c300'}
        onPress={() => setIsPremium(!isPremium)}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  scannerWrapper: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 10,
    marginTop: 20,
  },
});
