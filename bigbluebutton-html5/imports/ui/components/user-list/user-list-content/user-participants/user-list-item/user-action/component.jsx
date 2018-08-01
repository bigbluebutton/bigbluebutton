import React from 'react';
import PropTypes from 'prop-types';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default class UserActions extends React.PureComponent {
  render() {
    const {
      key, icon, label, handler, options,
    } = this.props;

    return (
      <DropdownListItem
        key={key}
        icon={icon}
        label={label}
        defaultMessage={label}
        onClick={() => handler.call(this, ...options)}
      />
    );
  }
}

UserActions.propTypes = propTypes;
