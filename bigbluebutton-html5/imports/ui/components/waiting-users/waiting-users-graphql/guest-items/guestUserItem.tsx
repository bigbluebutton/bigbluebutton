import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Styled from '../styles';
import { getNameInitials } from '../service';
import TextInput from '/imports/ui/components/text-input/component';

const intlMessages = defineMessages({
  accept: {
    id: 'app.userList.guest.acceptLabel',
    description: 'Accept guest button label',
  },
  privateMessageLabel: {
    id: 'app.userList.guest.privateMessageLabel',
    description: 'Private message button label',
  },
  deny: {
    id: 'app.userList.guest.denyLabel',
    description: 'Deny guest button label',
  },
  privateInputPlaceholder: {
    id: 'app.userList.guest.privateInputPlaceholder',
    description: 'Private input placeholder',
  },
  emptyMessage: {
    id: 'app.userList.guest.emptyMessage',
    description: 'Empty guest lobby message label',
  },
});

const renderGuestUserItem = (
  name: string,
  color: string,
  handleAccept: ()=>void,
  handleDeny: ()=>void,
  role: string,
  sequence: number,
  userId: string,
  avatar: string,
  privateMessageVisible: ()=>void,
  setPrivateGuestLobbyMessage: (msg: string) => void,
  privateGuestLobbyMessage: string,
  isGuestLobbyMessageEnabled: boolean,
) => {
  const intl = useIntl();
  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;

  return (
    <React.Fragment key={`user-${userId}`}>
      <Styled.ListItem key={`userlist-item-${userId}`} animations={animations}>
        <Styled.UserContentContainer key={`user-content-container-${userId}`} role="listitem">
          <Styled.UserAvatarContainer key={`user-avatar-container-${userId}`}>
            <Styled.Avatar
              key={`user-avatar-${userId}`}
              moderator={role === 'MODERATOR'}
              avatar={avatar}
              color={color}
            >
              {getNameInitials(name)}
            </Styled.Avatar>
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
          {isGuestLobbyMessageEnabled ? (
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
      {isGuestLobbyMessageEnabled ? (
        <Styled.PrivateLobbyMessage
          id={`privateMessage-${userId}`}
          data-test="privateLobbyMessage"
        >
          <TextInput
            maxLength={128}
            placeholder={intl.formatMessage(intlMessages.privateInputPlaceholder,
              { userName: name })}
            send={setPrivateGuestLobbyMessage}
          />
          <p>
            <i>
              &quot;
              {privateGuestLobbyMessage && privateGuestLobbyMessage !== ''
              // eslint-disable-next-line react/no-danger
                ? <span dangerouslySetInnerHTML={{ __html: privateGuestLobbyMessage }} />
                : intl.formatMessage(intlMessages.emptyMessage)}
              &quot;
            </i>
          </p>
        </Styled.PrivateLobbyMessage>
      ) : null}
    </React.Fragment>
  );
};

export default renderGuestUserItem;
