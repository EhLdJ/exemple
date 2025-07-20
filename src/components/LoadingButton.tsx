import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  loadingText?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  color = '#2196F3',
  variant = 'primary',
  icon,
  loadingText,
  size = 'medium',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      // Animation de pulsation pendant le chargement
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.98,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      scaleAnim.setValue(1);
    }
  }, [loading]);

  const handlePress = () => {
    if (!loading && !disabled) {
      // Animation de pression
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      onPress();
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push({
          backgroundColor: disabled || loading ? `${color}80` : color,
        });
        break;
      case 'secondary':
        baseStyle.push({
          backgroundColor: disabled || loading ? '#f5f5f5' : '#f8f9fa',
          borderWidth: 1,
          borderColor: disabled || loading ? '#e0e0e0' : color,
        });
        break;
      case 'outline':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled || loading ? `${color}50` : color,
        });
        break;
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push({
          color: disabled || loading ? 'rgba(255, 255, 255, 0.7)' : '#FFFFFF',
        });
        break;
      case 'secondary':
      case 'outline':
        baseStyle.push({
          color: disabled || loading ? `${color}80` : color,
        });
        break;
    }

    return baseStyle;
  };

  const displayText = loading && loadingText ? loadingText : title;

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled && !loading ? 0.6 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={[...getButtonStyle(), style]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <Animated.View style={styles.loadingContainer}>
            <ActivityIndicator
              size={size === 'small' ? 'small' : 'small'}
              color={variant === 'primary' ? '#FFFFFF' : color}
              style={styles.spinner}
            />
            {loadingText && (
              <Text style={[...getTextStyle(), textStyle, styles.loadingText]}>
                {loadingText}
              </Text>
            )}
          </Animated.View>
        ) : (
          <Animated.View style={styles.contentContainer}>
            {icon && (
              <Icon
                name={icon}
                size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
                color={variant === 'primary' ? '#FFFFFF' : color}
                style={styles.icon}
              />
            )}
            <Text style={[...getTextStyle(), textStyle]}>
              {displayText}
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 52,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  spinner: {
    marginRight: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
});

export default LoadingButton;