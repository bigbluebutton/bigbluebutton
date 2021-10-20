import React from 'react';
import Styled from './styles';

const CustomLogo = props => (
  <div>
    <Styled.Branding>
      <img src={props.CustomLogoUrl} alt="custom branding logo" />
    </Styled.Branding>
    <Styled.Separator />
  </div>
);

export default CustomLogo;
