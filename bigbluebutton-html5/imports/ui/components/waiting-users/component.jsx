import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import TextInput from '/imports/ui/components/text-input/component';
import Styled from './styles';
import { PANELS, ACTIONS } from '../layout/enums';
import Settings from '/imports/ui/services/settings';
import browserInfo from '/imports/utils/browserInfo';
import Header from '/imports/ui/components/common/control-header/component';
import { notify } from '/imports/ui/services/notification';

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
  noPendingUsers: {
    id: 'app.userList.guest.noPendingUsers',
    description: 'Label for no users waiting',
  },
  rememberChoice: {
    id: 'app.userList.guest.rememberChoice',
    description: 'Remember label for checkbox',
  },
  emptyMessage: {
    id: 'app.userList.guest.emptyMessage',
    description: 'Empty guest lobby message label',
  },
  inputPlaceholder: {
    id: 'app.userList.guest.inputPlaceholder',
    description: 'Placeholder to guest lobby message input',
  },
  privateMessageLabel: {
    id: 'app.userList.guest.privateMessageLabel',
    description: 'Private message button label',
  },  
  privateInputPlaceholder: {
    id: 'app.userList.guest.privateInputPlaceholder',
    description: 'Private input placeholder',
  },
  accept: {
    id: 'app.userList.guest.acceptLabel',
    description: 'Accept guest button label',
  },
  deny: {
    id: 'app.userList.guest.denyLabel',
    description: 'Deny guest button label',
  },
  feedbackMessage: {
    id: 'app.userList.guest.feedbackMessage',
    description: 'Feedback message moderator action',
  },
});

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';
const { animations } = Settings.application;

const getNameInitials = (name) => {
  const nameInitials = name.slice(0, 2);

  return nameInitials.replace(/^\w/, (c) => c.toUpperCase());
};

const renderGuestUserItem = (
  name, color, handleAccept, handleDeny, role, sequence, userId, avatar, intl,
  privateMessageVisible, setPrivateGuestLobbyMessage, privateGuestLobbyMessage, isGuestLobbyMessageEnabled,
) => (
  <React.Fragment key={`user-${userId}`}>
  <Styled.ListItem key={`userlist-item-${userId}`} animations={animations}>
    <Styled.UserContentContainer key={`user-content-container-${userId}`}>
      <Styled.UserAvatarContainer key={`user-avatar-container-${userId}`}>
        <UserAvatar
          key={`user-avatar-${userId}`}
          moderator={role === 'MODERATOR'}
          avatar={avatar}
          color={color}
        >
          {getNameInitials(name)}
        </UserAvatar>
      </Styled.UserAvatarContainer>
      <Styled.UserName key={`user-name-${userId}`}>
        {`[${sequence}] ${name}`}
      </Styled.UserName>
    </Styled.UserContentContainer>

    <Styled.ButtonContainer key={`userlist-btns-${userId}`}>
      <Styled.WaitingUsersButton
        key={`userbtn-accept-${userId}`}
        size="md"
        aria-label={intl.formatMessage(intlMessages.accept)}
        ghost
        hideLabel
        icon="add"
        onClick={handleAccept}
        data-test="acceptGuest"
      />
      { isGuestLobbyMessageEnabled ? ( 
      <Styled.WaitingUsersButtonMsg
        key={`userbtn-message-${userId}`}
        size="lg"
        aria-label={intl.formatMessage(intlMessages.privateMessageLabel)}
        ghost
        hideLabel
        onClick={privateMessageVisible}
        data-test="privateMessageGuest" 
      />
    ) : null}
      <Styled.WaitingUsersButtonDeny
        key={`userbtn-deny-${userId}`}
        aria-label={intl.formatMessage(intlMessages.deny)}
        ghost
        hideLabel
        onClick={handleDeny}
        data-test="denyGuest"
        size="sm"
        icon="close"
      />
    </Styled.ButtonContainer>
  </Styled.ListItem>
  { isGuestLobbyMessageEnabled ? (
    <Styled.PrivateLobbyMessage
      id={`privateMessage-${userId}`}
      data-test="privateLobbyMessage">
        <TextInput
          maxLength={128}
          placeholder={intl.formatMessage(intlMessages.privateInputPlaceholder,
                                         { 0: name })}
          send={setPrivateGuestLobbyMessage} />
        <p>
          <i>
            &quot;
            {privateGuestLobbyMessage.length > 0
              ? privateGuestLobbyMessage
              : intl.formatMessage(intlMessages.emptyMessage)}
            &quot;
          </i>
        </p>
    </Styled.PrivateLobbyMessage>
  ) : null}
  </React.Fragment>
);

