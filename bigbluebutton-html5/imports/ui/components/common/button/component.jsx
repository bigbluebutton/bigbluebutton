import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Styled from './styles';
import BaseButton from './base/component';
import ButtonEmoji from './button-emoji/ButtonEmoji';

const SIZES = [
  'jumbo', 'lg', 'md', 'sm',
];

const COLORS = [
  'default', 'primary', 'danger', 'warning', 'success', 'dark', 'light', 'offline', 'muted', 'secondary',
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
   * Defines the button label should be visible
   * @defaultValue false
   */
  hideLabel: PropTypes.bool,

  /**
   * Optional SVG / html object can be passed to the button as an icon
   * Has to be styled before being sent to the Button
   * (e.g width, height, position and percentage-based object's coordinates)
   * @defaultvalue undefined
   */
  customIcon: PropTypes.node,
};

const defaultProps = {
  ...BaseButton.defaultProps,
  size: 'md',
  color: 'default',
  ghost: false,
  circle: false,
  block: false,
  iconRight: false,
  hideLabel: false,
  tooltipLabel: '',
};

export default class Button extends BaseButton {
  _cleanProps(otherProps) {
    const remainingProps = Object.assign({}, otherProps);
    delete remainingProps.icon;
    delete remainingProps.customIcon;
    delete remainingProps.size;
    delete remainingProps.color;
    delete remainingProps.ghost;
    delete remainingProps.circle;
    delete remainingProps.block;
    delete remainingProps.hideLabel;
    delete remainingProps.tooltipLabel;

    return remainingProps;
  }

  hasButtonEmojiComponent() {
    const { children } = this.props;

    if (!children) return false;

    const buttonEmoji = React.Children.only(children);

    return (buttonEmoji && buttonEmoji.type && buttonEmoji.type.name)
      ? (buttonEmoji.type.name === ButtonEmoji.name)
      : false;
  }

  render() {
    const {
      circle,
      hideLabel,
      label,
      'aria-label': ariaLabel,
      'aria-expanded': ariaExpanded,
      tooltipLabel,
      tooltipdelay,
      tooltipplacement,
    } = this.props;

    const renderFuncName = circle ? 'renderCircle' : 'renderDefault';

    if ((hideLabel && !ariaExpanded) || tooltipLabel) {
      const buttonLabel = label || ariaLabel;
      return (
        <TooltipContainer
          title={tooltipLabel || buttonLabel}
          delay={tooltipdelay}
          placement={tooltipplacement}
        >
          {this[renderFuncName]()}
        </TooltipContainer>
      );
    }

    return this[renderFuncName]();
  }

  renderDefault() {
    const {
      className,
      iconRight,
      size,
      color,
      ghost,
      circle,
      block,
      ...otherProps
    } = this.props;

    const remainingProps = this._cleanProps(otherProps);

    return (
      <Styled.Button
        size={size}
        color={color}
        ghost={ghost}
        circle={circle}
        block={block}
        className={className}
        iconRight={iconRight}
        {...remainingProps}
      >
        {this.renderIcon()}
        {this.renderLabel()}
      </Styled.Button>
    );
  }

  renderCircle() {
    const {
      className,
      size,
      iconRight,
      children,
      color,
      ghost,
      circle,
      block,
      ...otherProps
    } = this.props;

    const remainingProps = this._cleanProps(otherProps);

    return (
      <Styled.ButtonWrapper
        size={size}
        className={cx(size, 'buttonWrapper', className)}
        color={color}
        ghost={ghost}
        circle={circle}
        block={block}
        {...remainingProps}
      >
        {this.renderButtonEmojiSibling()}
        {!iconRight ? null : this.renderLabel()}
        <Styled.ButtonSpan
          size={size}
          color={color}
          ghost={ghost}
          circle={circle}
          block={block}
        >
          {this.renderIcon()}
        </Styled.ButtonSpan>
        {iconRight ? null : this.renderLabel()}
        {this.hasButtonEmojiComponent() ? children : null}
      </Styled.ButtonWrapper>
    );
  }

  renderButtonEmojiSibling() {
    if (!this.hasButtonEmojiComponent()) {
      return null;
    }

    return (<Styled.EmojiButtonSibling />);
  }

  renderIcon() {
    const {
      icon: iconName,
      customIcon,
    } = this.props;

    if (iconName) {
      return (<Styled.ButtonIcon iconName={iconName} />);
    } if (customIcon) {
      return customIcon;
    }

    return null;
  }

  renderLabel() {
    const { label, hideLabel } = this.props;

    return (
      <Styled.ButtonLabel hideLabel={hideLabel}>
        {label}
        {!this.hasButtonEmojiComponent() ? this.props.children : null}
      </Styled.ButtonLabel>
    );
  }
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
