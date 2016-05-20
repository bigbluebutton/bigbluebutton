import React, { PropTypes } from 'react';
import BaseButton from './base/component';
import styles from './styles';
import cx from 'classnames';
import _ from 'underscore';

import Icon from '../icon/component';

const SIZES = [
  'lg', 'md', 'sm',
];

const COLORS = [
  'default', 'primary', 'danger', 'success',
];

const propTypes = {
  ...BaseButton.propTypes,
  /**
   * Defines the button size style
   * @type {("lg"|"md"|"sm")}
   * @defaultValue 'md'
   */
  size: PropTypes.oneOf(SIZES),

  /**
   * Defines the button color style
   * @type {("default"|"primary"|"danger"|"success")}
   * @defaultValue 'md'
   */
  color: PropTypes.oneOf(COLORS),

  /**
   * Defines if the button should be styled as a ghost (outline)
   * @defaultValue false
   */
  ghost: PropTypes.bool,

  /**
   * Defines if the button should be styled as circle
   * @defaultValue false
   */
  circle: PropTypes.bool,

  /**
   * Defines if the button should have `display: block`
   * @defaultValue false
   */
  block: PropTypes.bool,

  /**
   * Defines the button icon
   * @defaultValue undefined
   */
  icon: PropTypes.string,

  /**
   * Defines the button icon is on the right side
   * @defaultValue false
   */
  iconRight: PropTypes.bool,

  /**
   * Defines the button label
   * @defaultValue undefined
   */
  label: PropTypes.string,
};

const defaultProps = {
  ...BaseButton.defaultProps,
  size: 'md',
  color: 'default',
  ghost: false,
  circle: false,
  block: false,
  iconRight: false,
};

export default class Button extends BaseButton {
  constructor(props) {
    super(props);
    props['aria-labelledby'] = this.id;
  }

  componentWillMount() {
    this.labelId = _.uniqueId('btn-label-');
  }

  _getClassNames() {
    const {
      icon,
      size,
      color,
      ghost,
      circle,
      block,
      iconRight,
    } = this.props;

    let propClassNames = {};
    propClassNames[styles.button] = true;
    propClassNames[styles[size]] = true;
    propClassNames[styles[color]] = true;
    propClassNames[styles.ghost] = ghost;
    propClassNames[styles.circle] = circle;
    propClassNames[styles.block] = block;
    propClassNames[styles.iconRight] = iconRight;

    return propClassNames;
  }

  render() {
    let renderFuncName = this.props.circle ?
      'renderCircle' : 'renderDefault';

    return this[renderFuncName]();
  }

  renderDefault() {
    const {
      tagName,
      className,
      iconRight,
    } = this.props;

    const Component = tagName;

    /* TODO: We can change this and make the button with flexbox to avoid html
      changes */
    const renderLeftFuncName = !iconRight ? 'renderIcon' : 'renderLabel';
    const renderRightFuncName = !iconRight ? 'renderLabel' : 'renderIcon';

    return (
      <Component
        className={cx(this._getClassNames(), className)}
        {...this.props}>
        {this[renderLeftFuncName]()}
        {this[renderRightFuncName]()}
      </Component>
    );
  }

  renderCircle() {
    const {
      tagName,
      className,
      size,
      iconRight
    } = this.props;

    const Component = tagName;

    return (
      <span className={cx(styles[size], styles.buttonWrapper, className)} {...this.props}>
        {!iconRight ? null : this.renderLabel(true)}
        <Component className={cx(this._getClassNames())} aria-labelledby={this.labelId}>
          {this.renderIcon()}
        </Component>
        {iconRight ? null : this.renderLabel(true)}
      </span>
    );
  }

  renderIcon() {
    const iconName = this.props.icon;

    if (iconName) {
      return (<Icon className={styles.icon} iconName={iconName} />);
    }

    return null;
  }

  renderLabel(labelledBy = false) {
    const label = this.props.label;

    if (label) {
      if (labelledBy) {
        return (
          <span className={styles.label} id={this.labelId}>
            {label}
            {this.props.children}
          </span>
        );
      }

      return (
        <span className={styles.label}>
          {label}
          {this.props.children}
        </span>
      );
    }

    return null;
  }
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
