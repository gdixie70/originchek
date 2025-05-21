import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const PreferitiScreen = ({ navigation }) => {
  const [preferiti, setPreferiti] = useState([]);

  useEffect(() => {
    const loadPreferiti = async () => {
      try {
        const dati = await AsyncStorage.getItem('cronologia');
        if (dati) {
          const lista = JSON.parse(dati);
          const codiciUnici = new Set();
          const filtratiUnici = lista.filter(item => {
            if (item.preferito && !codiciUnici.has(item.product.code)) {
              codiciUnici.add(item.product.code);
              return true;
            }
            return false;
          });
          setPreferiti(filtratiUnici);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei preferiti:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadPreferiti);
    return unsubscribe;
  }, [navigation]);

  const togglePreferito = async (code) => {
    try {
      const dati = await AsyncStorage.getItem('cronologia');
      if (!dati) return;

      const lista = JSON.parse(dati).map(item => {
        if (item.product.code === code) {
          const nuovoStato = !item.preferito;
          Toast.show({
            type: 'success',
            text1: nuovoStato ? 'Aggiunto ai preferiti' : 'Rimosso dai preferiti',
            position: 'bottom',
            visibilityTime: 2000,
          });
          return { ...item, preferito: nuovoStato };
        }
        return item;
      });

      await AsyncStorage.setItem('cronologia', JSON.stringify(lista));

      const codiciUnici = new Set();
      const aggiornati = lista.filter(item =>
        item.preferito && !codiciUnici.has(item.product.code) && codiciUnici.add(item.product.code)
      );

      setPreferiti(aggiornati);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    }
  };

  const handleItemPress = (item) => {
    navigation.navigate('ProductInfo', {
      product: item.product,
      isPremium: item.isPremium,
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => togglePreferito(item.product.code)} style={styles.favoriteIcon}>
        <MaterialCommunityIcons name="star" size={26} color="#FFCC00" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
      >
        <Image source={{ uri: item.product.image_front_url }} style={styles.itemImage} />
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{item.product.product_name}</Text>
          <Text style={styles.itemBrand}>{item.product.brands}</Text>
        </View>
        <View style={styles.euInfo}>
          <Text style={styles.euFlag}>🇪🇺</Text>
          <Text style={styles.euText}>EU {item.euPercentage || 0}%</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preferiti</Text>
      <View style={styles.underline} />

      {preferiti.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.welcomeTitle}>⭐ Nessun preferito al momento</Text>
          <Text style={styles.welcomeMessage}>Aggiungi un prodotto ai preferiti per vederlo qui!</Text>
        </View>
      ) : (
        <FlatList
          data={preferiti}
          keyExtractor={(item, index) =>
            `${item.product.code || item.product.product_name}-${index}`
          }
          contentContainerStyle={{ paddingTop: 30 }}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default PreferitiScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    color: '#FFCC00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  underline: {
    height: 2,
    backgroundColor: '#FFCC00',
    width: '100%',
    marginTop: 8,
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFCC00',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  favoriteIcon: {
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 6,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003399',
  },
  itemBrand: {
    fontSize: 14,
    color: '#555',
  },
  euInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  euFlag: {
    fontSize: 20,
  },
  euText: {
    fontSize: 14,
    color: '#003399',
    fontWeight: 'bold',
  },
});
