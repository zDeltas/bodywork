import { useSnackbarContext } from '@/app/contexts/SnackbarContext';

export const useSnackbar = () => {
  return useSnackbarContext();
};

export default useSnackbar;
