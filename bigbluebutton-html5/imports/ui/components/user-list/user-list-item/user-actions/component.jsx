import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles.scss';
import _ from 'underscore';

import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';

const propTypes = {
  user: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
  }).isRequired,

  currentUser: React.PropTypes.shape({
    isModerator: React.PropTypes.bool.isRequired,
  }).isRequired,

  userActions: React.PropTypes.shape().isRequired,
};

const defaultProps = {
};

class UserActions extends Component {
  render() {
    const {
      user,
      currentUser,
      router,
    } = this.props;

    const {
      openChat,
      clearStatus,
      setPresenter,
      promote,
      kick,
    } = this.props.userActions;

    let actions = [
      (!user.isCurrent ? this.renderUserAction(openChat, router, user) : null),
      (currentUser.isModerator ? this.renderUserAction(clearStatus, user) : null),
      (currentUser.isModerator ? this.renderUserAction(setPresenter, user) : null),
      (currentUser.isModerator ? this.renderUserAction(promote, user) : null),
      (currentUser.isModerator ? this.renderUserAction(kick, user) : null),
    ];

    return (
      <DropdownList {...this.props}>
        {_.compact(actions)}
      </DropdownList>
    );
  }

  renderUserAction(action, ...parameters) {
    const currentUser = this.props.currentUser;
    const user = this.props.user;

    const userAction = (
      <DropdownListItem
        icon={action.icon}
        label={action.label}
        defaultMessage={action.label}
        onClick={action.handler.bind(this, ...parameters)}
      />
    );

    return userAction;
  }
}

UserActions.propTypes = propTypes;
UserActions.defaultProps = defaultProps;

export default withRouter(UserActions);
