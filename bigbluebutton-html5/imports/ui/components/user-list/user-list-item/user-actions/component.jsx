import React, { Component } from 'react';
import { withRouter } from 'react-router';
import Icon from '../../../icon/component';
import styles from './styles.scss';

const propTypes = {
  user: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
  }).isRequired,

  currentUser: React.PropTypes.shape({
    isModerator: React.PropTypes.bool.isRequired,
  }).isRequired,
};

class UserActions extends Component {
  constructor(props) {
    super(props);

    this.handleKickUser = this.props.userActions.kickUser.bind(this);
    this.handleSetUserPresenter = this.props.userActions.setPresenter.bind(this);
    this.handleOpenChat = this.props.userActions.openChat.bind(this);

    // this.handleOpenChatClick = this.props.handleOpenChatClick.bind(this);
  }

  render() {
    let user = this.props.user;
    let currentUser = this.props.currentUser;

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
    let user = this.props.user;
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
    let user = this.props.user;
    return (
      <li className={styles.userActionsItem}>
        <Icon iconName='clear-status' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Clear Status
        </span>
      </li>
    );
  }

  renderSetPresenterAction() {
    let user = this.props.user;
    return (
      <li onClick={this.handleSetUserPresenter.bind(this, user)}
          className={styles.userActionsItem}>
        <Icon iconName='presentation' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Make Presenter
        </span>
      </li>
    );
  }

  renderPromoteAction() {
    let user = this.props.user;
    return (
      <li className={styles.userActionsItem}>
        <Icon iconName='promote' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Promote
        </span>
      </li>
    );
  }

  renderKickUserAction() {
    let user = this.props.user;
    return (
      <li onClick={this.handleKickUser.bind(this, user)}
          className={styles.userActionsItem}>
        <Icon iconName='promote' className={styles.actionIcon}/>
        <span className={styles.actionText}>
          Kick User
        </span>
      </li>
    );
  }

}

export default withRouter(UserActions);
