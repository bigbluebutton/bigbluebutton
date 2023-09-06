import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

const propTypes = {
  children: PropTypes.shape({}).isRequired,
  disabled: PropTypes.bool.isRequired,
};

class PresentationDownloadDropdownWrapper extends PureComponent {
  validateDisabled(eventHandler, ...args) {
    const { disabled } = this.props;
    if (!disabled && typeof eventHandler === 'function') {
      return eventHandler(...args);
    }

    return null;
  }

  render() {
    const {
      disabled,
      children,
    } = this.props;

    return (
      <Styled.DropdownMenuWrapper
        disabled={disabled}
        aria-disabled={disabled}
      >
        {children}
      </Styled.DropdownMenuWrapper>
    );
  }
}

PresentationDownloadDropdownWrapper.propTypes = propTypes;

export default PresentationDownloadDropdownWrapper;
