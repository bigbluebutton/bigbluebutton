import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles.scss';

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
  constructor(props) {
    super(props);
  }

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

    return (
      <div key={user.id} className={styles.userItemActions}>
        <ul className={styles.userActionsList}>

          {!user.isCurrent ? this.renderUserAction(openChat, router, user) : null}
          {currentUser.isModerator ? this.renderUserAction(clearStatus, user) : null}
          {currentUser.isModerator ? this.renderUserAction(setPresenter, user) : null}
          {currentUser.isModerator ? this.renderUserAction(promote, user) : null}
          {currentUser.isModerator ? this.renderUserAction(kick, user) : null}
        </ul>
      </div>
    );
  }

  renderUserAction(action, ...parameters) {
    const currentUser = this.props.currentUser;
    const user = this.props.user;

    const userAction = (
      <li onClick={action.handler.bind(this, ...parameters)}
          className={styles.userActionsItem}>
        <Icon iconName={action.icon} className={styles.actionIcon}/>
        <span className={styles.actionText}>
          {action.label}
        </span>
      </li>
    );

    return userAction;
  }
}

UserActions.propTypes = propTypes;
UserActions.defaultProps = defaultProps;

export default withRouter(UserActions);
