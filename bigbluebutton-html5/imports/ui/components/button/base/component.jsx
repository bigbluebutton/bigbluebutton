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

export default class ButtonBase extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let Component = this.props.tagName;

    const remainingProps = Object.assign({}, this.props);
    delete remainingProps.label;
    delete remainingProps.tagName;

    return (
      <Component aria-label={this.props.label} {...remainingProps}>
        {this.props.children}
      </Component>
    );
  }
}

ButtonBase.propTypes = propTypes;
ButtonBase.defaultProps = defaultProps;
