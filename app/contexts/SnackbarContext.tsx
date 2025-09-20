import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MessageType } from '@/app/components/ui/Snackbar';

interface SnackbarState {
  visible: boolean;
  type: MessageType;
  message: string;
  duration?: number;
}

interface SnackbarOptions {
  duration?: number;
}

interface SnackbarContextType {
  snackbar: SnackbarState;
  showSnackbar: (type: MessageType, message: string, options?: SnackbarOptions) => void;
  hideSnackbar: () => void;
  showSuccess: (message: string, options?: SnackbarOptions) => void;
  showError: (message: string, options?: SnackbarOptions) => void;
  showWarning: (message: string, options?: SnackbarOptions) => void;
  showInfo: (message: string, options?: SnackbarOptions) => void;
}

const initialState: SnackbarState = {
  visible: false,
  type: 'info',
  message: '',
  duration: 3000,
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>(initialState);

  const showSnackbar = useCallback((
    type: MessageType,
    message: string,
    options: SnackbarOptions = {}
  ) => {
    setSnackbar({
      visible: true,
      type,
      message,
      duration: options.duration || 3000,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccess = useCallback((message: string, options?: SnackbarOptions) => {
    showSnackbar('success', message, options);
  }, [showSnackbar]);

  const showError = useCallback((message: string, options?: SnackbarOptions) => {
    showSnackbar('error', message, options);
  }, [showSnackbar]);

  const showWarning = useCallback((message: string, options?: SnackbarOptions) => {
    showSnackbar('warning', message, options);
  }, [showSnackbar]);

  const showInfo = useCallback((message: string, options?: SnackbarOptions) => {
    showSnackbar('info', message, options);
  }, [showSnackbar]);

  const value: SnackbarContextType = {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbarContext = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbarContext must be used within a SnackbarProvider');
  }
  return context;
};
