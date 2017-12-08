import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import styles from '../styles';

export default class ToolbarSubmenuItem extends Component {
  constructor() {
    super();

    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick() {
    const { objectToReturn, onItemClick } = this.props;
    // if there is a submenu name, then pass it to onClick
    // if not - it's probably "Undo", "Clear All", "Multi-user", etc.
    // in the second case we'll pass undefined and it will work fine anyway
    onItemClick(objectToReturn);
  }

  render() {

    const { className, customIcon, icon, label } = this.props

    return (
      <div className={styles.buttonWrapper}>
        <Button
          hideLabel
          role="button"
          color={'default'}
          size={'md'}
          label={label}
          aria-label={label}
          icon={icon}
          customIcon={customIcon}
          onClick={this.handleItemClick}
          className={className}
        />
      </div>
    );
  }
}


ToolbarSubmenuItem.propTypes = {
  label: PropTypes.string.isRequired,
  icon: PropTypes.string,
  customIcon: PropTypes.node,
  onItemClick: PropTypes.func.isRequired,
  objectToReturn: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.number,
  ]).isRequired,
  className: PropTypes.string.isRequired,
};

ToolbarSubmenuItem.defaultProps = {
  icon: null,
  customIcon: null,
};