const renderNoUserWaitingItem = (message) => (
  <Styled.PendingUsers>
    <Styled.NoPendingUsers>
      {message}
    </Styled.NoPendingUsers>
  </Styled.PendingUsers>
);

const renderPendingUsers = (message, usersArray, action, intl,
  privateMessageVisible, setPrivateGuestLobbyMessage, 
  privateGuestLobbyMessage, isGuestLobbyMessageEnabled
) => { 
  if (!usersArray.length) return null;
  return (
    <Styled.PendingUsers>
      <Styled.MainTitle>{message}</Styled.MainTitle>
      <Styled.UsersWrapper>
        <Styled.Users>
          {usersArray.map((user, idx) => renderGuestUserItem(
            user.name,
            user.color,
            () => action([user], ALLOW_STATUS),
            () => action([user], DENY_STATUS),
            user.role,
            idx + 1,
            user.intId,
            user.avatar,
            intl,
            () => privateMessageVisible(`privateMessage-${user.intId}`),
            (message) => setPrivateGuestLobbyMessage(message, user.intId),
            privateGuestLobbyMessage(user.intId),
            isGuestLobbyMessageEnabled,
          ))}
        </Styled.Users>
      </Styled.UsersWrapper>
    </Styled.PendingUsers>
  );
};

const WaitingUsers = (props) => {
  const [rememberChoice, setRememberChoice] = useState(false);

  const {
    intl,
    authenticatedUsers,
    privateMessageVisible,
    guestUsers,
    guestUsersCall,
    changeGuestPolicy,
    isGuestLobbyMessageEnabled,
    setGuestLobbyMessage,
    guestLobbyMessage,
    setPrivateGuestLobbyMessage,
    privateGuestLobbyMessage,
    authenticatedGuest,
    guestPolicyExtraAllowOptions,
    layoutContextDispatch,
    allowRememberChoice,
  } = props;

  const existPendingUsers = authenticatedUsers.length > 0 || guestUsers.length > 0;

  const closePanel = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  };

  useEffect(() => {
    const {
      isWaitingRoomEnabled,
    } = props;
    if (!isWaitingRoomEnabled && !existPendingUsers) {
      closePanel();
    }
  });

  const onCheckBoxChange = (e) => {
    const { checked } = e.target;
    setRememberChoice(checked);
  };

  const changePolicy = (shouldExecutePolicy, policyRule, cb, message) => () => {   
    if (shouldExecutePolicy) {
      changeGuestPolicy(policyRule);
    }

    closePanel();
    
    notify(intl.formatMessage(intlMessages.feedbackMessage) + message.toUpperCase(), 'success');
    
    return cb();
  };

  const renderButton = (message, { key, color, policy, action, dataTest }) => (
    <Styled.CustomButton
      key={key}
      color={color}
      label={message}
      size="lg"
      onClick={changePolicy(rememberChoice, policy, action, message)}
      data-test={dataTest}
    />
  );

  const authGuestButtonsData = [
    {
      messageId: intlMessages.allowAllAuthenticated,
      action: () => guestUsersCall(authenticatedUsers, ALLOW_STATUS),
      key: 'allow-all-auth',
      color: 'primary',
      policy: 'ALWAYS_ACCEPT_AUTH',
    },
    {
      messageId: intlMessages.allowAllGuests,
      action: () => guestUsersCall(
        [...guestUsers].concat(rememberChoice ? authenticatedUsers : []),
        ALLOW_STATUS,
      ),
      key: 'allow-all-guest',
      color: 'primary',
      policy: 'ALWAYS_ACCEPT',
    },
  ];

  const guestButtonsData = [
    {
      messageId: intlMessages.allowEveryone,
      action: () => guestUsersCall([...guestUsers, ...authenticatedUsers], ALLOW_STATUS),
      key: 'allow-everyone',
      color: 'primary',
      policy: 'ALWAYS_ACCEPT',
      dataTest: 'allowEveryone',
    },
    {
      messageId: intlMessages.denyEveryone,
      action: () => guestUsersCall([...guestUsers, ...authenticatedUsers], DENY_STATUS),
      key: 'deny-everyone',
      color: 'danger',
      policy: 'ALWAYS_DENY',
      dataTest: 'denyEveryone',
    },
  ];

  const buttonsData = ( authenticatedGuest && guestPolicyExtraAllowOptions )
    ? _.concat(authGuestButtonsData, guestButtonsData)
    : guestButtonsData;

  const { isChrome } = browserInfo;

  return (
    <Styled.Panel data-test="note" isChrome={isChrome}>
      <Header
        leftButtonProps={{
          onClick: () => closePanel(),
          label: intl.formatMessage(intlMessages.title),
        }}
      />
      <Styled.ScrollableArea>
        {isGuestLobbyMessageEnabled ? (
          <Styled.LobbyMessage data-test="lobbyMessage">
            <TextInput
              maxLength={128}
              placeholder={intl.formatMessage(intlMessages.inputPlaceholder)}
              send={setGuestLobbyMessage}
            />
            <p>
              <i>
                &quot;
                {
                guestLobbyMessage.length > 0
                  ? guestLobbyMessage
                  : intl.formatMessage(intlMessages.emptyMessage)
              }
                &quot;
              </i>
            </p>
          </Styled.LobbyMessage>
        ) : null}
          <Styled.ModeratorActions>
            <Styled.MainTitle>{intl.formatMessage(intlMessages.optionTitle)}</Styled.MainTitle>
            {
            buttonsData.map((buttonData) => renderButton(
              intl.formatMessage(buttonData.messageId),
              buttonData,
            ))
          }
          {allowRememberChoice ? (
            <Styled.RememberContainer>
              <input id="rememberCheckboxId" type="checkbox" onChange={onCheckBoxChange} />
              <label htmlFor="rememberCheckboxId">
                {intl.formatMessage(intlMessages.rememberChoice)}
              </label>
            </Styled.RememberContainer>
          ) : null}
        </Styled.ModeratorActions>
        {renderPendingUsers(
          intl.formatMessage(intlMessages.pendingUsers,
            { 0: authenticatedUsers.length }),
          authenticatedUsers,
          guestUsersCall,
          intl,
          privateMessageVisible,
          setPrivateGuestLobbyMessage,
          privateGuestLobbyMessage,
          isGuestLobbyMessageEnabled,
        )}
        {renderPendingUsers(
          intl.formatMessage(intlMessages.pendingGuestUsers,
            { 0: guestUsers.length }),
          guestUsers,
          guestUsersCall,
          intl,
          privateMessageVisible,
          setPrivateGuestLobbyMessage,
          privateGuestLobbyMessage,
          isGuestLobbyMessageEnabled,
        )}
        {!existPendingUsers && (
          renderNoUserWaitingItem(intl.formatMessage(intlMessages.noPendingUsers))
        )}
      </Styled.ScrollableArea>
    </Styled.Panel>
  );
};

export default injectWbResizeEvent(injectIntl(WaitingUsers));
