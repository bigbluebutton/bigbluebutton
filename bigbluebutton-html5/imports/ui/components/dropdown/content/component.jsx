import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from '../styles';

const PLACEMENTS = [
  'top left', 'top', 'top right',
  'right top', 'right', 'right bottom',
  'bottom right', 'bottom', 'bottom left',
  'left bottom', 'left', 'left top',
];

const propTypes = {
  /**
   * Placements of the dropdown and its caret
   * @defaultValue 'top'
   */
  placement: PropTypes.oneOf(PLACEMENTS),
};

const defaultProps = {
  placement: 'top',
  'aria-expanded': false,
};

export default class DropdownContent extends Component {
  render() {
    const {
      placement, className, children, style,
    } = this.props;
    const { dropdownToggle, dropdownShow, dropdownHide } = this.props;

    const placementName = placement.split(' ').join('-');

    const boundChildren = Children.map(children, child => cloneElement(child, {
      dropdownToggle,
      dropdownShow,
      dropdownHide,
    }));

    return (
      <div
        style={style}
        aria-expanded={this.props['aria-expanded']}
        data-test="dropdownContent"
        className={cx(styles.content, styles[placementName], className)}
      >
        <div className={styles.scrollable}>
          {boundChildren}
        </div>
      </div>
    );
  }
}

DropdownContent.propTypes = propTypes;
DropdownContent.defaultProps = defaultProps;
