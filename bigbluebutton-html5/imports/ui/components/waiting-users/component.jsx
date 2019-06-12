import React, { useEffect, useState } from 'react';
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
  optionTitle: {
    id: 'app.userList.guest.optionTitle',
    description: 'Label above the options',
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
  rememberChoice: {
    id: 'app.userList.guest.rememberChoice',
    description: 'Remember label for checkbox',
  },
});

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

const renderGuestUserItem = (name, color, handleAccept, handleDeny, role, sequence, userId) => (
  <div key={`userlist-item-${userId}`} className={styles.listItem}>
    <div key={`user-content-container-${userId}`} className={styles.userContentContainer}>
      <div key={`user-avatar-container-${userId}`} className={styles.userAvatar}>
        <UserAvatar
          key={`user-avatar-${userId}`}
          moderator={role === 'MODERATOR'}
          color={color}
        >
          {name.slice(0, 2).toUpperCase()}
        </UserAvatar>
      </div>
      <p key={`user-name-${userId}`} className={styles.userName}>
[
        {sequence}
]
        {name}
      </p>
    </div>

    <div key={`userlist-btns-${userId}`} className={styles.buttonContainer}>
      <Button
        key={`userbtn-accept-${userId}`}
        className={styles.button}
        color="primary"
        size="lg"
        ghost
        label="Accept"
        onClick={handleAccept}
      />
      |
      <Button
        key={`userbtn-deny-${userId}`}
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
        user.intId,
      ))}
    </div>
  );
};

const WaitingUsers = (props) => {
  const [rememberChoice, setRememberChoice] = useState(false);

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
    changeGuestPolicy,
  } = props;

  const onCheckBoxChange = (e) => {
    const { checked } = e.target;
    setRememberChoice(checked);
  };

  const changePolicy = (shouldExecutePolicy, policyRule, cb) => () => {
    if (shouldExecutePolicy) {
      changeGuestPolicy(policyRule);
    }
    return cb();
  };

  const renderButton = (message, { key, policy, action }) => (
    <Button
      key={key}
      color="primary"
      label={message}
      size="lg"
      onClick={changePolicy(rememberChoice, policy, action)}
      className={styles.customBtn}
    />
  );

  const buttonsData = [
    {
      messageId: intlMessages.allowAllAuthenticated,
      action: () => guestUsersCall(authenticatedUsers, ALLOW_STATUS),
      key: 'allow-all-auth',
      policy: 'ALWAYS_ACCEPT_AUTH',
    },
    {
      messageId: intlMessages.allowAllGuests,
      action: () => guestUsersCall(
        [...guestUsers].concat(rememberChoice ? authenticatedUsers : []),
        ALLOW_STATUS,
      ),
      key: 'allow-all-guest',
      policy: 'ALWAYS_ACCEPT',
    },
    {
      messageId: intlMessages.allowEveryone,
      action: () => guestUsersCall([...guestUsers, ...authenticatedUsers], ALLOW_STATUS),
      key: 'allow-everyone',
      policy: 'ALWAYS_ACCEPT',
    },
    {
      messageId: intlMessages.denyEveryone,
      action: () => guestUsersCall([...guestUsers, ...authenticatedUsers], DENY_STATUS),
      key: 'deny-everyone',
      policy: 'ALWAYS_DENY',
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
          <p className={styles.mainTitle}>{intl.formatMessage(intlMessages.optionTitle)}</p>
          {
            buttonsData.map(buttonData => renderButton(
              intl.formatMessage(buttonData.messageId),
              buttonData,
            ))
          }
        </div>
        <div className={styles.rememberContainer}>
          <input id="rememderCheckboxId" type="checkbox" onChange={onCheckBoxChange} />
          <label htmlFor="rememderCheckboxId">
            {intl.formatMessage(intlMessages.rememberChoice)}
          </label>
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
