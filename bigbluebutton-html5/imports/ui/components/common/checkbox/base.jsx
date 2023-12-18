import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

const propTypes = {
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  ariaLabelledBy: PropTypes.string,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  ariaDesc: PropTypes.string,
};

const defaultProps = {
  disabled: false,
  checked: false,
  ariaLabelledBy: null,
  ariaLabel: null,
  ariaDescribedBy: null,
  ariaDesc: null,
};

export default class Base extends PureComponent {
  constructor(props) {
    super(props);

    this.onChange = props.onChange;
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.element = createRef();
  }

  componentDidMount() {
    const element = findDOMNode(this.element.current);
    if (element) element.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    const element = findDOMNode(this.element.current);
    if (element) element.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    const { key } = event;
    const node = findDOMNode(this.element.current);
    if (key === 'Enter' && node) {
      const input = node.getElementsByTagName('input')[0];
      input?.click();
    }
  }

  handleChange() {
    const { disabled, keyValue } = this.props;
    if (disabled) return;
    this.onChange(keyValue);
  }

  render() {
    return null;
  }
}

Base.propTypes = propTypes;
Base.defaultProps = defaultProps;
