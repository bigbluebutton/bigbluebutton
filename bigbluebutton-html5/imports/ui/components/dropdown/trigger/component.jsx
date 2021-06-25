import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import KEY_CODES from '/imports/utils/keyCodes';

const propTypes = {
  children: PropTypes.element.isRequired,
};

export default class DropdownTrigger extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.trigger = null;
  }

  handleClick() {
    const { dropdownToggle, onClick } = this.props;
    if (onClick) onClick();
    return dropdownToggle();
  }

  handleKeyDown(event) {
    const { dropdownShow, dropdownHide } = this.props;

    if ([KEY_CODES.SPACE, KEY_CODES.ENTER].includes(event.which)) {
      event.preventDefault();
      event.stopPropagation();
    } else if ([KEY_CODES.ARROW_UP, KEY_CODES.ARROW_DOWN].includes(event.which)) {
      dropdownShow();
    } else if (KEY_CODES.ESCAPE === event.which) {
      dropdownHide();
    }
  }

  render() {
    const { dropdownIsOpen } = this.props;
    const remainingProps = { ...this.props };
    delete remainingProps.dropdownToggle;
    delete remainingProps.dropdownShow;
    delete remainingProps.dropdownHide;
    delete remainingProps.dropdownIsOpen;

    const {
      children,
      className,
      ...restProps
    } = remainingProps;

    const TriggerComponent = React.Children.only(children);

    const TriggerComponentBounded = React.cloneElement(TriggerComponent, {
      ...restProps,
      ref: (ref) => { this.trigger = ref; },
      onClick: this.handleClick,
      onKeyDown: this.handleKeyDown,
      className: cx(children.props.className, className),
      'aria-expanded': dropdownIsOpen,
    });

    return TriggerComponentBounded;
  }
}

DropdownTrigger.propTypes = propTypes;
