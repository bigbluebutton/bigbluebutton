import React from 'react';
import LoadingScreen from '../component';

interface LoadingContent {
  isLoading: boolean;
}

interface LoadingContextContent extends LoadingContent {
  setLoading: (isLoading: boolean) => void;
}

export const LoadingContext = React.createContext<LoadingContextContent>({
  isLoading: false,
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
  });

  return (
    <LoadingContext.Provider value={{
      isLoading: loading.isLoading,
      setLoading: (isLoading: boolean) => {
        setLoading({
          isLoading,
        });
      },
    }}
    >
      {
        loading.isLoading
          ? (
            <LoadingScreen />
          )
          : null
      }
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingScreenHOC;
