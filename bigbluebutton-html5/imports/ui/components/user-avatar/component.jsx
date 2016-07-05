import React, { Component, PropTypes } from 'react';
import Icon from '/imports/ui/components/icon/component';
import styles from './styles.scss';
import cx from 'classnames';
import getColor from './color-generator';

const propTypes = {
  user: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    isPresenter: React.PropTypes.bool.isRequired,
    isVoiceUser: React.PropTypes.bool.isRequired,
    isModerator: React.PropTypes.bool.isRequired,
    image: React.PropTypes.string,
  }).isRequired,
};

const defaultProps = {
};

export default class UserAvatar extends Component {
  render() {
    let user = this.props.user;
    // console.log('batata');

    let avatarClasses = {};
    avatarClasses[styles.moderator] = user.isModerator;
    avatarClasses[styles.presenter] = user.isPresenter;
    // avatarClasses[styles.guest] = user.isVoiceUser;

    let avatarStyles = {
      'background-color': getColor(user.name),
    };

    // console.log(user.emoji.status);

    return (
      <div className={styles.userAvatar} style={avatarStyles}>
        <span>
          {this.renderAvatarContent()}
        </span>
        <span className={cx(styles.userStatus, avatarClasses)}>
        </span>
      </div>
    );
  }

  renderAvatarContent() {
    const {
      user
    } = this.props;

    let content = user.name.slice(0, 2);

    if (user.emoji.status !== "none") {
      content = <Icon iconName={user.emoji.status}/>
    }

    return content;
  }
}

UserAvatar.propTypes = propTypes;
UserAvatar.defaultProps = defaultProps;
