// utils/toast.helper.ts
import { Animated } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

class ToastManager {
  private listeners: ((config: ToastConfig) => void)[] = [];

  subscribe(listener: (config: ToastConfig) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show(config: ToastConfig) {
    this.listeners.forEach(listener => listener(config));
  }

  success(message: string, duration?: number) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number) {
    this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number) {
    this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number) {
    this.show({ message, type: 'info', duration });
  }
}

export const Toast = new ToastManager();