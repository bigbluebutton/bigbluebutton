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
  static wait(tip, event) {
    const tooltipTarget = event.target;
    const expandedEl = tooltipTarget.parentElement.querySelector('[aria-expanded="true"]');
    const isTarget = expandedEl === tooltipTarget;
    if (expandedEl && !isTarget) return;

    const findLabel = (node) => {
      const { nodeName, lastChild, parentElement } = node;
      if (nodeName.toLowerCase() === 'button') return lastChild.innerText;
      return findLabel(parentElement);
    };
    const label = findLabel(tooltipTarget);
    if (label) tip.set({ content: label });
    // if we are not able to get the text, the default content is used

    tip.show();
  }

  constructor(props) {
    super(props);

    this.tippySelectorId = _.uniqueId('tippy-');
    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.handleEscapeHide = this.handleEscapeHide.bind(this);
    this.delay = [150, 50];
  }

  componentDidMount() {
    const {
      position,
      title,
    } = this.props;

    const options = {
      placement: position,
      performance: true,
      content: title,
      delay: this.delay,
      onShow: this.onShow,
      onHide: this.onHide,
      wait: Tooltip.wait,
      touchHold: true,
      size: 'regular',
      distance: 10,
      arrow: true,
      arrowType: 'sharp',
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
      id: this.tippySelectorId,
      className: cx(children.props.className, className),
    });

    return WrappedComponentBound;
  }
}

export default Tooltip;

Tooltip.defaultProps = defaultProps;
Tooltip.propTypes = propTypes;
