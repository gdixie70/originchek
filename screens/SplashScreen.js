import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, Dimensions, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PremiumContext } from '../contexts/PremiumContext'; // ✅ aggiunto

const { width, height } = Dimensions.get('window');

const phrases = [
  "Scopri chi c'è dietro il marchio",
  "Sai da dove viene davvero il tuo cibo?",
  "L'origine conta. Scoprila ora.",
  "Trasparenza, sempre.",
  "Conosci cosa metti nel carrello",
];

const SplashScreen = () => {
  const navigation = useNavigation();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const translateX = useRef(new Animated.Value(-width)).current;

  const { isPremium, setIsPremium } = useContext(PremiumContext); // ✅ aggiunto

  const animatePhrase = () => {
    translateX.setValue(-width);

    Animated.sequence([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(translateX, {
        toValue: width,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    });
  };

  useEffect(() => {
    animatePhrase();
  }, [currentPhraseIndex]);

  const handleStart = () => {
    navigation.navigate('Home');
  };

  return (
    <ImageBackground
      source={require('../assets/splash-stars.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>OriginCheck</Text>

        <Animated.Text
          style={[styles.subtitle, { transform: [{ translateX }] }]}
        >
          {phrases[currentPhraseIndex]}
        </Animated.Text>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Premium (sviluppo)</Text>
          <Switch
            value={isPremium}
            onValueChange={(val) => setIsPremium(val)}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Inizia a scoprire</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 40,
    lineHeight: 90,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: '#FFCC00',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    color: '#003399',
    fontWeight: 'bold',
  },
  switchContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
});