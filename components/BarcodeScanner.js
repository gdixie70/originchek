import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

const BarcodeScanner = ({ onScan }) => {
  const handleMockScan = () => {
    const fakeCode = '3017620422003'; // Puoi cambiarlo con un altro codice a barre
    onScan(fakeCode);
  };

  return (
    <View style={styles.mockScanner}>
      <Text style={styles.infoText}>📷 Scanner non attivo (modalità simulata)</Text>
      <Button title="Simula scansione codice a barre" onPress={handleMockScan} />
    </View>
  );
};

export default BarcodeScanner;

const styles = StyleSheet.create({
  mockScanner: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
