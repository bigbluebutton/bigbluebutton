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

    const findLabel = (node) => {
      let rtn;
      if (node) {
        const { nodeName, lastChild, parentElement } = node;
        if (nodeName.toLowerCase() === 'button') rtn = lastChild.innerText;
        else rtn = findLabel(parentElement);
      }
      return rtn;
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

    this.state = {
      enableAnimation: Settings.application.animations,
    };
  }

  componentDidMount() {
    const {
      position,
      title,
      tooltipDistance,
    } = this.props;
    const { enableAnimation } = this.state;

    let distance = 0;
    if (tooltipDistance < 0) {
      if (enableAnimation) distance = 10;
      else distance = 20;
    } else {
      distance = tooltipDistance;
    }

    const options = {
      placement: position,
      performance: true,
      content: title,
      delay: enableAnimation ? ANIMATION_DELAY : [ANIMATION_DELAY[0], 0],
      duration: enableAnimation ? ANIMATION_DURATION : 0,
      onShow: this.onShow,
      onHide: this.onHide,
      wait: Tooltip.wait,
      touchHold: true,
      size: 'regular',
      distance,
      arrow: true,
      arrowType: 'sharp',
      aria: null,
      animation: enableAnimation ? DEFAULT_ANIMATION : ANIMATION_NONE,
    };
    this.tooltip = Tippy(`#${this.tippySelectorId}`, options);
  }

  componentDidUpdate() {
    const { enableAnimation } = this.state;
    const { animations } = Settings.application;
    const { title } = this.props;

    if (animations !== enableAnimation) {
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
      });

      this.setEnableAnimation(animations);
    }

    const elem = document.getElementById(this.tippySelectorId);
    if (elem._tippy) elem._tippy.set({ content: title });
  }

  onShow() {
    document.addEventListener('keyup', this.handleEscapeHide);
  }

  onHide() {
    document.removeEventListener('keyup', this.handleEscapeHide);
  }

  setEnableAnimation(enableAnimation) {
    this.setState({ enableAnimation });
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
