import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

import KEY_CODES from '/imports/utils/keyCodes';

const propTypes = {
  children: React.PropTypes.element.isRequired,
};

export default class DropdownTrigger extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleClick() {
    const { dropdownToggle } = this.props;
    return dropdownToggle();
  }

  handleKeyDown(event) {
    const { dropdownShow, dropdownHide, } = this.props;

    if ([KEY_CODES.SPACE, KEY_CODES.ENTER].includes(event.which)) {
      event.preventDefault();
      event.stopPropagation();

      return findDOMNode(this).click();
    }

    if ([KEY_CODES.ARROW_UP, KEY_CODES.ARROW_DOWN].includes(event.which)) {
      dropdownShow();
    }

    if (KEY_CODES.ESCAPE === event.which) {
      dropdownHide();
    }

  }

  render() {
    const { children, style, className, } = this.props;
    const TriggerComponent = React.Children.only(children);

    const TriggerComponentBounded = React.cloneElement(children, {
      onClick: this.handleClick,
      onKeyDown: this.handleKeyDown,
      'aria-haspopup': true,
      tabIndex: '0',
      style: style,
      className: cx(children.props.className, className),
    });

    return TriggerComponentBounded;
  }
}

DropdownTrigger.propTypes = propTypes;
