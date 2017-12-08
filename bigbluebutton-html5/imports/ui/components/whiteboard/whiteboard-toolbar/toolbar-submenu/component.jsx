import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styles from '../styles';
import ToolbarSubmenuItem from '../toolbar-submenu-item/component';

export default class ToolbarSubmenu extends Component {
  static getCustomIcon(type, obj) {
    if (type === 'color') {
      return (
        <svg className={styles.customSvgIcon}>
          <rect x="20%" y="20%" width="60%" height="60%" fill={obj.value} />
        </svg>
      );
    } else if (type === 'thickness') {
      return (
        <svg className={styles.customSvgIcon}>
          <circle cx="50%" cy="50%" r={obj.value} fill="#F3F6F9" />
        </svg>
      );
    } else if (type === 'font-size') {
      return (
        <p className={styles.textThickness} style={{ fontSize: obj.value }}>
          Aa
        </p>
      );
    }

    return null;
  }

  static getWrapperClassNames(type) {
    if (type === 'color') {
      return cx(styles.colorList, styles.toolbarList);
    } else if (type === 'thickness') {
      return cx(styles.thicknessList, styles.toolbarList);
    } else if (type === 'font-size') {
      return cx(styles.fontSizeList, styles.toolbarList);
    } else if (type === 'annotations') {
      return cx(styles.annotationList, styles.toolbarList);
    }

    return null;
  }
  constructor() {
    super();

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
  }

  onItemClick(objectToReturn) {
    if (this.props.onItemClick) {
      this.props.onItemClick(objectToReturn);
    }
  }

  handleMouseEnter() {
    if (this.props.handleMouseEnter) {
      this.props.handleMouseEnter();
    }
  }

  handleMouseLeave() {
    if (this.props.handleMouseLeave) {
      this.props.handleMouseLeave();
    }
  }

  render() {
    const { type, objectsToRender, objectSelected, label, customIcon } = this.props;

    return (
      <div
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        className={ToolbarSubmenu.getWrapperClassNames(type)}
      >
        {objectsToRender ? objectsToRender.map(obj =>
          (
            <ToolbarSubmenuItem
              label={obj.value}
              icon={!customIcon ? obj.icon : null}
              customIcon={customIcon ? ToolbarSubmenu.getCustomIcon(type, obj) : null}
              onItemClick={this.onItemClick}
              objectToReturn={obj}
              className={cx(
                styles.toolbarListButton,
                objectSelected.value === obj.value ? styles.selectedListButton : '',
              )}
              key={obj.value}
            />
          ),
        ) : null}
      </div>
    );
  }
}

ToolbarSubmenu.propTypes = {
  onItemClick: PropTypes.func.isRequired,
  handleMouseEnter: PropTypes.func.isRequired,
  handleMouseLeave: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  objectsToRender: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        value: PropTypes.string.isRequired,
      }),
      PropTypes.shape({
        value: PropTypes.number.isRequired,
      }),
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }),
    ]).isRequired,
  ).isRequired,
  objectSelected: PropTypes.oneOfType([
    PropTypes.shape({
      value: PropTypes.string.isRequired,
    }),
    PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }),
  ]).isRequired,
  label: PropTypes.string.isRequired,
  customIcon: PropTypes.bool.isRequired,
};
