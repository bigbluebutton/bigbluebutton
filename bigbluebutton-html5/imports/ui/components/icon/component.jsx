import React, { Component, PropTypes } from 'react';
import cx from 'classnames';

const propTypes = {
  iconName: PropTypes.string.isRequired,
  prependIconName: PropTypes.string,
};

const defaultProps = {
  prependIconName: 'icon-bbb-',
};

export default class Icon extends Component {
  render() {
    const { className, prependIconName, iconName, ...otherProps } = this.props;
    return (
      <i
        className={cx(className, [prependIconName, iconName].join(''))}
        {...otherProps}>
      </i>
    );
  }
}

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;
