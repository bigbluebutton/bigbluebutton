import React from 'react';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ForumIcon from '@mui/icons-material/Forum';
import { defineMessages, IntlShape } from 'react-intl';
import Styled from '../styles';
import { getNameInitials } from '../service';
import { colorGrayIcons, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import LobbyMessageInput from '/imports/ui/components/common/lobby-message-input/component';

const intlMessages = defineMessages({
  accept: {
    id: 'app.userList.guest.acceptLabel',
    description: 'Accept guest button label',
  },
  deny: {
    id: 'app.userList.guest.denyLabel',
    description: 'Deny guest button label',
  },
  privateMessageLabel: {
    id: 'app.userList.guest.privateMessageLabel',
    description: 'Private message button label',
  },
  privateInputPlaceholder: {
    id: 'app.userList.guest.privateInputPlaceholder',
    description: 'Private input placeholder',
  },
  emptyMessage: {
    id: 'app.userList.guest.emptyMessage',
    description: 'Empty guest lobby message label',
  },
  sendLabel: {
    id: 'app.textInput.sendLabel',
    description: 'Text input send button label',
  },
});

interface GuestUserItemProps {
  name: string;
  color: string;
  handleAccept: () => void;
  handleDeny: () => void;
  role: string;
  sequence: number;
  userId: string;
  avatar: string;
  setPrivateGuestLobbyMessage: (msg: string) => void;
  privateGuestLobbyMessage: string;
  isGuestLobbyMessageEnabled: boolean;
  intl: IntlShape;
}

const GuestUserItem: React.FC<GuestUserItemProps> = ({
  name,
  color,
  handleAccept,
  handleDeny,
  role,
  sequence,
  userId,
  avatar,
  setPrivateGuestLobbyMessage,
  privateGuestLobbyMessage,
  isGuestLobbyMessageEnabled,
  intl,
}) => {
  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;
  const [showInput, setShowInput] = React.useState(false);

  return (
    <React.Fragment key={`user-${userId}`}>
      <Styled.ListItem key={`userlist-item-${userId}`} animations={animations}>
        <Styled.UserContentContainer key={`user-content-container-${userId}`}>
          <Styled.UserAvatarContainer key={`user-avatar-container-${userId}`}>
            <Styled.Avatar
              key={`user-avatar-${userId}`}
              moderator={role === 'MODERATOR'}
              avatar={avatar}
              color={color}
            >
              {/* @ts-ignore */}
              <span>{getNameInitials(name)}</span>
            </Styled.Avatar>
          </Styled.UserAvatarContainer>
          <Styled.UserName key={`user-name-${userId}`}>
            {`[${sequence}] ${name}`}
          </Styled.UserName>
        </Styled.UserContentContainer>
        {isGuestLobbyMessageEnabled ? (
          <Tooltip title={intl.formatMessage(intlMessages.privateMessageLabel)}>
            <IconButton
              key={`userbtn-message-${userId}`}
              size="small"
              sx={{
                color: showInput ? colorPrimary : colorGrayIcons,
              }}
              onClick={() => { setShowInput(!showInput); }}
              aria-label={intl.formatMessage(intlMessages.privateMessageLabel)}
              data-test="privateMessageGuest"
            >
              <ForumIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
        <Styled.GuestOptionsContainer>
          <Tooltip title={intl.formatMessage(intlMessages.accept)}>
            <IconButton
              key={`userbtn-accept-${userId}`}
              size="small"
              sx={{
                color: colorGrayIcons,
              }}
              onClick={handleAccept}
              aria-label={intl.formatMessage(intlMessages.accept)}
              data-test="acceptGuest"
            >
              <CheckCircle fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={intl.formatMessage(intlMessages.deny)}>
            <IconButton
              key={`userbtn-deny-${userId}`}
              size="small"
              sx={{
                color: colorGrayIcons,
              }}
              onClick={handleDeny}
              aria-label={intl.formatMessage(intlMessages.deny)}
              data-test="denyGuest"
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Styled.GuestOptionsContainer>
      </Styled.ListItem>
      {isGuestLobbyMessageEnabled ? (
        <>
          {privateGuestLobbyMessage !== '' && (
            <Styled.GuestLobbyMessage style={{ paddingLeft: '2.7rem', marginTop: '-0.7rem' }}>
              {privateGuestLobbyMessage}
            </Styled.GuestLobbyMessage>
          )}
          {showInput && (
            <LobbyMessageInput
              placeholder={intl.formatMessage(intlMessages.privateInputPlaceholder, { userName: name })}
              submitLabel={intl.formatMessage(intlMessages.sendLabel)}
              onSend={setPrivateGuestLobbyMessage}
              onSent={() => setShowInput(false)}
              inputDataTest="privateLobbyMessage"
              sendButtonDataTest="sendMessageButton"
            />
          )}
        </>
      ) : null}
    </React.Fragment>
  );
};

export default GuestUserItem;
