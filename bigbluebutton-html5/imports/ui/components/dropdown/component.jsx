import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import styles from './styles';
import DropdownTrigger from './trigger/component';
import DropdownContent from './content/component';
import cx from 'classnames';

const FOCUSABLE_CHILDREN = `[tabindex]:not([tabindex="-1"]), a, input, button`;

const propTypes = {
  /**
   * The dropdown needs a trigger and a content component as childrens
   */
  children: (props, propName, componentName) => {
    const children = props[propName];

    if (!children || children.length < 2) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }

    const trigger = children.find(x => x.type === DropdownTrigger);
    const content = children.find(x => x.type === DropdownContent);

    if (!trigger) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Missing `DropdownTrigger`. Validation failed.'
      );
    }

    if (!content) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Missing `DropdownContent`. Validation failed.'
      );
    }
  },
};

const defaultProps = {
  isOpen: false,
};

export default class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false, };
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
    this.setState({ isOpen: true }, this.handleStateCallback);

    const contentElement = findDOMNode(this.refs.content);
    contentElement.querySelector(FOCUSABLE_CHILDREN).focus();
  }

  handleHide() {
    this.setState({ isOpen: false }, this.handleStateCallback);
    const triggerElement = findDOMNode(this.refs.trigger);
    triggerElement.focus();
  }

  componentDidMount () {
    const { addEventListener } = window;
    addEventListener('click', this.handleWindowClick, false);
  }

  componentWillUnmount () {
    const { removeEventListener } = window;
    removeEventListener('click', this.handleWindowClick, false);
  }

  handleWindowClick(event) {
    const dropdownElement = findDOMNode(this);
    const shouldUpdateState = event.target !== dropdownElement &&
                              !dropdownElement.contains(event.target) &&
                              this.state.isOpen;

    if (shouldUpdateState) {
      this.handleHide();
    }
  }

  handleToggle() {
    this.state.isOpen ?
    this.handleHide() :
    this.handleShow();
  }

  render() {
    const { children, className, style } = this.props;

    let trigger = children.find(x => x.type === DropdownTrigger);
    let content = children.find(x => x.type === DropdownContent);

    trigger = React.cloneElement(trigger, {
      ref: 'trigger',
      dropdownToggle: this.handleToggle,
      dropdownShow: this.handleShow,
      dropdownHide: this.handleHide,
    });

    content = React.cloneElement(content, {
      ref: 'content',
      'aria-expanded': this.state.isOpen,
      dropdownToggle: this.handleToggle,
      dropdownShow: this.handleShow,
      dropdownHide: this.handleHide,
    });

    return (
      <div style={style} className={cx(styles.dropdown, className)}>
        {trigger}
        {content}
      </div>
    );
  }
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;
