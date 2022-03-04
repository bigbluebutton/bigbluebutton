import React from 'react';
import Styled from './styles';
import Settings from '/imports/ui/services/settings';

const { animations } = Settings.application;

const LoadingScreen = ({ children }) => (
  <Styled.Background>
    <Styled.Spinner animations={animations}>
      <Styled.Bounce1 animations={animations} />
      <Styled.Bounce2 animations={animations} />
      <div />
    </Styled.Spinner>
    <Styled.Message>
      {children}
    </Styled.Message>
  </Styled.Background>
);

export default LoadingScreen;
