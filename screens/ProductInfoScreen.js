import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { calcolaOrigineEuropa } from '../utils/origine';
import { BlurView } from 'expo-blur';
import getFlagUrl from '../utils/getFlagUrl';
import normalizeCountryName from '../utils/normalizeCountryName.js';
import Toast from 'react-native-toast-message';
import { PremiumContext } from '../contexts/PremiumContext';
import { useNavigation } from '@react-navigation/native';

const flags = {
  'EU': 'https://flagcdn.com/w320/eu.png',
};

const EU_COUNTRIES = ['France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Poland',
  'Austria', 'Sweden', 'Portugal', 'Greece', 'Czech Republic', 'Hungary',
  'Romania', 'Bulgaria', 'Slovakia', 'Croatia', 'Denmark', 'Finland', 'Ireland',
  'Lithuania', 'Latvia', 'Slovenia', 'Estonia', 'Cyprus', 'Luxembourg', 'Malta'];

const countryMapping = {
  'Francia': 'France',
  'Royaume-Uni': 'United Kingdom',
  'Regno Unito': 'United Kingdom',
  'Italia': 'Italy',
  'Spagna': 'Spain',
  'Germania': 'Germany',
  'Belgio': 'Belgium',
  'Paesi Bassi': 'Netherlands',
  'Lussemburgo': 'Luxembourg',
  'Polonia': 'Poland',
  'Romania': 'Romania',
  'Svizzera': 'Switzerland',
  'Stati Uniti': 'United States',
  'India': 'India',
  'Marocco': 'Morocco',
  'Filippine': 'Philippines',
  'Turchia': 'Turkey',
  'Sweden': 'Svezia',
};

