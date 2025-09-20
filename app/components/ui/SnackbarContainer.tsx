import React from 'react';
import Snackbar from '@/app/components/ui/Snackbar';
import { useSnackbarContext } from '@/app/contexts/SnackbarContext';

const SnackbarContainer: React.FC = () => {
  const { snackbar, hideSnackbar } = useSnackbarContext();

  return (
    <Snackbar
      visible={snackbar.visible}
      type={snackbar.type}
      message={snackbar.message}
      duration={snackbar.duration}
      onDismiss={hideSnackbar}
    />
  );
};

export default SnackbarContainer;
