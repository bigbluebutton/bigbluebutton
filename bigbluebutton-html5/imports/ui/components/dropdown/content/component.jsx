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
      placement, children, className,
      dropdownToggle, dropdownShow, dropdownHide, dropdownIsOpen,
      ...restProps
    } = this.props;

    const placementName = placement.split(' ').join('-');

    const boundChildren = Children.map(children, child => cloneElement(child, {
      dropdownIsOpen,
      dropdownToggle,
      dropdownShow,
      dropdownHide,
    }));

    return (
      <div
        data-test="dropdownContent"
        className={cx(styles.content, styles[placementName], className)}
        {...restProps}
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
