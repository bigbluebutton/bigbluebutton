import React from 'react';
import PropTypes from 'prop-types';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const propTypes = {
  action: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    handler: PropTypes.func.isRequired,
  }).isRequired,
  options: PropTypes.array.isRequired,
};

const UserActions = (props) => {
  const { action, options } = props;

  const userAction = (
    <DropdownListItem
      key={_.uniqueId('action-item-')}
      icon={action.icon}
      label={action.label}
      defaultMessage={action.label}
      onClick={action.handler.bind(this, ...options)}
      placeInTabOrder
    />
  );

  return userAction;
};

UserActions.propTypes = propTypes;
export default UserActions;
