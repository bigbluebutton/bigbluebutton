import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import _ from 'lodash';
import { styles } from './styles';

const messages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Text for identifying presenter user',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  moderator: {
    id: 'app.userList.moderator',
    description: 'Text for identifying moderator user',
  },
  mobile: {
    id: 'app.userList.mobile',
    description: 'Text for identifying mobile user',
  },
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  menuTitleContext: {
    id: 'app.userList.menuTitleContext',
    description: 'adds context to userListItem menu title',
  },
  sharingWebcam: {
    id: 'app.userList.sharingWebcam',
    description: 'Text for identifying who is sharing webcam',
  },
  userAriaLabel: {
    id: 'app.userList.userAriaLabel',
    description: 'aria label for each user in the userlist',
  },
});

const propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    pin: PropTypes.bool.isRequired,
  }).isRequired,
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isThisMeetingLocked: PropTypes.bool.isRequired,
  isMe: PropTypes.func.isRequired,
  userAriaLabel: PropTypes.string.isRequired,
  isActionsOpen: PropTypes.bool.isRequired,
};

const LABEL = Meteor.settings.public.user.label;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const UserName = (props) => {
  const {
    intl,
    compact,
    isThisMeetingLocked,
    userAriaLabel,
    isActionsOpen,
    isMe,
    user,
  } = props;

  if (compact) {
    return null;
  }

  const userNameSub = [];

  if (user.isSharingWebcam && LABEL.sharingWebcam) {
    userNameSub.push(
      <span key={_.uniqueId('video-')}>
        { user.pin === true
          ? <Icon iconName="pin-video_on" />
          : <Icon iconName="video" /> }
        &nbsp;
        {intl.formatMessage(messages.sharingWebcam)}
      </span>,
    );
  }

  if (isThisMeetingLocked && user.locked && user.role !== ROLE_MODERATOR) {
    userNameSub.push(
      <span key={_.uniqueId('lock-')}>
        <Icon iconName="lock" />
        &nbsp;
        {intl.formatMessage(messages.locked)}
      </span>,
    );
  }

  if (user.role === ROLE_MODERATOR) {
    if (LABEL.moderator) userNameSub.push(intl.formatMessage(messages.moderator));
  }

  if (user.mobile) {
    if (LABEL.mobile) userNameSub.push(intl.formatMessage(messages.mobile));
  }

  if (user.guest) {
    if (LABEL.guest) userNameSub.push(intl.formatMessage(messages.guest));
  }

  return (
    <div
      className={styles.userName}
      role="button"
      aria-label={userAriaLabel}
      aria-expanded={isActionsOpen}
    >
      <span aria-hidden className={styles.userNameMain}>
        <span>
          {user.name}
          &nbsp;
        </span>
        <i>{(isMe(user.userId)) ? `(${intl.formatMessage(messages.you)})` : ''}</i>
      </span>
      {
        userNameSub.length
          ? (
            <span
              aria-hidden
              className={styles.userNameSub}
              data-test={user.mobile ? 'mobileUser' : undefined}
            >
              {userNameSub.reduce((prev, curr) => [prev, ' | ', curr])}
            </span>
          )
          : null
      }
    </div>
  );
};

UserName.propTypes = propTypes;
export default UserName;
