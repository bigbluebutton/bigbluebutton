import React from 'react';
import _ from 'lodash';
import Styled from './styles';

const DEBOUNCE_TIMEOUT = 5000;
const DEBOUNCE_OPTIONS = {
  leading: true,
  trailing: false,
};

const ReloadButtonComponent = ({
  handleReload,
  label,
}) => (
  <Styled.Wrapper>
    <Styled.ReloadButton
      color="primary"
      icon="refresh"
      onClick={_.debounce(handleReload, DEBOUNCE_TIMEOUT, DEBOUNCE_OPTIONS)}
      label={label}
      hideLabel
    />
  </Styled.Wrapper>
);

export default ReloadButtonComponent;
