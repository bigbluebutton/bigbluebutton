import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

class Left extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Styled.CloseButton
        size="md"
        color="light"
        hideLabel
        circle
        {...this.props}
      />
    );
  }
}

Left.propTypes = {
  accessKey: PropTypes.any,
  'aria-label': PropTypes.string,
  'data-test': PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
};

export default Left;
