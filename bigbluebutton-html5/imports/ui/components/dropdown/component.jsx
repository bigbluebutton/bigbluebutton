import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import styles from './styles';
import DropdownTrigger from './trigger/component';
import DropdownContent from './content/component';

const propTypes = {
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

export default class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false, };
    this.handleShow = this.handleShow.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
  }

  handleShow() {
    this.setState({ isOpen: true });
  }

  handleHide() {
    this.setState({ isOpen: false });
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
    const { children } = this.props;

    let trigger = children.find(x => x.type === DropdownTrigger);
    const content = children.find(x => x.type === DropdownContent);

    trigger = React.cloneElement(trigger, {
      handleToggle: this.handleToggle,
    });

    return (
      <div className={styles.dropdown}>
        {trigger}
        {this.state.isOpen ? content : null}
      </div>
    );
  }
}

Dropdown.propTypes = propTypes;
