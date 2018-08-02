import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import Icon from '/imports/ui/components/icon/component';
import { styles } from '/imports/ui/components/dropdown/list/styles';

const propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default class UserActions extends Component {
  getSetStatusItem() {
    return [
      (<Icon iconName="user" key={_.uniqueId('item-icon-')} className={styles.itemIcon} />),
      (<span key="label" className={styles.itemLabel}>{this.props.label}</span>),
      (<Icon iconName="right_arrow" key={_.uniqueId('item-icon-')} className={styles.moreIcon} />),
    ];
  }

  render() {
    const {
      key, icon, label, handler, options, desc,
    } = this.props;

    return (
      <DropdownListItem
        {...{
          key,
          icon,
          label,
          label,
        }}
        onClick={() => handler.call(this, ...options)}
      >
        {
        desc === 'set_status' ? this.getSetStatusItem() : null
      }
      </DropdownListItem>
    );
  }
}

UserActions.propTypes = propTypes;
