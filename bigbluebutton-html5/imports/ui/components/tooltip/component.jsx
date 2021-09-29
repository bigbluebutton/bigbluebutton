import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cx from 'classnames';
import { ESCAPE } from '/imports/utils/keyCodes';
import Settings from '/imports/ui/services/settings';
import Tippy, { roundArrow, hideAll } from 'tippy.js';
import 'tippy.js/dist/svg-arrow.css';
import 'tippy.js/animations/shift-away.css';
import './bbbtip.css';
import BaseButton from '/imports/ui/components/button/base/component';
import ButtonEmoji from
  '/imports/ui/components/button/button-emoji/ButtonEmoji';

const ANIMATION_DURATION = 350;
const ANIMATION_DELAY = [150, 50];
const DEFAULT_ANIMATION = 'shift-away';
const ANIMATION_NONE = 'none';
const TIP_OFFSET = '0, 10';

const propTypes = {
  title: PropTypes.string,
  position: PropTypes.oneOf(['bottom','top']),
  children: PropTypes.element.isRequired,
  className: PropTypes.string,
};

const defaultProps = {
  position: 'bottom',
  className: null,
  title: '',
};

class Tooltip extends Component {
  static buttonComponentHasButtonEmoji(_component) {
    return (
      _component
      && (_component.type === BaseButton)
      && (_component.props)
      && (_component.props.children)
      && (typeof _component.props.children.find === 'function')
      && (!!_component.props.children.find((_child) => (
        _child && _child.type === ButtonEmoji
      )))
    );
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
    } = this.props;

    const { animations } = Settings.application;

    const options = {
      aria: null,
      allowHTML: false,
      animation: animations ? DEFAULT_ANIMATION : ANIMATION_NONE,
      arrow: roundArrow,
      boundary: 'window',
      content: title,
      delay: animations ? ANIMATION_DELAY : [ANIMATION_DELAY[0], 0],
      duration: animations ? ANIMATION_DURATION : 0,
      onShow: this.onShow,
      onHide: this.onHide,
      offset: TIP_OFFSET,
      placement: position,
      touch: 'hold',
      theme: 'bbbtip',
      multiple: false,
      onBeforeUpdate: () => {
        hideAll();
      },
    };
    this.tooltip = Tippy(`#${this.tippySelectorId}`, options);
  }

  componentDidUpdate() {
    const { animations } = Settings.application;
    const { title, fullscreen } = this.props;
    const elements = document.querySelectorAll('[id^="tippy-"]');

    Array.from(elements).filter((e) => {
      const instance = e._tippy;

      if (!instance) return false;

      const animation = animations ? DEFAULT_ANIMATION : ANIMATION_NONE;

      if (animation === instance.props.animation) return false;

      return true;
    }).forEach((e) => {
      const instance = e._tippy;
      instance.setProps({
        animation: animations
          ? DEFAULT_ANIMATION : ANIMATION_NONE,
        delay: animations ? ANIMATION_DELAY : [ANIMATION_DELAY[0], 0],
        duration: animations ? ANIMATION_DURATION : 0,
      });
    });

    const elem = document.getElementById(this.tippySelectorId);
    const opts = { content: title, appendTo: fullscreen || document.body };
    if (elem && elem._tippy) elem._tippy.setProps(opts);
  }

  componentWillUnmount() {
    if (this.tooltip[0]) this.tooltip[0].hide();
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
      ...restProps
    } = this.props;

    let WrappedComponent;
    let WrappedComponentBound;

    if (Tooltip.buttonComponentHasButtonEmoji(children)) {
      const { children: grandChildren } = children.props;

      let otherChildren;

      [WrappedComponent, ...otherChildren] = grandChildren;

      WrappedComponentBound = React.cloneElement(WrappedComponent, {
        id: this.tippySelectorId,
        className: cx(WrappedComponent.props.className, className),
        key: this.tippySelectorId,
      });

      const ParentComponent = React.Children.only(children);
      const updatedChildren = [WrappedComponentBound, ...otherChildren];

      return React.cloneElement(ParentComponent, null,
        updatedChildren);
    }

    WrappedComponent = React.Children.only(children);

    WrappedComponentBound = React.cloneElement(WrappedComponent, {
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
