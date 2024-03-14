import React from 'react';
import * as Styled from './styles';

const Spinner = () => {
  return (
    <Styled.LoadingSpinnerWrapper>
      <Styled.LoadingSpinner />
    </Styled.LoadingSpinnerWrapper>
  );
};

export default Spinner;
