// components/ToastNotification.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';
import { Toast, ToastConfig } from './ToastModel';

const { width } = Dimensions.get('window');

const ToastNotification = () => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = Toast.subscribe((config) => {
      setToast(config);
      

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const duration = config.duration || 3000;
      setTimeout(() => {
        hideToast();
      }, duration);
    });

    return unsubscribe;
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  };

  if (!toast) return null;

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: <CheckCircle color="white" size={24} />,
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <XCircle color="white" size={24} />,
        };
      case 'warning':
        return {
          bg: 'bg-orange-500',
          icon: <AlertCircle color="white" size={24} />,
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          icon: <Info color="white" size={24} />,
        };
      default:
        return {
          bg: 'bg-gray-800',
          icon: <Info color="white" size={24} />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 z-50 px-4 pt-12"
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View
        className={`${styles.bg} rounded-2xl shadow-2xl flex-row items-center p-4`}
        style={{
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          maxWidth: width - 32,
        }}
      >
        <View className="mr-3">{styles.icon}</View>
        <Text className="text-white text-base font-semibold flex-1 flex-wrap">
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
};

export default ToastNotification;