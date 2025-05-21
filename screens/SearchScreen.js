import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import i18n from '../i18n';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('description');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSearch = async () => {
    if (!query.trim()) return;

    Keyboard.dismiss();
    setResults([]);

    if (searchMode === 'barcode' && !/^\d+$/.test(query.trim())) {
      setResults([{ product_name: '__INVALID_BARCODE__' }]);
      return;
    }

    setLoading(true);

    try {
      let res;
      if (searchMode === 'description') {
        res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
        const data = await res.json();
        setResults(data.products || []);
      } else {
        res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(query)}.json`);
        const data = await res.json();
        if (data.status === 1) {
          setResults([data.product]);
        } else {
          setResults([{ product_name: '__NOT_FOUND__' }]);
        }
      }
    } catch (error) {
      console.error('Errore nella chiamata API:', error);
      setResults([{ product_name: '__ERROR__' }]);
    }

    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t('search')}</Text>
        <View style={styles.underline} />

        <Text style={styles.description}>
          Inserisci il nome di un prodotto o il barcode.
        </Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, searchMode === 'description' && styles.toggleButtonActive]}
            onPress={() => {
              Keyboard.dismiss();
              setSearchMode('description');
            }}
          >
            <Text style={[styles.toggleText, searchMode === 'description' && styles.toggleTextActive]}>
              Descrizione
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, searchMode === 'barcode' && styles.toggleButtonActive]}
            onPress={() => {
              Keyboard.dismiss();
              setSearchMode('barcode');
            }}
          >
            <Text style={[styles.toggleText, searchMode === 'barcode' && styles.toggleTextActive]}>
              Barcode
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder={searchMode === 'barcode' ? 'Inserisci codice a barre...' : 'Cerca un prodotto...'}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#aaa"
          keyboardType={searchMode === 'barcode' ? 'numeric' : 'default'}
        />

        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Cerca</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator color="#FFCC00" size="large" style={{ marginTop: 30 }} />}

        <FlatList
          data={results}
          keyExtractor={(item, index) => item.id || item._id || item.code || index.toString()}
          renderItem={({ item }) => {
            if (item.product_name === '__INVALID_BARCODE__') {
              return <Text style={styles.errorText}>Formato non valido. Inserisci solo numeri.</Text>;
            }
            if (item.product_name === '__NOT_FOUND__') {
              return <Text style={styles.errorText}>Nessun prodotto trovato con questo codice.</Text>;
            }
            if (item.product_name === '__ERROR__') {
              return <Text style={styles.errorText}>Errore durante la ricerca. Riprova.</Text>;
            }

            return (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => navigation.navigate('ProductInfo', { product: item })}
              >
                <Text style={styles.productName}>{item.product_name || 'Prodotto senza nome'}</Text>
                {item.brands && <Text style={styles.brand}>{item.brands}</Text>}
              </TouchableOpacity>
            );
          }}
          style={{ marginTop: 30 }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    color: '#FFCC00',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: '#FFCC00',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: '10%',
    borderRadius: 2,
  },
  description: {
    color: '#FFCC00',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: '5%',
    marginBottom: '10%',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 40,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFCC00',
    backgroundColor: '#003399',
  },
  toggleButtonActive: {
    backgroundColor: '#FFCC00',
  },
  toggleText: {
    color: '#FFCC00',
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#003399',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: '10%',
  },
  button: {
    backgroundColor: '#FFCC00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#003399',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultItem: {
    backgroundColor: '#eef',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#003399',
  },
  brand: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    color: '#FF5555',
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 20,
    fontSize: 16,
  },
});
