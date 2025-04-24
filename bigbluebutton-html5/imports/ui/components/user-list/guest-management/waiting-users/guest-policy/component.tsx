import React, {
  ChangeEvent,
  useCallback,
  useEffect,
} from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import SendIcon from '@mui/icons-material/Send';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import {
  GET_GUEST_WAITING_USERS_SUBSCRIPTION,
  GuestWaitingUsers,
} from '../queries';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import {
  SET_LOBBY_MESSAGE,
} from '../mutations';

interface GuestUsersManagementPanelProps {
  guestLobbyMessage: string | null;
  guestLobbyEnabled: boolean;
}

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.guest.waitingUsers',
    description: 'Label for the waiting users',
  },
  allowAllGuests: {
    id: 'app.userList.guest.allowAllGuests',
    description: 'Title for the waiting users',
  },
  denyEveryone: {
    id: 'app.userList.guest.denyEveryone',
    description: 'Title for the waiting users',
  },
  showWaitingGuests: {
    id: 'app.userList.guest.showWaitingUsersLabel',
    description: 'Title for the waiting users',
  },
  hideWaitingGuests: {
    id: 'app.userList.guest.hideWaitingUsersLabel',
    description: 'Title for the waiting users',
  },
  inputPlaceholder: {
    id: 'app.userList.guest.inputPlaceholder',
    description: 'Placeholder to guest lobby message input',
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

const GuestUsersManagementPanel: React.FC<GuestUsersManagementPanelProps> = ({
  guestLobbyEnabled,
  guestLobbyMessage,
}) => {
  if (!guestLobbyEnabled) {
    return null;
  }
  const isGuestLobbyMessageEnabled = window.meetingClientSettings.public.app.enableGuestLobbyMessage;
  const intl = useIntl();
  const { isChrome } = browserInfo;
  const [guestLobbyMessageChecked, setGuestLobbyMessageChecked] = React.useState(false);
  const [message, setMessage] = React.useState(guestLobbyMessage);
  const [setLobbyMessage] = useMutation(SET_LOBBY_MESSAGE);

  const setGuestLobbyMessage = useCallback((message: string) => {
    setLobbyMessage({
      variables: {
        message,
      },
    });
  }, []);

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      setGuestLobbyMessage(message as string);
      setMessage('');
    }
  };

  useEffect(() => {
    setGuestLobbyMessageChecked(!!guestLobbyMessage);
  }, [guestLobbyMessage]);

  return (
    <Styled.Panel isChrome={isChrome}>
      {isGuestLobbyMessageEnabled && (
        <Styled.GuestLobbyMessageContainer>
          <Styled.SwitchTitle
            sx={{
              margin: 0,
            }}
            control={(
              <Styled.MessageSwitch
                checked={guestLobbyMessageChecked}
                onChange={(_, checked) => {
                  setGuestLobbyMessageChecked(checked);
                  if (!checked) {
                    setGuestLobbyMessage('');
                    setMessage('');
                  }
                }}
                sx={{
                  marginRight: '1rem',
                }}
              />
            )}
            label={intl.formatMessage(intlMessages.inputPlaceholder)}
          />
          {guestLobbyMessageChecked ? (
            <>
              {guestLobbyMessage && (
                <Styled.GuestLobbyMessage>
                  {guestLobbyMessage}
                </Styled.GuestLobbyMessage>
              )}
              <Styled.InputWrapper>
                <Styled.Input
                  id="guest-lobby-message-input"
                  data-test="lobbyMessage"
                  maxLength={128}
                  placeholder={intl.formatMessage(intlMessages.inputPlaceholder)}
                  aria-label={intl.formatMessage(intlMessages.inputPlaceholder)}
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck="true"
                  value={message ?? ''}
                  onChange={handleMessageChange}
                  onKeyDown={handleMessageKeyDown}
                  onPaste={(e) => { e.stopPropagation(); }}
                  onCut={(e) => { e.stopPropagation(); }}
                  onCopy={(e) => { e.stopPropagation(); }}
                  async
                />
                <div style={{ zIndex: 10 }}>
                  <Tooltip title={intl.formatMessage(intlMessages.sendLabel)}>
                    <Styled.SendButton
                      sx={{
                        alignSelf: 'center',
                        fontSize: '0.9rem',
                        height: '100%',
                        borderRadius: '0 0.75rem 0.75rem 0',
                        minWidth: 'auto',
                        padding: '8px',
                      }}
                      variant="contained"
                      // disabled={disabled || partnerIsLoggedOut || chatSendMessageLoading}
                      // type="submit"
                      data-test="sendMessageButton"
                      onClick={() => { setGuestLobbyMessage(message as string); }}
                    >
                      <SendIcon />
                    </Styled.SendButton>
                  </Tooltip>
                </div>
              </Styled.InputWrapper>
            </>
          ) : (
            <Styled.NoMessageText>
              {intl.formatMessage(intlMessages.emptyMessage)}
            </Styled.NoMessageText>
          )}
        </Styled.GuestLobbyMessageContainer>
      )}
    </Styled.Panel>
  );
};

const GuestUsersManagementPanelContainer: React.FC = () => {
  const {
    data: guestWaitingUsersData,
    loading: guestWaitingUsersLoading,
    error: guestWaitingUsersError,
  } = useDeduplicatedSubscription<GuestWaitingUsers>(GET_GUEST_WAITING_USERS_SUBSCRIPTION);

  const { data: currentMeeting } = useMeeting((meeting) => {
    const a = {
      usersPolicies: meeting.usersPolicies,
    };

    return a;
  });

  if (guestWaitingUsersLoading || !currentMeeting) {
    return null;
  }

  if (guestWaitingUsersError) {
    if (guestWaitingUsersError) logger.error('guestWaitingUsersError', guestWaitingUsersError);
    return (
      <div>
        {guestWaitingUsersError && <p>{JSON.stringify(guestWaitingUsersError)}</p>}
      </div>
    );
  }

  return (
    <GuestUsersManagementPanel
      guestLobbyMessage={currentMeeting?.usersPolicies?.guestLobbyMessage ?? null}
      guestLobbyEnabled={(currentMeeting?.usersPolicies?.guestPolicy === 'ASK_MODERATOR')
        || !!(guestWaitingUsersData?.user_guest?.length)}
    />
  );
};

export default GuestUsersManagementPanelContainer;
