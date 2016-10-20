import React, { Component, PropTypes } from 'react';

const propTypes = {
  /**
   * Defines HTML disable Attribute
   * @defaultValue false
   */
  disabled: PropTypes.bool,

  /**
   * Defines HTML Tag
   * @defaultValue 'button'
   */
  tagName: PropTypes.string,

  /**
   * Defines the button label
   * @defaultValue undefined
   */
  label: PropTypes.string.isRequired,

  /**
   * Defines the button click handler
   * @defaultValue undefined
   */
  onClick: PropTypes.func.isRequired,
};

const defaultProps = {
  disabled: false,
  tagName: 'button',
  role: 'button',
};

/**
 * Event handlers below are used to intercept a parent event handler from
 * firing when the Button is disabled.
 * Key press event handlers intercept firing for
 * keyboard users to comply with ARIA standards.
 */

export default class ButtonBase extends Component {
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
  }

  // Define Mouse Event Handlers
  internalClickHandler(event) {
    return this.validateDisabled(this.props.onClick, ...arguments);
  }

  internalDoubleClickHandler(event) {
    return this.validateDisabled(this.props.onDoubleClick, ...arguments);
  }

  internalMouseDownHandler(event) {
    return this.validateDisabled(this.props.onMouseDown, ...arguments);
  }

  internalMouseUpHandler() {
    return this.validateDisabled(this.props.onMouseUp, ...arguments);
  }

  // Define Keyboard Event Handlers
  internalKeyPressHandler() {
    return this.validateDisabled(this.props.onKeyPress, ...arguments);
  }

  internalKeyDownHandler() {
    return this.validateDisabled(this.props.onKeyDown, ...arguments);
  }

  internalKeyUpHandler() {
    return this.validateDisabled(this.props.onKeyUp, ...arguments);
  }

  render() {
    let Component = this.props.tagName;

    const remainingProps = Object.assign({}, this.props);
    delete remainingProps.label;
    delete remainingProps.tagName;
    delete remainingProps.disabled;

    // Delete Mouse event handlers
    delete remainingProps.onClick;
    delete remainingProps.onDoubleClick;
    delete remainingProps.onMouseDown;
    delete remainingProps.onMouseUp;

    // Delete Keyboard event handlers
    delete remainingProps.onKeyPress;
    delete remainingProps.onKeyDown;
    delete remainingProps.onKeyUp;

    return (
      <Component
        aria-label={this.props.label}
        aria-disabled={this.props.disabled}

        // Render Mouse event handlers
        onClick={this.internalClickHandler}
        onDoubleClick={this.internalDoubleClickHandler}
        onMouseDown={this.internalMouseDownHandler}
        onMouseUp={this.internalMouseUpHandler}

        // Render Keyboard event handlers
        onKeyPress={this.internalKeyPressHandler}
        onKeyDown={this.internalKeyDownHandler}
        onKeyUp={this.internalKeyUpHandler}

        {...remainingProps}
      >
        {this.props.children}
      </Component>
    );
  }
}

ButtonBase.propTypes = propTypes;
ButtonBase.defaultProps = defaultProps;
