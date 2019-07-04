import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tippy from 'tippy.js';
import _ from 'lodash';
import cx from 'classnames';
import { ESCAPE } from '/imports/utils/keyCodes';
import Settings from '/imports/ui/services/settings';

const DEFAULT_ANIMATION = 'shift-away';
const ANIMATION_NONE = 'none';
const ANIMATION_DURATION = 350;
const ANIMATION_DELAY = [150, 50];

const propTypes = {
  title: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['bottom']),
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
  tooltipDistance: PropTypes.number,
};

const defaultProps = {
  position: 'bottom',
  className: null,
  tooltipDistance: -1,
};

class Tooltip extends Component {
  static wait(tip, event) {
    const tooltipTarget = event.target;
    const expandedEl = tooltipTarget.parentElement.querySelector('[aria-expanded="true"]');
    const isTarget = expandedEl === tooltipTarget;
    if (expandedEl && !isTarget) return;
    tip.show();
  }

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
      title,
      tooltipDistance,
    } = this.props;

    const { animations } = Settings.application;

    let distance = 0;
    if (tooltipDistance < 0) {
      if (animations) distance = 10;
      else distance = 20;
    } else {
      distance = tooltipDistance;
    }

    const options = {
      placement: position,
      performance: true,
      content: title,
      delay: animations ? ANIMATION_DELAY : [ANIMATION_DELAY[0], 0],
      duration: animations ? ANIMATION_DURATION : 0,
      onShow: this.onShow,
      onHide: this.onHide,
      wait: Tooltip.wait,
      touchHold: true,
      size: 'regular',
      distance,
      arrow: true,
      arrowType: 'sharp',
      aria: null,
      animation: animations ? DEFAULT_ANIMATION : ANIMATION_NONE,
    };
    this.tooltip = Tippy(`#${this.tippySelectorId}`, options);
  }

  componentDidUpdate() {
    const { animations } = Settings.application;
    const { title } = this.props;
    const elements = document.querySelectorAll('[id^="tippy-"]');

    Array.from(elements).filter((e) => {
      const instance = e._tippy;

      if (!instance) return false;

      const animation = animations ? DEFAULT_ANIMATION : ANIMATION_NONE;

      if (animation === instance.props.animation) return false;

      return true;
    }).forEach((e) => {
      const instance = e._tippy;
      instance.set({
        animation: animations
          ? DEFAULT_ANIMATION : ANIMATION_NONE,
        distance: animations ? 10 : 20,
        delay: animations ? ANIMATION_DELAY : [ANIMATION_DELAY[0], 0],
        duration: animations ? ANIMATION_DURATION : 0,
      });

      // adjusts the distance for tooltips on the presentation toolbar
      Object.entries(instance.reference.classList).reduce((acc, [key]) => {
        if (!instance.reference.classList[key].match(/(presentationBtn)/)) return false;
        instance.set({ distance: animations ? 35 : 45 });
        return true;
      });
    });

    const elem = document.getElementById(this.tippySelectorId);
    if (elem._tippy) elem._tippy.set({ content: title });
  }

  onShow() {
    document.addEventListener('keyup', this.handleEscapeHide);
  }

  onHide() {
    document.removeEventListener('keyup', this.handleEscapeHide);
  }

  handleEscapeHide(e) {
    if (this.tooltip
      && e.keyCode === ESCAPE
      && this.tooltip.tooltips
      && this.tooltip.tooltips[0]) {
      this.tooltip.tooltips[0].hide();
    }
  }

  render() {
    const {
      children,
      className,
      title,
      tooltipDistance,
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
