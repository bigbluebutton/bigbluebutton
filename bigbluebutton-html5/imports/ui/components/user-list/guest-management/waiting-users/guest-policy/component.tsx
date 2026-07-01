import React, {
  useCallback,
  useEffect,
} from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import {
  GET_GUEST_WAITING_USERS_SUBSCRIPTION,
  GuestWaitingUsers,
} from '../queries';
import Styled from './styles';
import LobbyMessageInput from '/imports/ui/components/common/lobby-message-input/component';
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
  lobbyMessageSent: {
    id: 'app.lock-viewers.guestPolicy.lobbyMessageSent',
    description: 'Confirmation shown after lobby message is sent',
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
  const [setLobbyMessage] = useMutation(SET_LOBBY_MESSAGE);

  const setGuestLobbyMessage = useCallback((message: string) => {
    setLobbyMessage({
      variables: {
        message,
      },
    });
  }, []);

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
              <LobbyMessageInput
                initialMessage={guestLobbyMessage ?? ''}
                placeholder={intl.formatMessage(intlMessages.inputPlaceholder)}
                submitLabel={intl.formatMessage(intlMessages.sendLabel)}
                successLabel={intl.formatMessage(intlMessages.lobbyMessageSent)}
                onSend={setGuestLobbyMessage}
                inputDataTest="lobbyMessage"
                sendButtonDataTest="sendMessageButton"
              />
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
