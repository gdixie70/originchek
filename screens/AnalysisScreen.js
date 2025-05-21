import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import * as Localization from 'expo-localization';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PremiumContext } from '../contexts/PremiumContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function AnalysisScreen() {
  const [dataReady, setDataReady] = useState(false);
  const [pieData, setPieData] = useState([]);
  const [totali, setTotali] = useState({ nazionali: 0, europei: 0, parziali: 0, extra: 0 });
  const [totaleScansioni, setTotaleScansioni] = useState(0);
  const { isPremium } = useContext(PremiumContext);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('scan_history');
      const history = stored ? JSON.parse(stored) : [];

      const iso2toName = {
        it: 'italy', fr: 'france', de: 'germany', es: 'spain', pt: 'portugal',
        at: 'austria', be: 'belgium', nl: 'netherlands', lu: 'luxembourg',
        ie: 'ireland', dk: 'denmark', se: 'sweden', fi: 'finland',
        cz: 'czech-republic', sk: 'slovakia', hu: 'hungary', pl: 'poland',
        ro: 'romania', bg: 'bulgaria', hr: 'croatia', si: 'slovenia',
        gr: 'greece', cy: 'cyprus', ee: 'estonia', lv: 'latvia', lt: 'lithuania',
        mt: 'malta'
      };

      const userCountryCode = Localization.region.toLowerCase();
      const userCountry = iso2toName[userCountryCode] || '';

      let totaleNazionale = 0, totaleEuropeo = 0, totaleParziali = 0, totaleExtra = 0;
      let countNazionali = 0, countEuropei = 0, countParziali = 0, countExtra = 0;

      history.forEach(item => {
        const countries = item.countries || [];
        const lowerCountries = countries.map(c => c.toLowerCase());

        const allNational = lowerCountries.length > 0 && lowerCountries.every(c => c === userCountry);
        const allEU = lowerCountries.length > 0 && lowerCountries.every(c => isEU(c));
        const onlyExtra = lowerCountries.length > 0 && lowerCountries.every(c => !isEU(c));

        if (allNational) {
          totaleNazionale += 100;
          countNazionali++;
        } else if (allEU) {
          totaleEuropeo += 100;
          countEuropei++;
        } else if (onlyExtra) {
          totaleExtra += 100;
          countExtra++;
        } else {
          totaleParziali += 100;
          countParziali++;
        }
      });

      const somma = totaleNazionale + totaleEuropeo + totaleParziali + totaleExtra || 1;
      const totaleProdotti = countNazionali + countEuropei + countParziali + countExtra;

      setPieData([
        { name: 'Nazionali', population: Math.round((totaleNazionale / somma) * 100), color: '#4CAF50', legendFontColor: '#fff', legendFontSize: 14 },
        { name: 'Europei', population: Math.round((totaleEuropeo / somma) * 100), color: '#FFEB3B', legendFontColor: '#fff', legendFontSize: 14 },
        { name: 'Ibridi', population: Math.round((totaleParziali / somma) * 100), color: '#2196F3', legendFontColor: '#fff', legendFontSize: 14 },
        { name: 'Extra EU', population: Math.round((totaleExtra / somma) * 100), color: '#F44336', legendFontColor: '#fff', legendFontSize: 14 }
      ]);

      setTotali({ nazionali: countNazionali, europei: countEuropei, parziali: countParziali, extra: countExtra });
      setTotaleScansioni(totaleProdotti);
      setDataReady(true);
    } catch (e) {
      console.error('Errore nel caricamento dati', e);
    }
  };

  const isEU = (country) => {
    const eu = [
      'france','germany','italy','spain','portugal','austria','belgium','netherlands','luxembourg','ireland','denmark','sweden','finland','czech-republic','slovakia','hungary','poland','romania','bulgaria','croatia','slovenia','greece','cyprus','estonia','latvia','lithuania','malta'
    ];
    return eu.includes(country.toLowerCase());
  };

  const handleResetStats = () => {
    Alert.alert('Conferma', 'Sei sicuro di voler azzerare tutte le statistiche?', [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Azzera',
        onPress: async () => {
          await AsyncStorage.removeItem('scan_history');
          loadData();
        },
        style: 'destructive'
      }
    ]);
  };

  const percentualeFavorEuropa = (totali.nazionali + totali.europei + totali.parziali) / totaleScansioni;
  const percentualeEuropaPura = (totali.nazionali + totali.europei) / (totali.nazionali + totali.europei + totali.extra || 1);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.resetContainer}>
          <TouchableOpacity onPress={handleResetStats} style={styles.resetIconRow}>
            <MaterialIcons name="refresh" size={24} color="#FFCC00" />
            <Text style={styles.resetLabel}>Azzera</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Analisi delle scansioni</Text>
        <View style={styles.separatortop} />

        {dataReady ? (
          <View>
            <Text style={styles.subtitle}>Distribuzione delle provenienze</Text>
            <PieChart
              data={pieData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor={'population'}
              backgroundColor={'transparent'}
              paddingLeft={''}
              center={[0, 0]}
            />

            <Text style={styles.subtitle}>Prodotti scansionati ({totaleScansioni})</Text>
            <View style={styles.legendRowCentered}>
              <Text style={[styles.legendItem, { color: '#4CAF50' }]}>🟩 {totali.nazionali}</Text>
              <Text style={[styles.legendItem, { color: '#FFEB3B' }]}>🟨 {totali.europei}</Text>
              <Text style={[styles.legendItem, { color: '#2196F3' }]}>🟦 {totali.parziali}</Text>
              <Text style={[styles.legendItem, { color: '#F44336' }]}>🟥 {totali.extra}</Text>
            </View>
            <View style={styles.separator} />

            <Text style={styles.subtitle}>Supporto alla produzione europea (nazionali + europei + ibridi)</Text>
            <Text style={styles.percentText}>{Math.round(percentualeFavorEuropa * 100)}%</Text>
            <View style={styles.gradientBarWrapper}>
              <LinearGradient
                colors={['#FFEB3B', '#2196F3', '#F44336']}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.gradientBar}
              />
              <View style={[styles.arrowIndicator, { left: `${Math.round(percentualeFavorEuropa * 100)}%` }]}> 
                <Text style={styles.arrowText}>★</Text>
              </View>
            </View>

            <Text style={[styles.subtitle, { marginTop: 20 }]}>Quota di prodotti 100% europei vs 100% extra-UE</Text>
            <Text style={styles.percentText}>{Math.round(percentualeEuropaPura * 100)}%</Text>
            <View style={styles.gradientBarWrapper}>
              <LinearGradient
                colors={['#FFEB3B', '#2196F3', '#F44336']}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.gradientBar}
              />
              <View style={[styles.arrowIndicator, { left: `${Math.round(percentualeEuropaPura * 100)}%` }]}> 
                <Text style={styles.arrowText}>★</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Dettagli', 'Funzione in arrivo!')}>
              <Text style={styles.buttonText}>Dettagli ➤</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.text}>Sto caricando i dati...</Text>
        )}
      </ScrollView>

      {!isPremium && (
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill}>
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.unlockBanner}
              onPress={() => Alert.alert('Funzione Premium', 'Questa funzione è disponibile solo per utenti Premium.')}
            >
              <Text style={styles.unlockText}>🔒 Tocca qui per sbloccare i dettagli Premium</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#003399',
  backgroundGradientTo: '#003399',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: () => '#fff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003399',
    padding: 16,
  },
  resetContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFCC00',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  resetIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetLabel: {
    color: '#FFCC00',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#ffcc00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003399',
  },
  legendRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 10,
  },
  legendItem: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  separator: {
    borderBottomColor: '#FFCC00',
    borderBottomWidth: 2,
    marginVertical: 30,
    width: '99%',
    alignSelf: 'center',
  },
  separatortop: {
    borderBottomColor: '#FFCC00',
    borderBottomWidth: 2,
    marginVertical: 30,
    width: '99%',
    alignSelf: 'center',
  },
  gradientBarWrapper: {
    position: 'relative',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 30,
    marginTop: 20,
    marginBottom: 10,
  },
  gradientBar: {
    height: '100%',
    width: '100%',
  },
  arrowIndicator: {
    position: 'absolute',
    top: -5,
    transform: [{ translateX: -10 }],
    alignItems: 'center',
    zIndex: 2,
  },
  arrowText: {
    fontSize: 24,
    color: '#FFEB3B',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  percentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unlockBanner: {
    backgroundColor: '#FFCC00',
    padding: 12,
    borderRadius: 10,
    zIndex: 3,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  unlockText: {
    fontWeight: 'bold',
    color: '#003399',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 80,
  },
});
