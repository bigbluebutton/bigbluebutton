import React from 'react';
import Styled from './styles';
import Settings from '/imports/ui/services/settings';

const { animations } = Settings.application;

const Loader = ({ size }) => (
  <Styled.Spinner animations={animations} size={size}>
    <Styled.Bounce1 animations={animations} />
    <Styled.Bounce2 animations={animations} />
    <div />
  </Styled.Spinner>
);

export default Loader;
