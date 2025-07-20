import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

const { width, height } = Dimensions.get('window');

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Gestion d\'Emprunts',
  subMessage = 'Chargement en cours...'
}) => {
  // Animations refs
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation du logo (entrée avec scale et rotation)
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation du texte (fade in avec délai)
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Animation de pulsation continue
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Animation des points de chargement
    const dotsLoop = Animated.loop(
      Animated.timing(dotsAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    );
    dotsLoop.start();

    return () => {
      pulseLoop.stop();
      dotsLoop.stop();
    };
  }, []);

  // Interpolation pour la rotation du logo
  const logoRotationInterpolated = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Interpolation pour les points animés
  const dotsOpacity = dotsAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [0.3, 1, 0.3, 0.3],
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      
      {/* Background gradient effect */}
      <View style={styles.gradientBackground} />
      
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [
                { scale: Animated.multiply(logoScale, pulseAnim) },
                { rotate: logoRotationInterpolated },
              ],
            },
          ]}
        >
          <Icon name="account-balance-wallet" size={80} color="#FFFFFF" />
        </Animated.View>
        
        {/* Cercles concentriques animés */}
        <Animated.View
          style={[
            styles.logoRing1,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.1],
                outputRange: [0.3, 0.1],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.logoRing2,
            {
              transform: [{ scale: Animated.multiply(pulseAnim, 0.8) }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.1],
                outputRange: [0.2, 0.05],
              }),
            },
          ]}
        />
      </View>

      {/* Text Content */}
      <Animated.View
        style={[
          styles.textContainer,
          { opacity: textOpacity }
        ]}
      >
        <Text style={styles.appName}>{message}</Text>
        <Text style={styles.tagline}>Solution moderne de gestion</Text>
        
        {/* Loading text avec points animés */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{subMessage}</Text>
          <View style={styles.dotsContainer}>
            <Animated.Text style={[styles.dot, { opacity: dotsOpacity }]}>•</Animated.Text>
            <Animated.Text 
              style={[
                styles.dot, 
                { 
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 0.3, 1, 0.3],
                  })
                }
              ]}
            >
              •
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.dot, 
                { 
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 0.3, 0.3, 1],
                  })
                }
              ]}
            >
              •
            </Animated.Text>
          </View>
        </View>
      </Animated.View>

      {/* Progress bar */}
      <Animated.View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: dotsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['20%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Version info */}
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.copyright}>© 2024 Gestion d'Emprunts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2196F3',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
    opacity: 0.9,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoRing1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  logoRing2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '300',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    fontSize: 20,
    color: '#FFFFFF',
    marginHorizontal: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 120,
    left: 40,
    right: 40,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default LoadingScreen;