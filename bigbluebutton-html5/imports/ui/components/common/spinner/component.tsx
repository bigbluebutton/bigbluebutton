import React from 'react';
import { LoadingSpinnerComponent, LoadingSpinnerContainer,
} from './styles';

const Spinner = () => {
  return (
    <LoadingSpinnerContainer>
        <LoadingSpinnerComponent />
    </LoadingSpinnerContainer>
  );
};

export default Spinner;
