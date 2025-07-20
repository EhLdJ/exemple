import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PageLoaderProps {
  visible: boolean;
  message?: string;
  color?: string;
  overlay?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  visible,
  message = 'Chargement...',
  color = '#2196F3',
  overlay = true
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation de rotation continue
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      return () => {
        spinAnimation.stop();
      };
    } else {
      // Animation de sortie
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 0.8,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  const LoaderContent = (
    <Animated.View
      style={[
        styles.container,
        overlay && styles.overlay,
        {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <View style={[styles.loader, { borderColor: color }]}>
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: color },
            { transform: [{ rotate: spin }] },
          ]}
        >
          <Icon name="sync" size={24} color="#FFFFFF" />
        </Animated.View>
      </View>
      <Text style={[styles.message, { color }]}>{message}</Text>
    </Animated.View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="none"
        statusBarTranslucent
      >
        {LoaderContent}
      </Modal>
    );
  }

  return LoaderContent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loader: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
  },
});

export default PageLoader;