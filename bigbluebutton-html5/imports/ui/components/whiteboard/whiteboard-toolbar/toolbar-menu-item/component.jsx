import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import styles from '../styles';

export default class ToolbarMenuItem extends Component {
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
    return (
      <div className={styles.buttonWrapper}>
        <Button
          hideLabel
          role="button"
          color={'default'}
          size={'md'}
          label={this.props.label}
          icon={this.props.icon ? this.props.icon : null}
          customIcon={this.props.customIcon ? this.props.customIcon : null}
          onClick={this.handleItemClick}
          onBlur={this.props.onBlur}
          className={this.props.className}
        />
        {this.props.children}
      </div>
    );
  }
}

ToolbarMenuItem.propTypes = {
  // objectToReturn, children and onBlur are passed only with menu items that have submenus
  // thus they are optional
  onBlur: PropTypes.func,
  children: PropTypes.node,
  objectToReturn: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.number,
  ]),
  onItemClick: PropTypes.func.isRequired,
  // we can have either icon from the bigbluebutton-font or our custom svg/html
  // thus they are optional
  icon: PropTypes.string,
  customIcon: PropTypes.node,
  label: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
};

ToolbarMenuItem.defaultProps = {
  objectToReturn: null,
  icon: '',
  customIcon: null,
  onBlur: null,
  children: null,
};
