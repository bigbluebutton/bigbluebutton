import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tippy from 'tippy.js';
import _ from 'lodash';
import cx from 'classnames';

const propTypes = {
  title: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['bottom']),
  children: PropTypes.element.isRequired,
  dynamicTitle: PropTypes.bool
};

const defaultProps = {
  position: 'bottom',
  dynamicTitle: true,
};

class Tooltip extends Component {
  constructor(props) {
    super(props);

    this.tippySelectorId = _.uniqueId('tippy-');
    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.handleEscapeHide = this.handleEscapeHide.bind(this);
  }

  componentDidMount() {
    const {
      position,
      dynamicTitle,
    } = this.props;

    const options = {
      position,
      dynamicTitle,
      onShow: this.onShow,
      onHide: this.onHide,
    };

    this.tooltip = Tippy(`#${this.tippySelectorId}`, options);
  }

  onShow() {
    document.addEventListener('keyup', this.handleEscapeHide);
  }

  onHide() {
    document.removeEventListener('keyup', this.handleEscapeHide);
  }

  handleEscapeHide(e) {
    if (e.keyCode !== 27) return;

    const popper = this.tooltip.tooltips[0].hide();
  }

  render() {
    const {
      children,
      className,
      title,
      ...restProps
    } = this.props;

    const WrappedComponent = React.Children.only(children);

    const WrappedComponentBound = React.cloneElement(WrappedComponent, {
      ...restProps,
      title,
      id: this.tippySelectorId,
      className: cx(children.props.className, className),
    });

    return WrappedComponentBound;
  }
}

export default Tooltip;

Tooltip.defaultProps = defaultProps;
Tooltip.propTypes = propTypes;
