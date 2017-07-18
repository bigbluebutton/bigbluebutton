import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import styles from './styles';
import DropdownTrigger from './trigger/component';
import DropdownContent from './content/component';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';

const FOCUSABLE_CHILDREN = '[tabindex]:not([tabindex="-1"]), a, input, button';

const intlMessages = defineMessages({
  close: {
    id: 'app.dropdown.close',
    description: 'Close button label',
  },
});

const propTypes = {
  /**
   * The dropdown needs a trigger and a content component as childrens
   */
  children: (props, propName, componentName) => {
    const children = props[propName];

    if (!children || children.length < 2) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to` +
        ` \`${componentName}\`. Validation failed.`,
      );
    }

    const trigger = children.find(x => x.type === DropdownTrigger);
    const content = children.find(x => x.type === DropdownContent);

    if (!trigger) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to` +
        ` \`${componentName}\`. Missing \`DropdownTrigger\`. Validation failed.`,
      );
    }

    if (!content) {
      return new Error(
        `Invalid prop \`${propName}\` supplied to` +
        ` \`${componentName}\`. Missing \`DropdownContent\`. Validation failed.`,
      );
    }
  },
};

const defaultProps = {
  isOpen: false,
  autoFocus: false,
};

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.handleStateCallback = this.handleStateCallback.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.isOpen !== this.props.isOpen
      && this.state.isOpen !== this.props.isOpen) {
      this.setState({ isOpen: this.props.isOpen }, this.handleStateCallback);
    }
  }

  handleStateCallback() {
    const { onShow, onHide } = this.props;

    if (this.state.isOpen && onShow) {
      onShow();
    } else if (onHide) {
      onHide();
    }
  }

  handleShow() {
    const { addEventListener } = window;
    addEventListener('click', this.handleWindowClick, false);

    this.setState({ isOpen: true }, this.handleStateCallback);
  }

  handleHide() {
    const { removeEventListener } = window;
    removeEventListener('click', this.handleWindowClick, false);

    const { autoFocus } = this.props;

    this.setState({ isOpen: false }, this.handleStateCallback);

    if (autoFocus) {
      const triggerElement = findDOMNode(this.trigger);
      triggerElement.focus();
    }
  }

  handleWindowClick(event) {
    if (this.state.isOpen) {
      const dropdownElement = findDOMNode(this);
      const shouldUpdateState = event.target !== dropdownElement &&
                              !dropdownElement.contains(event.target) &&
                              this.state.isOpen;

      if (shouldUpdateState) {
        this.handleHide();
      }
    }
  }

  handleToggle() {
    this.state.isOpen ?
    this.handleHide() :
    this.handleShow();
  }

  render() {
    const {
      children,
      className,
      style,
      intl,
      ...otherProps,
    } = this.props;

    let trigger = children.find(x => x.type === DropdownTrigger);
    let content = children.find(x => x.type === DropdownContent);

    trigger = React.cloneElement(trigger, {
      ref: (ref) => { this.trigger = ref; },
      dropdownToggle: this.handleToggle,
      dropdownShow: this.handleShow,
      dropdownHide: this.handleHide,
    });

    content = React.cloneElement(content, {
      ref: (ref) => { this.content = ref; },
      'aria-expanded': this.state.isOpen,
      dropdownToggle: this.handleToggle,
      dropdownShow: this.handleShow,
      dropdownHide: this.handleHide,
    });

    return (
      <div
        style={style}
        className={cx(styles.dropdown, className)}
        aria-live={otherProps['aria-live']}
        aria-relevant={otherProps['aria-relevant']}
        aria-haspopup={otherProps['aria-haspopup']}
        aria-label={otherProps['aria-label']}>
        {trigger}
        {content}
        { this.state.isOpen ?
          <Button
            className={styles.close}
            label={intl.formatMessage(intlMessages.close)}
            size={'lg'}
            color={'default'}
            onClick={this.handleHide}
          /> : null }
      </div>
    );
  }
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;
export default injectIntl(Dropdown);
