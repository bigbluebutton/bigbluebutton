

import React, { PureComponent } from 'react';
import Styled from './styles'

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
    if (!this.props.disabled && typeof eventHandler === 'function') {
      return eventHandler(...args);
    }

    return null;
  }

  // Define Mouse Event Handlers
  internalClickHandler(...args) {
    return this.validateDisabled(this.props.onClick, ...args);
  }

  internalDoubleClickHandler(...args) {
    return this.validateDisabled(this.props.onDoubleClick, ...args);
  }

  internalMouseDownHandler(...args) {
    return this.validateDisabled(this.props.onMouseDown, ...args);
  }

  internalMouseUpHandler(...args) {
    return this.validateDisabled(this.props.onMouseUp, ...args);
  }

  // Define Keyboard Event Handlers
  internalKeyPressHandler(...args) {
    return this.validateDisabled(this.props.onKeyPress, ...args);
  }

  internalKeyDownHandler(...args) {
    return this.validateDisabled(this.props.onKeyDown, ...args);
  }

  internalKeyUpHandler(...args) {
    return this.validateDisabled(this.props.onKeyUp, ...args);
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

export default PresentationDownloadDropdownWrapper;
