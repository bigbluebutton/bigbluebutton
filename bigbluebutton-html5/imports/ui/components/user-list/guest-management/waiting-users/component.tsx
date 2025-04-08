import React, {
  useCallback,
  useState,
} from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
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
  SET_LOBBY_MESSAGE_PRIVATE,
  SUBMIT_APPROVAL_STATUS,
} from './mutations';

interface WaitingUserSectionProps {
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

const WaitingUserSection: React.FC<WaitingUserSectionProps> = ({
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
  const [submitApprovalStatus] = useMutation(SUBMIT_APPROVAL_STATUS);
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

  return (
    <Styled.Panel isChrome={isChrome}>
      {authedGuestUsers.length > 0 && (
        <>
          <Tooltip
            title={
              waitingAuthedUsersVisible
                ? intl.formatMessage(intlMessages.hideWaitingGuests)
                : intl.formatMessage(intlMessages.showWaitingGuests)
            }
          >
            <Styled.ToggleButton onClick={() => setWaitingAuthedUsersVisible(!waitingAuthedUsersVisible)}>
              <Styled.ButtonContent>
                <Styled.ExpandIcon $expanded={waitingAuthedUsersVisible}>
                  <ExpandMoreIcon />
                </Styled.ExpandIcon>
                <Styled.TitleText>
                  {intl.formatMessage(intlMessages.title)}
                </Styled.TitleText>
                <Avatar sx={{ bgcolor: '#F59240', width: '1.25rem', height: '1.25rem' }}>
                  <Styled.GuestNumberIndicator>
                    {authedGuestUsers.length}
                  </Styled.GuestNumberIndicator>
                </Avatar>
              </Styled.ButtonContent>
            </Styled.ToggleButton>
          </Tooltip>
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
          <Tooltip
            title={
              waitingUnauthedUsersVisible
                ? intl.formatMessage(intlMessages.hideWaitingGuests)
                : intl.formatMessage(intlMessages.showWaitingGuests)
            }
          >
            <Styled.ToggleButton onClick={() => setWaitingUnauthedUsersVisible(!waitingUnauthedUsersVisible)}>
              <Styled.ButtonContent>
                <Styled.ExpandIcon $expanded={waitingUnauthedUsersVisible}>
                  <ExpandMoreIcon />
                </Styled.ExpandIcon>
                <Styled.TitleText>
                  {intl.formatMessage(intlMessages.title)}
                </Styled.TitleText>
                <Avatar sx={{ bgcolor: '#F59240', width: '1.25rem', height: '1.25rem' }}>
                  <Styled.GuestNumberIndicator>
                    {unauthedGuestUsers.length}
                  </Styled.GuestNumberIndicator>
                </Avatar>
              </Styled.ButtonContent>
            </Styled.ToggleButton>
          </Tooltip>
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

const WaitingUserSectionContainer: React.FC = () => {
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
    <WaitingUserSection
      authedGuestUsers={separateGuestUsersByAuthed.authed}
      unauthedGuestUsers={separateGuestUsersByAuthed.unauthed}
      guestLobbyMessage={currentMeeting?.usersPolicies?.guestLobbyMessage ?? null}
      guestLobbyEnabled={(currentMeeting?.usersPolicies?.guestPolicy === 'ASK_MODERATOR')
        || !!(guestWaitingUsersData?.user_guest?.length)}
    />
  );
};

export default WaitingUserSectionContainer;
