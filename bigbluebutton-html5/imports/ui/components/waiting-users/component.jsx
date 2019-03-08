import React, { useEffect } from 'react';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  waitingUsersTitle: {
    id: 'app.userList.guest.waitingUsersTitle',
    description: 'Title for the notes list',
  },
  title: {
    id: 'app.userList.guest.waitingUsers',
    description: 'Label for the waiting users',
  },
  allowAllAuthenticated: {
    id: 'app.userList.guest.allowAllAuthenticated',
    description: 'Title for the waiting users',
  },
  allowAllGuests: {
    id: 'app.userList.guest.allowAllGuests',
    description: 'Title for the waiting users',
  },
  allowEveryone: {
    id: 'app.userList.guest.allowEveryone',
    description: 'Title for the waiting users',
  },
  denyEveryone: {
    id: 'app.userList.guest.denyEveryone',
    description: 'Title for the waiting users',
  },
  pendingUsers: {
    id: 'app.userList.guest.pendingUsers',
    description: 'Title for the waiting users',
  },
  pendingGuestUsers: {
    id: 'app.userList.guest.pendingGuestUsers',
    description: 'Title for the waiting users',
  },
});

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

const renderButton = (message, action, key) => (
  <Button
    key={`button-${key}`}
    color="primary"
    label={message}
    size="lg"
    onClick={action}
    className={styles.customBtn}
  />
);

const renderGuestUserItem = (name, color, handleAccept, handleDeny, role, sequence) => (
  <div className={styles.listItem}>
    <div className={styles.userContentContainer}>
      <div className={styles.userAvatar}>
        <UserAvatar
          moderator={role === 'MODERATOR'}
          color={color}
        >
          {name.slice(0, 2).toUpperCase()}
        </UserAvatar>
      </div>
      <p className={styles.userName}>[{sequence}] {name}</p>
    </div>

    <div className={styles.buttonContainer}>
      <Button
        className={styles.button}
        color="primary"
        size="lg"
        ghost
        label="Accept"
        onClick={handleAccept}
      />
      |
      <Button
        className={styles.button}
        color="primary"
        size="lg"
        ghost
        label="Deny"
        onClick={handleDeny}
      />
    </div>
  </div>
);

const renderPendingUsers = (message, usersArray, action) => {
  if (!usersArray.length) return null;
  return (
    <div>
      <p className={styles.mainTitle}>{message}</p>
      {usersArray.map((user, idx) => renderGuestUserItem(
        user.name,
        user.color,
        () => action([user], ALLOW_STATUS),
        () => action([user], DENY_STATUS),
        user.role,
        idx + 1,
      ))}
    </div>
  );
};

const WaitingUsers = (props) => {
  useEffect(() => {
    const {
      authenticatedUsers,
      guestUsers,
    } = props;
    if (!authenticatedUsers.length && !guestUsers.length) Session.set('openPanel', 'userlist');
  });

  const {
    intl,
    authenticatedUsers,
    guestUsers,
    guestUsersCall,
  } = props;

  const buttonsData = [
    {
      messageId: intlMessages.allowAllAuthenticated,
      action: () => guestUsersCall(authenticatedUsers, ALLOW_STATUS),
    },
    {
      messageId: intlMessages.allowAllGuests,
      action: () => guestUsersCall(guestUsers, ALLOW_STATUS),
    },
    {
      messageId: intlMessages.allowEveryone,
      action: () => guestUsersCall([...guestUsers, ...authenticatedUsers], ALLOW_STATUS),
    },
    {
      messageId: intlMessages.denyEveryone,
      action: () => guestUsersCall([...guestUsers, ...authenticatedUsers], DENY_STATUS),
    },
  ];

  return (
    <div
      data-test="note"
      className={styles.panel}
    >
      <header className={styles.header}>
        <div
          data-test="noteTitle"
          className={styles.title}
        >
          <Button
            onClick={() => {
              Session.set('openPanel', 'userlist');
            }}
            label={intl.formatMessage(intlMessages.title)}
            icon="left_arrow"
            className={styles.hideBtn}
          />
        </div>
      </header>
      <main>
        <div>
          <p className={styles.mainTitle}>Review Peding Users</p>
          {
            buttonsData.map((buttonData, idx) => renderButton(
              intl.formatMessage(buttonData.messageId),
              buttonData.action,
              idx,
            ))
          }
        </div>
        {renderPendingUsers(
          intl.formatMessage(intlMessages.pendingUsers,
            { 0: authenticatedUsers.length }),
          authenticatedUsers,
          guestUsersCall,
        )}
        {renderPendingUsers(
          intl.formatMessage(intlMessages.pendingGuestUsers,
            { 0: guestUsers.length }),
          guestUsers,
          guestUsersCall,
        )}
      </main>
    </div>
  );
};

export default injectWbResizeEvent(injectIntl(WaitingUsers));
