import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import styles from './styles';
import DropdownTrigger from './trigger/component';
import DropdownContent from './content/component';

const intlMessages = defineMessages({
  close: {
    id: 'app.dropdown.close',
    description: 'Close button label',
  },
});

const noop = () => {};

const propTypes = {
  /**
   * The dropdown needs a trigger and a content component as children
   */
  children: (props, propName, componentName) => {
    const children = props[propName];

    if (!children || children.length < 2) {
      return new Error(`Invalid prop \`${propName}\` supplied to` +
        ` \`${componentName}\`. Validation failed.`);
    }

    const trigger = children.find(x => x.type === DropdownTrigger);
    const content = children.find(x => x.type === DropdownContent);

    if (!trigger) {
      return new Error(`Invalid prop \`${propName}\` supplied to` +
        ` \`${componentName}\`. Missing \`DropdownTrigger\`. Validation failed.`);
    }

    if (!content) {
      return new Error(`Invalid prop \`${propName}\` supplied to` +
        ` \`${componentName}\`. Missing \`DropdownContent\`. Validation failed.`);
    }

    return null;
  },
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  onShow: PropTypes.func,
  autoFocus: PropTypes.bool,
};

const defaultProps = {
  children: null,
  isOpen: false,
  onShow: noop,
  onHide: noop,
  autoFocus: false,
};

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isOpen && !prevState.isOpen) {
      this.props.onShow();
    }

    if (!this.state.isOpen && prevState.isOpen) {
      this.props.onHide();
    }
  }

  handleShow() {
    this.setState({ isOpen: true }, () => {
      const { addEventListener } = window;
      addEventListener('click', this.handleWindowClick, true);
    });
  }

  handleHide() {
    this.setState({ isOpen: false }, () => {
      const { removeEventListener } = window;
      removeEventListener('click', this.handleWindowClick, true);
    });
  }

  handleWindowClick(event) {
    const triggerElement = findDOMNode(this.trigger);

    if (!this.state.isOpen
      || triggerElement === event.target
      || triggerElement.contains(event.target)) {
      return;
    }

    this.handleHide();
  }

  handleToggle() {
    return this.state.isOpen ? this.handleHide() : this.handleShow();
  }

  render() {
    const {
      children,
      className,
      style,
      intl,
      ...otherProps
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
        aria-label={otherProps['aria-label']}
        tabIndex={-1}
      >
        {trigger}
        {content}
        {this.state.isOpen ?
          <Button
            className={styles.close}
            label={intl.formatMessage(intlMessages.close)}
            size="lg"
            color="default"
            onClick={this.handleHide}
          /> : null}
      </div>
    );
  }
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;
export default injectIntl(Dropdown);
