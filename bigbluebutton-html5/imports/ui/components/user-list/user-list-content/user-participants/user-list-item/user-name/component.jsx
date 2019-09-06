import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
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
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  menuTitleContext: {
    id: 'app.userList.menuTitleContext',
    description: 'adds context to userListItem menu title',
  },
  userAriaLabel: {
    id: 'app.userList.userAriaLabel',
    description: 'aria label for each user in the userlist',
  },
});

const propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  compact: PropTypes.bool.isRequired,
  isModerator: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isThisMeetingLocked: PropTypes.bool.isRequired,
  isMe: PropTypes.func.isRequired,
  userAriaLabel: PropTypes.string.isRequired,
  isActionsOpen: PropTypes.bool.isRequired,
};

const UserName = (props) => {
  const {
    intl,
    compact,
    isThisMeetingLocked,
    userAriaLabel,
    isActionsOpen,
    isModerator,
    isMe,
    user,
  } = props;

  if (compact) {
    return null;
  }

  const userNameSub = [];

  if (compact) {
    return null;
  }

  if (isThisMeetingLocked && user.locked && !isModerator(user.userId)) {
    userNameSub.push(
      <span>
        <Icon iconName="lock" />
        {intl.formatMessage(messages.locked)}
      </span>,
    );
  }

  if (user.guest) {
    userNameSub.push(intl.formatMessage(messages.guest));
  }

  return (
    <div
      className={styles.userName}
      role="button"
      aria-label={userAriaLabel}
      aria-expanded={isActionsOpen}
    >
      <span className={styles.userNameMain}>
        {user.name}
        {' '}
        <i>{(isMe(user.userId)) ? `(${intl.formatMessage(messages.you)})` : ''}</i>
      </span>
      {
        userNameSub.length
          ? (
            <span className={styles.userNameSub}>
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