const ProductInfoScreen = ({ route }) => {
  const { product } = route.params;
  const { isPremium } = useContext(PremiumContext);
  const [preferito, setPreferito] = useState(false);
  const navigation = useNavigation();

  const { percentualeEU = 0, percentuali = [] } = calcolaOrigineEuropa(product?.countries || '');

  const imageUrl = product?.image_front_url;
  const productionPlace = product?.manufacturing_places || '';
  const extractedCountry = productionPlace.split(',').pop()?.trim();
  const normalizedCountry = normalizeCountryName(extractedCountry || '');
  const flag = getFlagUrl(normalizedCountry);
  const flagSource = typeof flag === 'string' ? { uri: flag } : flag;

  useEffect(() => {
    const checkPreferito = async () => {
      const dati = await AsyncStorage.getItem('cronologia');
      if (!dati) return;
      const lista = JSON.parse(dati);
      const trovato = lista.find(p => p.product.code === product.code);
      if (trovato?.preferito) setPreferito(true);
    };
    checkPreferito();
  }, []);

  const togglePreferito = async () => {
    if (!isPremium) {
      Alert.alert('Funzione Premium', 'Fai l\'Upgrade per gestire i preferiti.');
      return;
    }

    try {
      const dati = await AsyncStorage.getItem('cronologia');
      if (!dati) return;
      const lista = JSON.parse(dati);

      const aggiornata = lista.map(p => {
        if (!p?.product?.code || !product?.code) return p;
        if (p.product.code === product.code) {
          return { ...p, preferito: !preferito };
        }
        return p;
      });

      await AsyncStorage.setItem('cronologia', JSON.stringify(aggiornata));
      setPreferito(!preferito);

      Toast.show({
        type: 'success',
        text1: !preferito ? 'Aggiunto ai preferiti' : 'Rimosso dai preferiti',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Errore salvataggio preferito:', error);
    }
  };

  const handlePremiumUpgrade = () => {
    Alert.alert('Funzione in arrivo', 'Qui verrà integrato il processo di acquisto Premium da 9,90€/anno.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{product?.product_name || 'Nome non disponibile'}</Text>
        <TouchableOpacity onPress={togglePreferito}>
          <MaterialCommunityIcons name={preferito ? 'star' : 'star-outline'} size={28} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      <View style={styles.topRow}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.productImageSmall} resizeMode="contain" />
        )}

        <View style={styles.euInfoCompact}>
          <Text style={styles.labelBlack}>Produzione Europea</Text>
          <Image source={{ uri: flags['EU'] }} style={styles.flagImageCompact} />
          <Text style={styles.percentualeEU}>EU {percentualeEU}%</Text>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.detailRow}>
          <Text style={styles.labelYellow}>Marca:</Text>
          <Text style={styles.detailWhiteBold}>{product?.brands || 'N/D'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BrandHierarchy', { brand: product?.brands || 'N/D' })}>
            <Text style={{ color: '#FFCC00', fontWeight: 'bold' }}>Scopri di più</Text>
          </TouchableOpacity>
        </View>

        {productionPlace ? (
          <View style={styles.detailRow}>
            <Text style={styles.labelYellow}>Fabbricato in:</Text>
            <Text style={styles.detailWhiteBold}>{countryMapping[normalizedCountry] || normalizedCountry}</Text>
            <Image source={flagSource} style={styles.flagSmall} />
          </View>
        ) : null}

        <View style={styles.detailRow}>
          <Text style={styles.labelYellow}>Barcode:</Text>
          <Text style={styles.detailWhite}>{product?.code || 'N/D'}</Text>
        </View>
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>Paesi di produzione ({percentuali.length})</Text>

        <View style={styles.flagListContainer}>
  {percentuali.map((item, index) => {
    const norm = normalizeCountryName(item.country);
    const isEU = EU_COUNTRIES.includes(norm);
    const flag = getFlagUrl(norm);
    const flagSource = typeof flag === 'string' ? { uri: flag } : flag;

    return (
      <View key={index} style={styles.flagListItem}>
        <View style={styles.flagInfo}>
          <Image source={flagSource} style={styles.flagSmall} />
          <Text style={styles.flagName}>{item.country}</Text>
        </View>
        <View style={styles.percentInfo}>
          {isEU && (
            <Image source={{ uri: flags['EU'] }} style={styles.euMiniFlagAfter} />
          )}
          <Text style={styles.flagPercent}>{item.percentage}%</Text>
        </View>
      </View>
    );
  })}
</View>

        {!isPremium && (
          <BlurView intensity={30} tint="light" style={styles.blurOverlay}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handlePremiumUpgrade}>
                <Text style={styles.blurText}>🔒 Tocca qui per sbloccare i dettagli Premium</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        )}
      </View>
    </ScrollView>
  );
};

export default ProductInfoScreen;



const styles = StyleSheet.create({

  container: {
    padding: 20,
    backgroundColor: '#003399',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFCC00',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productImageSmall: {
    width: '48%',
    height: 180,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
    borderWidth: 4,
    borderColor: '#FFCC00',
  },
  euInfoCompact: {
    width: '48%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 3,
    borderWidth: 4,
    borderColor: '#FFCC00',
  },
  flagImageCompact: {
    width: 80,
    height: 55,
    marginVertical: 10,
    borderRadius: 8,
  },
  percentualeEU: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'flex-start',
    marginVertical: 20,
    alignSelf: 'center',
    width: '80%',
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  labelYellow: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFCC00',
    textAlign: 'center',
  },
  labelBlack: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
    textAlign: 'center',
  },
  detailWhite: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
    color: '#ffffff',
  },
  detailWhiteBold: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    borderWidth: 4,
    borderColor: '#FFCC00',
    position: 'relative',
  },
  flagListContainer: {
    marginTop: 10,
  },
  flagListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  flagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagSmall: {
    width: 50,
    height: 30,
    borderRadius: 4,
    marginRight: 10,
  },
  flagName: {
    fontSize: 20,
    color: '#333',
  },
  flagPercent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  percentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  euMiniFlagAfter: {
    width: 20,
    height: 16,
    marginRight: 6,
    borderRadius: 2,
  },
  blurOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
    zIndex: 10,
    overflow: 'hidden',
  },
  buttonContainer: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  blurText: {
    backgroundColor: '#FFCC00',
    color: '#003399',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  }
  
});
