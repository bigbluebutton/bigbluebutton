import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

function Right(props) {
  const { disabled } = props;
  return (
    <Styled.CloseButton
      disabled={disabled}
      size="md"
      color="light"
      hideLabel
      circle
      {...props}
    />
  );
}

Right.propTypes = {
  hideLabel: PropTypes.bool,
  disabled: PropTypes.bool,
  accessKey: PropTypes.any,
  'aria-label': PropTypes.string,
  'data-test': PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
};

export default Right;
