import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image,
  TouchableOpacity, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { PremiumContext } from '../contexts/PremiumContext';

const HistoryScreen = ({ navigation }) => {
  const { isPremium } = useContext(PremiumContext);
  const [cronologia, setCronologia] = useState([]);
  const [selezioneMultipla, setSelezioneMultipla] = useState(false);
  const [selezionati, setSelezionati] = useState([]);

  useEffect(() => {
    const loadCronologia = async () => {
      try {
        const dati = await AsyncStorage.getItem('cronologia');
        if (dati) {
          setCronologia(JSON.parse(dati));
        }
      } catch (error) {
        console.error('Errore nel caricamento della cronologia:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadCronologia);
    return unsubscribe;
  }, [navigation]);

  const handleItemPress = (item) => {
    if (!selezioneMultipla) {
      navigation.navigate('ProductInfo', {
        product: item.product,
      });
    }
  };

  const deleteItemByCode = async (code) => {
    const nuovaLista = [...cronologia];
    const index = nuovaLista.findIndex(item => item.product.code === code);
    if (index !== -1) {
      nuovaLista.splice(index, 1);
      setCronologia(nuovaLista);
      await AsyncStorage.setItem('cronologia', JSON.stringify(nuovaLista));
    }
  };

  const toggleSelezione = (index) => {
    if (selezionati.includes(index)) {
      setSelezionati(selezionati.filter(i => i !== index));
    } else {
      setSelezionati([...selezionati, index]);
    }
  };

  const eliminaSelezionati = async () => {
    const nuovaLista = cronologia.filter((_, index) => !selezionati.includes(index));
    setCronologia(nuovaLista);
    setSelezionati([]);
    setSelezioneMultipla(false);
    await AsyncStorage.setItem('cronologia', JSON.stringify(nuovaLista));
  };

  const togglePreferito = async (index) => {
    if (!isPremium) {
      Alert.alert('Funzione Premium', 'Fai l\'Upgrade per gestire i preferiti.');
      return;
    }

    const code = cronologia[index]?.product?.code;
    if (!code) return;

    const nuovoStato = !cronologia[index].preferito;

    const nuovaLista = cronologia.map(item => {
      if (item.product.code === code) {
        return { ...item, preferito: nuovoStato };
      }
      return item;
    });

    setCronologia(nuovaLista);
    await AsyncStorage.setItem('cronologia', JSON.stringify(nuovaLista));

    Toast.show({
      type: 'success',
      text1: nuovoStato ? 'Aggiunto ai preferiti' : 'Rimosso dai preferiti',
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  const handlePreferitiPress = () => {
    if (!isPremium) {
      Alert.alert('Funzione Premium', 'Fai l\'Upgrade per accedere ai preferiti.');
      return;
    }
    navigation.navigate('Preferiti');
  };

  const renderRightActions = (item) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() =>
        Alert.alert(
          'Conferma eliminazione',
          'Vuoi davvero eliminare questo prodotto dalla cronologia?',
          [
            { text: 'Annulla', style: 'cancel' },
            {
              text: 'Elimina',
              style: 'destructive',
              onPress: () => deleteItemByCode(item.product.code),
            },
          ]
        )
      }
    >
      <Text style={styles.deleteText}>Elimina</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index }) => (
    <Swipeable renderRightActions={() => !selezioneMultipla && renderRightActions(item)}>
      <View style={styles.itemContainer}>
        {selezioneMultipla && (
          <TouchableOpacity onPress={() => toggleSelezione(index)} style={styles.checkbox}>
            <MaterialCommunityIcons
              name={selezionati.includes(index) ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color="#003399"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => togglePreferito(index)} style={styles.favoriteIcon}>
          <MaterialCommunityIcons
            name={item.preferito ? 'star' : 'star-outline'}
            size={26}
            color="#FFCC00"
          />
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
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePreferitiPress}>
          <MaterialCommunityIcons name="star" size={28} color="#FFCC00" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelezioneMultipla(prev => !prev)}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={26}
            color={selezioneMultipla ? 'red' : '#FFCC00'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Prodotti Scansionati</Text>
      <View style={styles.underline} />

      {cronologia.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.welcomeTitle}>🎉 Benvenuto in OriginCheck!</Text>
          <Text style={styles.welcomeMessage}>
            La tua lista è ancora vuota.{"\n"}Scansiona il tuo primo prodotto per scoprire da dove proviene!
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cronologia}
            keyExtractor={(item, index) =>
              `${item.product.code || item.product.product_name || 'prodotto'}-${index}`
            }
            contentContainerStyle={{ paddingTop: 30 }}
            renderItem={renderItem}
          />
          {selezioneMultipla && selezionati.length > 0 && (
            <TouchableOpacity style={styles.bottoneElimina} onPress={eliminaSelezionati}>
              <Text style={styles.testoBottone}>Elimina selezionati</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 30,
    color: '#FFCC00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  underline: {
    height: 2,
    backgroundColor: '#FFCC00',
    width: '100%',
    marginTop: 16,
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
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '88%',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottoneElimina: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  testoBottone: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkbox: {
    marginRight: 10,
  },
});
