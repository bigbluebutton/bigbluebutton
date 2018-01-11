import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tippy from 'tippy.js';
import _ from 'lodash';
import cx from 'classnames';
import { ESCAPE } from '/imports/utils/keyCodes';

const propTypes = {
  title: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['bottom']),
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
};

const defaultProps = {
  position: 'bottom',
  className: null,
};

class Tooltip extends Component {
  constructor(props) {
    super(props);

    this.tippySelectorId = _.uniqueId('tippy-');
    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.handleEscapeHide = this.handleEscapeHide.bind(this);
    this.delay = [150, 50];
    this.dynamicTitle = true;
  }

  componentDidMount() {
    const {
      position,
    } = this.props;

    const options = {
      position,
      dynamicTitle: this.dynamicTitle,
      delay: this.delay,
      onShow: this.onShow,
      onHide: this.onHide,
      touchHold: true,
    };

    this.tooltip = Tippy(`#${this.tippySelectorId}`, options);
  }

  onShow() {
    document.addEventListener('keyup', this.handleEscapeHide);
    window.setTimeout(() => {
      this.tooltip.tooltips[0].hide();
      document.removeEventListener('keyup', this.handleEscapeHide);
    }, 5000);
  }

  onHide() {
    document.removeEventListener('keyup', this.handleEscapeHide);
  }

  handleEscapeHide(e) {
    if (e.keyCode !== ESCAPE) return;

    this.tooltip.tooltips[0].hide();
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
