import React from 'react';
import Styled from './styles';

const LoadingScreen = () => (
  <Styled.Background>
    <Styled.Spinner animations>
      <Styled.Bounce1 animations />
      <Styled.Bounce2 animations />
      <div />
    </Styled.Spinner>
  </Styled.Background>
);

export default LoadingScreen;
