import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface QRLoadingScreenProps {
  visible: boolean;
  message?: string;
  onComplete?: () => void;
  timeRemaining?: number;
}

const { width } = Dimensions.get('window');

const QRLoadingScreen: React.FC<QRLoadingScreenProps> = ({
  visible,
  message = 'Génération du QR Code...',
  onComplete,
  timeRemaining = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      });

      // Animation de rotation continue
      const rotateLoop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateLoop.start();

      // Animation de pulsation
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // Animation de lueur
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      glowLoop.start();

      return () => {
        rotateLoop.stop();
        pulseLoop.stop();
        glowLoop.stop();
      };
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  if (!visible) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* QR Code Animation */}
        <View style={styles.qrContainer}>
          <Animated.View
            style={[
              styles.qrBackground,
              {
                transform: [{ scale: scaleAnim }, { rotate }],
                opacity: glowOpacity,
              },
            ]}
          />
          
          <Animated.View
            style={[
              styles.qrCode,
              {
                transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
              },
            ]}
          >
            <Icon name="qr-code" size={80} color="#2196F3" />
          </Animated.View>

          {/* Cercles de scan animés */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{ rotate }],
                opacity: glowOpacity,
              },
            ]}
          />
        </View>

        {/* Loading Text */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: scaleAnim }
          ]}
        >
          <Text style={styles.loadingText}>{message}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth }
                ]}
              />
            </View>
          </View>

          {/* Timer */}
          {timeRemaining > 0 && (
            <Text style={styles.timerText}>
              Validité: {formatTime(timeRemaining)}
            </Text>
          )}

          {/* Status Text */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              🔐 Génération sécurisée en cours...
            </Text>
          </View>
        </Animated.View>

        {/* Decorative Elements */}
        <Animated.View
          style={[
            styles.decorativeCircle1,
            {
              transform: [{ rotate }, { scale: pulseAnim }],
              opacity: glowOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.decorativeCircle2,
            {
              transform: [{ rotate: rotate.interpolate({
                inputRange: ['0deg', '360deg'],
                outputRange: ['360deg', '0deg'],
              }) }],
              opacity: glowOpacity,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  qrContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  qrBackground: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  qrCode: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  scanLine: {
    position: 'absolute',
    width: 200,
    height: 2,
    backgroundColor: '#2196F3',
    borderRadius: 1,
  },
  textContainer: {
    alignItems: 'center',
    width: width - 80,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  timerText: {
    fontSize: 16,
    color: '#FFA726',
    fontWeight: '600',
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 50,
    right: 50,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 100,
    left: 60,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.4)',
  },
});

export default QRLoadingScreen;