import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

class Left extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Styled.HideButton
        className="buttonWrapper"
        icon="left_arrow"
        tabindex={0}
        {...this.props}
      />
    );
  }
}

Left.propTypes = {
  accessKey: PropTypes.any,
  'aria-label': PropTypes.string,
  'data-test': PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
};

export default Left;
