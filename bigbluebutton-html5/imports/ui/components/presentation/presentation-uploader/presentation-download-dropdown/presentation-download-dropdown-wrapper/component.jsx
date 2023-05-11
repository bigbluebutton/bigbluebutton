import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.shape.isRequired,
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onKeyUp: PropTypes.func.isRequired,
};

class PresentationDownloadDropdownWrapper extends PureComponent {
  constructor(props) {
    super(props);

    // Bind Mouse Event Handlers
    this.internalClickHandler = this.internalClickHandler.bind(this);
    this.internalDoubleClickHandler = this.internalDoubleClickHandler.bind(this);
    this.internalMouseDownHandler = this.internalMouseDownHandler.bind(this);
    this.internalMouseUpHandler = this.internalMouseUpHandler.bind(this);

    // Bind Keyboard Event Handlers
    this.internalKeyPressHandler = this.internalKeyPressHandler.bind(this);
    this.internalKeyDownHandler = this.internalKeyDownHandler.bind(this);
    this.internalKeyUpHandler = this.internalKeyUpHandler.bind(this);
  }

  validateDisabled(eventHandler, ...args) {
    const { disabled } = this.props;
    if (!disabled && typeof eventHandler === 'function') {
      return eventHandler(...args);
    }

    return null;
  }

  // Define Mouse Event Handlers
  internalClickHandler(...args) {
    const { onClick } = this.props;
    return this.validateDisabled(onClick, ...args);
  }

  internalDoubleClickHandler(...args) {
    const { onDoubleClick } = this.props;
    return this.validateDisabled(onDoubleClick, ...args);
  }

  internalMouseDownHandler(...args) {
    const { onMouseDown } = this.props;
    return this.validateDisabled(onMouseDown, ...args);
  }

  internalMouseUpHandler(...args) {
    const { onMouseUp } = this.props;
    return this.validateDisabled(onMouseUp, ...args);
  }

  // Define Keyboard Event Handlers
  internalKeyPressHandler(...args) {
    const { onKeyPress } = this.props;
    return this.validateDisabled(onKeyPress, ...args);
  }

  internalKeyDownHandler(...args) {
    const { onKeyDown } = this.props;
    return this.validateDisabled(onKeyDown, ...args);
  }

  internalKeyUpHandler(...args) {
    const { onKeyUp } = this.props;
    return this.validateDisabled(onKeyUp, ...args);
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
        // Render Mouse event handlers
        onClick={this.internalClickHandler}
        onDoubleClick={this.internalDoubleClickHandler}
        onMouseDown={this.internalMouseDownHandler}
        onMouseUp={this.internalMouseUpHandler}
        // Render Keyboard event handlers
        onKeyPress={this.internalKeyPressHandler}
        onKeyDown={this.internalKeyDownHandler}
        onKeyUp={this.internalKeyUpHandler}
      >
        {children}
      </Styled.DropdownMenuWrapper>
    );
  }
}

PresentationDownloadDropdownWrapper.propTypes = propTypes;

export default PresentationDownloadDropdownWrapper;
