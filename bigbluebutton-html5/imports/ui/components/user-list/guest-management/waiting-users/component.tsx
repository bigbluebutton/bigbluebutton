import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import Avatar from '@mui/material/Avatar';
import { CheckCircle } from '@mui/icons-material';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import {
  GET_GUEST_WAITING_USERS_SUBSCRIPTION,
  GuestWaitingUser,
  GuestWaitingUsers,
} from './queries';
import Styled from './styles';
import browserInfo from '/imports/utils/browserInfo';
import renderPendingUsers from './guest-items/guestPendingUser';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import {
  SET_LOBBY_MESSAGE,
  SET_LOBBY_MESSAGE_PRIVATE,
  SUBMIT_APPROVAL_STATUS,
} from '../../../waiting-users/mutations';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';

interface GuestUsersManagementPanelProps {
  authedGuestUsers: GuestWaitingUser[];
  unauthedGuestUsers: GuestWaitingUser[];
  guestLobbyMessage: string | null;
  guestLobbyEnabled: boolean;
}

type SeparatedUsers = {
  authed: GuestWaitingUser[];
  unauthed: GuestWaitingUser[];
};

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

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
  authedGuestUsers,
  unauthedGuestUsers,
  guestLobbyEnabled,
  guestLobbyMessage,
}) => {
  if (!guestLobbyEnabled) {
    return null;
  }
  const isGuestLobbyMessageEnabled = window.meetingClientSettings.public.app.enableGuestLobbyMessage;
  const intl = useIntl();
  const { isChrome } = browserInfo;
  const [waitingAuthedUsersVisible, setWaitingAuthedUsersVisible] = useState(false);
  const [waitingUnauthedUsersVisible, setWaitingUnauthedUsersVisible] = useState(false);
  const [guestLobbyMessageChecked, setGuestLobbyMessageChecked] = React.useState(false);
  const [message, setMessage] = React.useState(guestLobbyMessage);
  const [submitApprovalStatus] = useMutation(SUBMIT_APPROVAL_STATUS);
  const [setLobbyMessage] = useMutation(SET_LOBBY_MESSAGE);
  const [setLobbyMessagePrivate] = useMutation(SET_LOBBY_MESSAGE_PRIVATE);

  const guestUsersCall = useCallback((users: GuestWaitingUser[], status: string) => {
    const guests = users.map((user) => ({
      guest: user.user.userId,
      status,
    }));

    submitApprovalStatus({
      variables: {
        guests,
      },
    });
  }, []);

  const setGuestLobbyMessage = useCallback((message: string) => {
    setLobbyMessage({
      variables: {
        message,
      },
    });
  }, []);

  const setPrivateGuestLobbyMessage = useCallback((message: string, guestId: string) => {
    setLobbyMessagePrivate({
      variables: {
        guestId,
        message,
      },
    });
  }, []);

  const getPrivateGuestLobbyMessage = useCallback((userId: string) => {
    const user = authedGuestUsers
      .concat(unauthedGuestUsers)
      .find((u: GuestWaitingUser) => u.user.userId === userId);
    if (!user) return '';
    return user.guestLobbyMessage === guestLobbyMessage ? '' : user.guestLobbyMessage;
  }, [authedGuestUsers, unauthedGuestUsers]);

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
      {authedGuestUsers.length > 0 && (
        <>
          <Styled.WaitingUsersHeader>
            <Tooltip title={waitingAuthedUsersVisible
              ? intl.formatMessage(intlMessages.hideWaitingGuests)
              : intl.formatMessage(intlMessages.showWaitingGuests)}
            >
              <IconButton
                size="small"
                sx={{
                  bgcolor: colorPrimary,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: colorPrimary,
                  },
                  width: '1.5rem',
                  height: '1.5rem',
                }}
                onClick={() => setWaitingAuthedUsersVisible(!waitingAuthedUsersVisible)}
              >
                {waitingAuthedUsersVisible ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Styled.MainTitle>{intl.formatMessage(intlMessages.title)}</Styled.MainTitle>
            <Avatar sx={{ bgcolor: '#F59240', width: '1.25rem', height: '1.25rem' }}>
              <Styled.GuestNumberIndicator>
                {authedGuestUsers.length}
              </Styled.GuestNumberIndicator>
            </Avatar>
          </Styled.WaitingUsersHeader>
          {waitingAuthedUsersVisible && (
            renderPendingUsers(
              authedGuestUsers,
              guestUsersCall,
              setPrivateGuestLobbyMessage,
              getPrivateGuestLobbyMessage,
              isGuestLobbyMessageEnabled,
              intl,
            )
          )}
          {waitingAuthedUsersVisible && (
            <Styled.AcceptDenyButtonsContainer>
              <Styled.AcceptAllButton
                onClick={() => guestUsersCall(authedGuestUsers, ALLOW_STATUS)}
                data-test="allowAllGuests"
              >
                <CheckCircle sx={{ width: '1rem', height: '1rem' }} />
                <Styled.AcceptDenyButtonText>
                  {intl.formatMessage(intlMessages.allowAllGuests)}
                </Styled.AcceptDenyButtonText>
              </Styled.AcceptAllButton>
              <Styled.DenyAllButton
                onClick={() => guestUsersCall(authedGuestUsers, DENY_STATUS)}
                data-test="denyEveryone"
              >
                <CancelIcon sx={{ width: '1rem', height: '1rem' }} />
                <Styled.AcceptDenyButtonText>
                  {intl.formatMessage(intlMessages.denyEveryone)}
                </Styled.AcceptDenyButtonText>
              </Styled.DenyAllButton>
            </Styled.AcceptDenyButtonsContainer>
          )}
        </>
      )}
      {unauthedGuestUsers.length > 0 && (
        <>
          <Styled.WaitingUsersHeader>
            <Tooltip title={waitingUnauthedUsersVisible
              ? intl.formatMessage(intlMessages.hideWaitingGuests)
              : intl.formatMessage(intlMessages.showWaitingGuests)}
            >
              <IconButton
                size="small"
                sx={{
                  bgcolor: colorPrimary,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: colorPrimary,
                  },
                  width: '1.5rem',
                  height: '1.5rem',
                }}
                onClick={() => setWaitingUnauthedUsersVisible(!waitingUnauthedUsersVisible)}
              >
                {waitingUnauthedUsersVisible ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Styled.MainTitle>{intl.formatMessage(intlMessages.title)}</Styled.MainTitle>
            <Avatar sx={{ bgcolor: '#F59240', width: '1.25rem', height: '1.25rem' }}>
              <Styled.GuestNumberIndicator>
                {unauthedGuestUsers.length}
              </Styled.GuestNumberIndicator>
            </Avatar>
          </Styled.WaitingUsersHeader>
          {waitingUnauthedUsersVisible && (
            renderPendingUsers(
              unauthedGuestUsers,
              guestUsersCall,
              setPrivateGuestLobbyMessage,
              getPrivateGuestLobbyMessage,
              isGuestLobbyMessageEnabled,
              intl,
            )
          )}
          {waitingUnauthedUsersVisible && (
            <Styled.AcceptDenyButtonsContainer>
              <Styled.AcceptAllButton
                onClick={() => guestUsersCall(unauthedGuestUsers, ALLOW_STATUS)}
                data-test="allowAllGuests"
              >
                <CheckCircle sx={{ width: '1rem', height: '1rem' }} />
                <Styled.AcceptDenyButtonText>
                  {intl.formatMessage(intlMessages.allowAllGuests)}
                </Styled.AcceptDenyButtonText>
              </Styled.AcceptAllButton>
              <Styled.DenyAllButton
                onClick={() => guestUsersCall(unauthedGuestUsers, DENY_STATUS)}
                data-test="denyEveryone"
              >
                <CancelIcon sx={{ width: '1rem', height: '1rem' }} />
                <Styled.AcceptDenyButtonText>
                  {intl.formatMessage(intlMessages.denyEveryone)}
                </Styled.AcceptDenyButtonText>
              </Styled.DenyAllButton>
            </Styled.AcceptDenyButtonsContainer>
          )}
        </>
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

  const separateGuestUsersByAuthed = guestWaitingUsersData
    ?.user_guest
    ?.reduce((acc: SeparatedUsers, user: GuestWaitingUser) => {
      if (user.user.authed) {
        acc.authed.push(user);
      } else {
        acc.unauthed.push(user);
      }
      return acc;
    }, { authed: [], unauthed: [] }) ?? { authed: [], unauthed: [] };

  return (
    <GuestUsersManagementPanel
      authedGuestUsers={separateGuestUsersByAuthed.authed}
      unauthedGuestUsers={separateGuestUsersByAuthed.unauthed}
      guestLobbyMessage={currentMeeting?.usersPolicies?.guestLobbyMessage ?? null}
      guestLobbyEnabled={(currentMeeting?.usersPolicies?.guestPolicy === 'ASK_MODERATOR')
        || !!(guestWaitingUsersData?.user_guest?.length)}
    />
  );
};

export default GuestUsersManagementPanelContainer;
