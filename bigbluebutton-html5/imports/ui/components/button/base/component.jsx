import React from 'react';
import PropTypes from 'prop-types';

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
  onClick: (props, propName, componentName) => {
    if (!props.onClick && !props.onMouseDown && !props.onMouseUp) {
      return new Error('One of props \'onClick\' or \'onMouseDown\' or' +
        ` 'onMouseUp' was not specified in '${componentName}'.`);
    }

    return null;
  },
  onMouseDown: (props, propName, componentName) => {
    if (!props.onClick && !props.onMouseDown && !props.onMouseUp) {
      return new Error('One of props \'onClick\' or \'onMouseDown\' or' +
        ` 'onMouseUp' was not specified in '${componentName}'.`);
    }

    return null;
  },
  onMouseUp: (props, propName, componentName) => {
    if (!props.onClick && !props.onMouseDown && !props.onMouseUp) {
      return new Error('One of props \'onClick\' or \'onMouseDown\' or' +
        ` 'onMouseUp' was not specified in '${componentName}'.`);
    }

    return null;
  },

  onKeyPress: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  setRef: PropTypes.func,
};

const defaultProps = {
  disabled: false,
  tagName: 'button',
  onClick: undefined,
  onMouseDown: undefined,
  onMouseUp: undefined,
  onKeyPress: undefined,
  onKeyDown: undefined,
  onKeyUp: undefined,
  setRef: undefined,
};

/**
 * Event handlers below are used to intercept a parent event handler from
 * firing when the Button is disabled.
 * Key press event handlers intercept firing for
 * keyboard users to comply with ARIA standards.
 */

export default class ButtonBase extends React.Component {
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
    const Component = this.props.tagName;

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

    // Delete setRef callback if it exists
    delete remainingProps.setRef;

    return (
      <Component
        ref={this.props.setRef}
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
