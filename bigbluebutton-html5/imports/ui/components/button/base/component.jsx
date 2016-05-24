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

  onClick: PropTypes.func.isRequired,
};

const defaultProps = {
  disabled: false,
  tagName: 'button',
};

export default class ButtonBase extends Component {
  constructor(props) {
    super(props);
    props.role = 'button';
  }

  render() {
    let Component = this.props.tagName;

    return (
      <Component {...this.props}>
        {this.props.children}
      </Component>
    );
  }
}

ButtonBase.propTypes = propTypes;
ButtonBase.defaultProps = defaultProps;
