import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import styles from '../styles';

export default class WhiteboardToolbarItem extends Component {
  constructor() {
    super();

    this._onClick = this._onClick.bind(this);
  }

  _onClick() {
    const { objectToReturn, onItemClick } = this.props;
    // if there is a submenu name, then pass it to onClick
    // if not - it's probably "Undo", "Clear All", "Multi-user", etc. No submenu here.
    if (objectToReturn) {
      onItemClick(objectToReturn);
    } else {
      onItemClick();
    }
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
          customIcon={this.props.customIcon}
          onClick={this._onClick}
          onBlur={this.props.onBlur}
          className={this.props.className}
          onMouseEnter={this.props.onMouseEnter}
          onMouseLeave={this.props.onMouseLeave}
        />
        {this.props.renderSubMenu ? this.props.renderSubMenu() : null}
      </div>
    );
  }
}

WhiteboardToolbarItem.propTypes = {
  objectToReturn: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.number,
  ]),
  onItemClick: PropTypes.func.isRequired,
  icon: PropTypes.string,
  customIcon: PropTypes.node,
  label: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  className: PropTypes.string.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  renderSubMenu: PropTypes.func,
};

WhiteboardToolbarItem.defaultProps = {
  objectToReturn: null,
  icon: '',
  customIcon: (<p />),
  onBlur: null,
  onMouseLeave: null,
  onMouseEnter: null,
  renderSubMenu: null,
};
