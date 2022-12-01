import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

class Right extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Styled.HideButton
        className="buttonWrapper"
        icon="left_arrow"
        tabIndex={0}
        hideLabel
        {...this.props}
      />
    );
  }
}

Right.propTypes = {
  accessKey: PropTypes.any,
  'aria-label': PropTypes.string,
  'data-test': PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
};

export default Right;
