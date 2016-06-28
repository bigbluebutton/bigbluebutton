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
};

const defaultProps = {
};

class UserActions extends Component {
  constructor(props) {
    super(props);

    this.handleOpenChat = this.props.userActions.openChat.bind(this);
    this.handleClearStatus = this.props.userActions.clearStatus.bind(this);
    this.handleSetPresenter = this.props.userActions.setPresenter.bind(this);
    this.handlePromote = this.props.userActions.promote.bind(this);
    this.handleKick = this.props.userActions.kick.bind(this);
  }

  render() {
    const {
      user,
      currentUser,
    } = this.props;

    return (
      <div key={user.id} className={styles.userItemActions}>
        <ul className={styles.userActionsList}>
          {this.renderOpenChatAction()}
          {currentUser.isModerator ? this.renderClearStatusAction() : null}
          {currentUser.isModerator ? this.renderSetPresenterAction() : null}
          {currentUser.isModerator ? this.renderPromoteAction() : null}
          {currentUser.isModerator ? this.renderKickUserAction() : null}
        </ul>
      </div>
    );
  }

  renderOpenChatAction() {
    const {
      user,
    } = this.props;

    // We need to pass this to the function, because we need to use router in the service
    return (
      <li onClick={this.handleOpenChat.bind(this, this, user)}
          className={styles.userActionsItem}>
        <Icon iconName='chat' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Chat
        </span>
      </li>
    );
  }

  renderClearStatusAction() {
    const {
      user,
    } = this.props;

    return (
      <li onClick={this.handleClearStatus.bind(this, user)}
          className={styles.userActionsItem}>
        <Icon iconName='clear-status' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Clear Status
        </span>
      </li>
    );
  }

  renderSetPresenterAction() {
    const {
      user,
    } = this.props;

    return (
      <li onClick={this.handleSetPresenter.bind(this, user)}
          className={styles.userActionsItem}>
        <Icon iconName='presentation' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Make Presenter
        </span>
      </li>
    );
  }

  renderPromoteAction() {
    const {
      user,
    } = this.props;

    return (
      <li onClick={this.handlePromote.bind(this, user)}
          className={styles.userActionsItem}>
        <Icon iconName='promote' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Promote
        </span>
      </li>
    );
  }

  renderKickUserAction() {
    const {
      user,
    } = this.props;

    return (
      <li onClick={this.handleKick.bind(this, user)}
          className={styles.userActionsItem}>
        <Icon iconName='promote' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Kick User
        </span>
      </li>
    );
  }

}

UserActions.propTypes = propTypes;
UserActions.defaultProps = defaultProps;

export default withRouter(UserActions);
