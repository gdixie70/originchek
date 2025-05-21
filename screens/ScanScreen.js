import React, { useState, useContext } from 'react';
import {
  View, StyleSheet, Alert, Text,
  TouchableOpacity, TextInput, Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumContext } from '../contexts/PremiumContext';

const ScanScreen = () => {
  const navigation = useNavigation();
  const [barcode, setBarcode] = useState('3017620422003');
  const { isPremium } = useContext(PremiumContext);

  const salvaScansioni = async (prodotto) => {
    const tags = prodotto.countries_tags || [];
    const paesi = tags.map(t => t.replace('en:', '').toLowerCase());

    const euCountries = [
      'france','germany','italy','spain','portugal','austria','belgium',
      'netherlands','luxembourg','ireland','denmark','sweden','finland',
      'czech-republic','slovakia','hungary','poland','romania','bulgaria',
      'croatia','slovenia','greece','cyprus','estonia','latvia','lithuania','malta'
    ];
    const paesiUE = paesi.filter(p => euCountries.includes(p));
    const percentualeUE = paesi.length > 0 ? Math.round((paesiUE.length / paesi.length) * 100) : 0;
    const timestamp = new Date().toISOString();

    // ✅ Per ANALISI
    const nuovoItemAnalisi = {
      product_name: prodotto.product_name || 'Prodotto senza nome',
      date: timestamp,
      percentualeUE: percentualeUE,
      countries: paesi,
    };
    const storedAnalisi = await AsyncStorage.getItem('scan_history');
    const historyAnalisi = storedAnalisi ? JSON.parse(storedAnalisi) : [];
    const nuovaAnalisi = [nuovoItemAnalisi, ...historyAnalisi];
    await AsyncStorage.setItem('scan_history', JSON.stringify(nuovaAnalisi));

    // ✅ Per STORICO (aggiunto countries)
    const nuovoItemCronologia = {
      product: prodotto,
      isPremium: isPremium,
      euPercentage: percentualeUE,
      scannedAt: timestamp,
      countries: paesi, // 🔥 ESSENZIALE per l'analisi nazionale
    };
    const storedCronologia = await AsyncStorage.getItem('cronologia');
    const historyCronologia = storedCronologia ? JSON.parse(storedCronologia) : [];
    const nuovaCronologia = [nuovoItemCronologia, ...historyCronologia];
    await AsyncStorage.setItem('cronologia', JSON.stringify(nuovaCronologia));
  };

  const handleScan = async (scannedBarcode) => {
    if (!scannedBarcode) {
      Alert.alert('Errore', 'Nessun codice a barre inserito.');
      return;
    }

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${scannedBarcode}`);
      const data = await response.json();

      if (data && data.product) {
        await salvaScansioni(data.product);
        navigation.navigate('ProductInfo', {
          product: data.product
        });
      } else {
        Alert.alert('Prodotto non trovato', 'Questo codice a barre non è valido o non è stato trovato.');
      }
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante la scansione.');
      console.error(error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Inserisci codice a barre"
          keyboardType="numeric"
          value={barcode}
          onChangeText={setBarcode}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleScan(barcode)}
        >
          <Text style={styles.buttonText}>Avvia Scanner</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#003399',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
