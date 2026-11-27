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
  guestUsers: GuestWaitingUser[];
  authedGuestUsers: GuestWaitingUser[];
  unauthedGuestUsers: GuestWaitingUser[];
  guestLobbyMessage: string | null;
  guestPolicy: string;
  searchQuery?: string;
}

interface QueueProps {
  users: GuestWaitingUser[];
  filteredUsers: GuestWaitingUser[];
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  dataTest: string;
  renderActions?: () => React.ReactNode;
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
  waitingUsersTitle: {
    id: 'app.userList.guest.waitingUsers',
    description: 'Label for the single list of users waiting for approval',
  },
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
  guestUsers,
  authedGuestUsers,
  unauthedGuestUsers,
  guestLobbyMessage,
  guestPolicy,
  searchQuery,
}) => {
  const {
    enableGuestLobbyMessage: isGuestLobbyMessageEnabled,
    combineGuestWaitingQueues,
  } = window.meetingClientSettings.public.app;
  const intl = useIntl();
  const { isChrome } = browserInfo;
  const [waitingUsersVisible, setWaitingUsersVisible] = useState(false);
  const [waitingAuthedUsersVisible, setWaitingAuthedUsersVisible] = useState(false);
  const [waitingUnauthedUsersVisible, setWaitingUnauthedUsersVisible] = useState(false);

  const searchTerms = useMemo(
    () => (searchQuery ? searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean) : []),
    [searchQuery],
  );

  const matchesSearch = useCallback((u: GuestWaitingUser) => {
    const nameLower = u.user.name?.toLowerCase() ?? '';
    return searchTerms.every((term) => nameLower.includes(term));
  }, [searchTerms]);

  const filteredGuestUsers = useMemo(
    () => guestUsers.filter(matchesSearch),
    [guestUsers, matchesSearch],
  );

  const filteredAuthedUsers = useMemo(
    () => authedGuestUsers.filter(matchesSearch),
    [authedGuestUsers, matchesSearch],
  );

  const filteredUnauthedUsers = useMemo(
    () => unauthedGuestUsers.filter(matchesSearch),
    [unauthedGuestUsers, matchesSearch],
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
        >
          <CheckCircle sx={{ width: '1rem', height: '1rem' }} />
          <Styled.AcceptDenyButtonText>
            {allowLabel}
          </Styled.AcceptDenyButtonText>
        </Styled.AcceptAllButton>
        <Styled.DenyAllButton
          onClick={() => guestUsersCall(users, DENY_STATUS)}
          data-test={denyDataTest}
        >
          <CancelIcon sx={{ width: '1rem', height: '1rem' }} />
          <Styled.AcceptDenyButtonText>
            {denyLabel}
          </Styled.AcceptDenyButtonText>
        </Styled.DenyAllButton>
      </Styled.ActionButtonsWrapper>
    </Styled.AcceptDenyButtonsContainer>
  );

  // A collapsible queue: its total, its rows (narrowed by the search, numbered by their place
  // in the queue) and, when given, its own allow/deny all buttons.
  const renderQueue = ({
    users, filteredUsers, visible, setVisible, title, dataTest, renderActions,
  }: QueueProps) => (
    <>
      <Tooltip
        title={
          visible
            ? intl.formatMessage(intlMessages.hideWaitingGuests)
            : intl.formatMessage(intlMessages.showWaitingGuests)
        }
      >
        <Styled.ToggleButton
          onClick={() => setVisible(!visible)}
          aria-expanded={visible}
          data-test={dataTest}
        >
          <Styled.ButtonContent>
            <Styled.ExpandIcon $expanded={visible}>
              <ExpandMoreIcon />
            </Styled.ExpandIcon>
            <Styled.TitleText>
              {title}
            </Styled.TitleText>
            <Avatar sx={{ bgcolor: '#F59240', width: '1.25rem', height: '1.25rem' }}>
              <Styled.GuestNumberIndicator>
                {users.length}
              </Styled.GuestNumberIndicator>
            </Avatar>
          </Styled.ButtonContent>
        </Styled.ToggleButton>
      </Tooltip>
      {visible && (
        renderPendingUsers(
          filteredUsers,
          guestUsersCall,
          setPrivateGuestLobbyMessage,
          getPrivateGuestLobbyMessage,
          isGuestLobbyMessageEnabled,
          intl,
          (user) => users.indexOf(user) + 1,
        )
      )}
      {visible && renderActions?.()}
    </>
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
          {(combineGuestWaitingQueues || (authedGuestUsers.length > 0 && unauthedGuestUsers.length > 0)) && (
            <Styled.ActionButtonsWrapper>
              <Styled.AcceptAllButton
                onClick={() => guestUsersCall(guestUsers, ALLOW_STATUS)}
                data-test="allowEveryone"
              >
                <CheckCircle sx={{ width: '1rem', height: '1rem' }} />
                <Styled.AcceptDenyButtonText>
                  {intl.formatMessage(intlMessages.allowEveryone, {
                    count: guestUsers.length,
                  })}
                </Styled.AcceptDenyButtonText>
              </Styled.AcceptAllButton>
              <Styled.DenyAllButton
                onClick={() => guestUsersCall(guestUsers, DENY_STATUS)}
                data-test="denyEveryone"
              >
                <CancelIcon sx={{ width: '1rem', height: '1rem' }} />
                <Styled.AcceptDenyButtonText>
                  {intl.formatMessage(intlMessages.denyEveryone, {
                    count: guestUsers.length,
                  })}
                </Styled.AcceptDenyButtonText>
              </Styled.DenyAllButton>
            </Styled.ActionButtonsWrapper>
          )}
        </Styled.AcceptDenyButtonsContainer>
      )}
      {combineGuestWaitingQueues && guestUsers.length > 0 && renderQueue({
        users: guestUsers,
        filteredUsers: filteredGuestUsers,
        visible: waitingUsersVisible,
        setVisible: setWaitingUsersVisible,
        title: intl.formatMessage(intlMessages.waitingUsersTitle),
        dataTest: 'waitingUsers',
      })}
      {!combineGuestWaitingQueues && authedGuestUsers.length > 0 && renderQueue({
        users: authedGuestUsers,
        filteredUsers: filteredAuthedUsers,
        visible: waitingAuthedUsersVisible,
        setVisible: setWaitingAuthedUsersVisible,
        title: intl.formatMessage(intlMessages.authenticatedUsersTitle),
        dataTest: 'authenticatedWaitingUsers',
        renderActions: () => renderActionButtons(
          authedGuestUsers,
          intl.formatMessage(intlMessages.allowAllAuthenticated, { count: authedGuestUsers.length }),
          intl.formatMessage(intlMessages.denyAllAuthenticated, { count: authedGuestUsers.length }),
          'allowAllAuthenticated',
          'denyAllAuthenticated',
        ),
      })}
      {!combineGuestWaitingQueues && unauthedGuestUsers.length > 0 && renderQueue({
        users: unauthedGuestUsers,
        filteredUsers: filteredUnauthedUsers,
        visible: waitingUnauthedUsersVisible,
        setVisible: setWaitingUnauthedUsersVisible,
        title: intl.formatMessage(intlMessages.guestUsersTitle),
        dataTest: 'guestWaitingUsers',
        renderActions: () => renderActionButtons(
          unauthedGuestUsers,
          intl.formatMessage(intlMessages.allowAllGuests, { count: unauthedGuestUsers.length }),
          intl.formatMessage(intlMessages.denyAllGuests, { count: unauthedGuestUsers.length }),
          'allowAllGuests',
          'denyAllGuests',
        ),
      })}
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
      guestUsers={guestWaitingUsersData?.user_guest ?? []}
      authedGuestUsers={separateGuestUsersByAuthed.authed}
      unauthedGuestUsers={separateGuestUsersByAuthed.unauthed}
      guestLobbyMessage={currentMeeting?.usersPolicies?.guestLobbyMessage ?? null}
      guestPolicy={guestPolicy || ''}
      searchQuery={searchQuery}
    />
  );
};

export default memo(WaitingUserSectionContainer);
