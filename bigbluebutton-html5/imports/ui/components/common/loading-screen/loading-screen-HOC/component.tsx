import React from 'react';
import LoadingScreen from '../component';

interface LoadingContent {
  isLoading: boolean;
  loadingMessage: string;
}

interface LoadingContextContent extends LoadingContent {
  setLoading: (isLoading: boolean, loadingMessage: string) => void;
}

export const LoadingContext = React.createContext<LoadingContextContent>({
  isLoading: false,
  loadingMessage: '',
  setLoading: () => { },
});

interface LoadingScreenHOCProps {
  children: React.ReactNode;
}

const LoadingScreenHOC: React.FC<LoadingScreenHOCProps> = ({
  children,
}) => {
  const [loading, setLoading] = React.useState<LoadingContent>({
    isLoading: false,
    loadingMessage: '',
  });

  return (
    <LoadingContext.Provider value={{
      loadingMessage: loading.loadingMessage,
      isLoading: loading.isLoading,
      setLoading: (isLoading: boolean, loadingMessage: string = '') => {
        setLoading({
          isLoading,
          loadingMessage,
        });
      },
    }}
    >
      {
        loading.isLoading
          ? (
            <LoadingScreen>
              <h1>{loading.loadingMessage}</h1>
            </LoadingScreen>
          )
          : null
      }
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingScreenHOC;
