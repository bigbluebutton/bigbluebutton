import React, {
  useCallback,
  useState,
  useEffect,
  memo,
  useMemo,
} from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from '@mui/icons-material/Cancel';
import Avatar from '@mui/material/Avatar';
import { CheckCircle } from '@mui/icons-material';
import { Checkbox, FormControlLabel } from '@mui/material';
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
  SET_POLICY,
} from './mutations';

interface WaitingUserSectionProps {
  authedGuestUsers: GuestWaitingUser[];
  unauthedGuestUsers: GuestWaitingUser[];
  guestLobbyMessage: string | null;
  guestPolicy: string;
  searchQuery?: string;
}

type SeparatedUsers = {
  authed: GuestWaitingUser[];
  unauthed: GuestWaitingUser[];
};

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';
const ASK_MODERATOR = 'ASK_MODERATOR';
const ALWAYS_ACCEPT = 'ALWAYS_ACCEPT';
const ALWAYS_DENY = 'ALWAYS_DENY';

const intlMessages = defineMessages({
  authenticatedUsersTitle: {
    id: 'app.userList.guest.waitingAuthenticatedUsers',
    description: 'Label for authenticated users waiting for approval',
  },
  guestUsersTitle: {
    id: 'app.userList.guest.waitingGuestUsers',
    description: 'Label for guest users waiting for approval',
  },
  allowAllAuthenticated: {
    id: 'app.userList.guest.allowAllAuthenticated',
    description: 'Label for allowing all authenticated waiting users',
  },
  allowAllGuests: {
    id: 'app.userList.guest.allowAllGuests',
    description: 'Label for allowing all guest waiting users',
  },
  denyAllAuthenticated: {
    id: 'app.userList.guest.denyAllAuthenticated',
    description: 'Label for denying all authenticated waiting users',
  },
  denyAllGuests: {
    id: 'app.userList.guest.denyAllGuests',
    description: 'Label for denying all guest waiting users',
  },
  allowEveryone: {
    id: 'app.userList.guest.allowEveryone',
    description: 'Label for allowing everyone waiting for approval',
  },
  denyEveryone: {
    id: 'app.userList.guest.denyEveryone',
    description: 'Label for denying everyone waiting for approval',
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
  rememberChoice: {
    id: 'app.userList.guest.rememberChoice',
    description: 'Label for the remember choice checkbox',
  },
});

const WaitingUserSection: React.FC<WaitingUserSectionProps> = ({
  authedGuestUsers,
  unauthedGuestUsers,
  guestLobbyMessage,
  guestPolicy,
  searchQuery,
}) => {
  const isGuestLobbyMessageEnabled = window.meetingClientSettings.public.app.enableGuestLobbyMessage;
  const intl = useIntl();
  const { isChrome } = browserInfo;
  const [waitingAuthedUsersVisible, setWaitingAuthedUsersVisible] = useState(false);
  const [waitingUnauthedUsersVisible, setWaitingUnauthedUsersVisible] = useState(false);

  const searchTerms = useMemo(
    () => (searchQuery ? searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean) : []),
    [searchQuery],
  );

  const filteredAuthedUsers = useMemo(
    () => (searchTerms.length > 0
      ? authedGuestUsers.filter((u) => {
        const nameLower = u.user.name?.toLowerCase() ?? '';
        return searchTerms.every((term) => nameLower.includes(term));
      })
      : authedGuestUsers),
    [authedGuestUsers, searchTerms],
  );

  const filteredUnauthedUsers = useMemo(
    () => (searchTerms.length > 0
      ? unauthedGuestUsers.filter((u) => {
        const nameLower = u.user.name?.toLowerCase() ?? '';
        return searchTerms.every((term) => nameLower.includes(term));
      })
      : unauthedGuestUsers),
    [unauthedGuestUsers, searchTerms],
  );

  const [rememberChoice, setRememberChoice] = useState(false);

  const [submitApprovalStatus] = useMutation(SUBMIT_APPROVAL_STATUS);
  const [setLobbyMessagePrivate] = useMutation(SET_LOBBY_MESSAGE_PRIVATE);
  const [setPolicy] = useMutation(SET_POLICY);

  useEffect(() => {
    if (guestPolicy === ASK_MODERATOR) {
      setRememberChoice(false);
    }
  }, [guestPolicy]);

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

    if (rememberChoice) {
      let newPolicy = '';
      if (status === ALLOW_STATUS) newPolicy = ALWAYS_ACCEPT;
      if (status === DENY_STATUS) newPolicy = ALWAYS_DENY;

      if (newPolicy) {
        setPolicy({
          variables: {
            guestPolicy: newPolicy,
          },
        });
      }
    }
  }, [rememberChoice, setPolicy, submitApprovalStatus]);

  const setPrivateGuestLobbyMessage = useCallback((message: string, guestId: string) => {
    setLobbyMessagePrivate({
      variables: {
        guestId,
        message,
      },
    });
  }, [setLobbyMessagePrivate]);

  const getPrivateGuestLobbyMessage = useCallback((userId: string) => {
    const user = authedGuestUsers
      .concat(unauthedGuestUsers)
      .find((u: GuestWaitingUser) => u.user.userId === userId);
    if (!user) return '';
    return user.guestLobbyMessage === guestLobbyMessage ? '' : user.guestLobbyMessage;
  }, [authedGuestUsers, unauthedGuestUsers, guestLobbyMessage]);

  const renderActionButtons = (
    users: GuestWaitingUser[],
    allowLabel: string,
    denyLabel: string,
    allowDataTest: string,
    denyDataTest: string,
  ) => (
    <Styled.AcceptDenyButtonsContainer>
      <Styled.ActionButtonsWrapper>
        <Styled.AcceptAllButton
          onClick={() => guestUsersCall(users, ALLOW_STATUS)}
          data-test={allowDataTest}
          aria-label={allowLabel}
        >
          <CheckCircle sx={{ width: '1rem', height: '1rem' }} />
          <Styled.AcceptDenyButtonText>
            {allowLabel}
          </Styled.AcceptDenyButtonText>
        </Styled.AcceptAllButton>
        <Styled.DenyAllButton
          onClick={() => guestUsersCall(users, DENY_STATUS)}
          data-test={denyDataTest}
          aria-label={denyLabel}
        >
          <CancelIcon sx={{ width: '1rem', height: '1rem' }} />
          <Styled.AcceptDenyButtonText>
            {denyLabel}
          </Styled.AcceptDenyButtonText>
        </Styled.DenyAllButton>
      </Styled.ActionButtonsWrapper>
    </Styled.AcceptDenyButtonsContainer>
  );

  return (
    <Styled.Panel isChrome={isChrome}>
      {(authedGuestUsers.length > 0 || unauthedGuestUsers.length > 0) && (
        <Styled.AcceptDenyButtonsContainer>
          <Styled.RememberChoiceContainer>
            <FormControlLabel
              control={(
                <Checkbox
                  checked={rememberChoice}
                  onChange={(e) => setRememberChoice(e.target.checked)}
                  size="small"
                  data-test="rememberChoice"
                />
              )}
              label={intl.formatMessage(intlMessages.rememberChoice)}
            />
          </Styled.RememberChoiceContainer>
          <Styled.ActionButtonsWrapper>
            <Styled.AcceptAllButton
              onClick={() => guestUsersCall(
                authedGuestUsers.concat(unauthedGuestUsers),
                ALLOW_STATUS,
              )}
              data-test="allowEveryone"
              aria-label={intl.formatMessage(intlMessages.allowEveryone)}
            >
              <CheckCircle sx={{ width: '1rem', height: '1rem' }} />
              <Styled.AcceptDenyButtonText>
                {intl.formatMessage(intlMessages.allowEveryone)}
              </Styled.AcceptDenyButtonText>
            </Styled.AcceptAllButton>
            <Styled.DenyAllButton
              onClick={() => guestUsersCall(
                authedGuestUsers.concat(unauthedGuestUsers),
                DENY_STATUS,
              )}
              data-test="denyEveryone"
              aria-label={intl.formatMessage(intlMessages.denyEveryone)}
            >
              <CancelIcon sx={{ width: '1rem', height: '1rem' }} />
              <Styled.AcceptDenyButtonText>
                {intl.formatMessage(intlMessages.denyEveryone)}
              </Styled.AcceptDenyButtonText>
            </Styled.DenyAllButton>
          </Styled.ActionButtonsWrapper>
        </Styled.AcceptDenyButtonsContainer>
      )}
      {authedGuestUsers.length > 0 && (
        <>
          <Tooltip
            title={
              waitingAuthedUsersVisible
                ? intl.formatMessage(intlMessages.hideWaitingGuests)
                : intl.formatMessage(intlMessages.showWaitingGuests)
            }
          >
            <Styled.ToggleButton
              onClick={() => setWaitingAuthedUsersVisible(!waitingAuthedUsersVisible)}
              data-test="authenticatedWaitingUsers"
            >
              <Styled.ButtonContent>
                <Styled.ExpandIcon $expanded={waitingAuthedUsersVisible}>
                  <ExpandMoreIcon />
                </Styled.ExpandIcon>
                <Styled.TitleText>
                  {intl.formatMessage(intlMessages.authenticatedUsersTitle)}
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
              filteredAuthedUsers,
              guestUsersCall,
              setPrivateGuestLobbyMessage,
              getPrivateGuestLobbyMessage,
              isGuestLobbyMessageEnabled,
              intl,
            )
          )}
          {waitingAuthedUsersVisible && renderActionButtons(
            authedGuestUsers,
            intl.formatMessage(intlMessages.allowAllAuthenticated),
            intl.formatMessage(intlMessages.denyAllAuthenticated),
            'allowAllAuthenticated',
            'denyAllAuthenticated',
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
            <Styled.ToggleButton
              onClick={() => setWaitingUnauthedUsersVisible(!waitingUnauthedUsersVisible)}
              data-test="guestWaitingUsers"
            >
              <Styled.ButtonContent>
                <Styled.ExpandIcon $expanded={waitingUnauthedUsersVisible}>
                  <ExpandMoreIcon />
                </Styled.ExpandIcon>
                <Styled.TitleText>
                  {intl.formatMessage(intlMessages.guestUsersTitle)}
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
              filteredUnauthedUsers,
              guestUsersCall,
              setPrivateGuestLobbyMessage,
              getPrivateGuestLobbyMessage,
              isGuestLobbyMessageEnabled,
              intl,
            )
          )}
          {waitingUnauthedUsersVisible && renderActionButtons(
            unauthedGuestUsers,
            intl.formatMessage(intlMessages.allowAllGuests),
            intl.formatMessage(intlMessages.denyAllGuests),
            'allowAllGuests',
            'denyAllGuests',
          )}
        </>
      )}
    </Styled.Panel>
  );
};

const WaitingUserSectionContainer: React.FC<{ searchQuery?: string }> = ({ searchQuery }) => {
  const {
    data: guestWaitingUsersData,
    loading: guestWaitingUsersLoading,
    error: guestWaitingUsersError,
  } = useDeduplicatedSubscription<GuestWaitingUsers>(GET_GUEST_WAITING_USERS_SUBSCRIPTION);

  const { data: currentMeeting } = useMeeting((meeting) => ({
    usersPolicies: meeting.usersPolicies,
  }));

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
  const guestPolicy = currentMeeting?.usersPolicies?.guestPolicy;
  const guestLobbyEnabled = (guestPolicy === ASK_MODERATOR)
        || !!(guestWaitingUsersData?.user_guest?.length);

  if (!guestLobbyEnabled) {
    return null;
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
      guestPolicy={guestPolicy || ''}
      searchQuery={searchQuery}
    />
  );
};

export default memo(WaitingUserSectionContainer);
