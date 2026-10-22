import { useMutation, useReactiveVar } from '@apollo/client';
import React, { useContext, useEffect, useState } from 'react';
import Session from '/imports/ui/services/storage/in-memory';
import {
  GetGuestLobbyInfo,
  getGuestLobbyInfo,
  userJoinMutation,
} from './queries';
import { setAuthData } from '/imports/ui/core/local-states/useAuthData';
import MeetingEndedContainer from '../../meeting-ended/component';
import { setUserDataToSessionStorage } from './service';
import { LoadingContext } from '../../common/loading-screen/loading-screen-HOC/component';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import logger from '/imports/startup/client/logger';
import deviceInfo from '/imports/utils/deviceInfo';
import GuestWaitContainer, { GUEST_STATUSES } from '../guest-wait/component';
import { useGuestDeniedRedirect } from '../guest-wait/hooks/useGuestWaitState';
import PreFlight, { PreFlightError } from '/imports/ui/components/pre-flight/component';
import GuestLobby from '/imports/ui/components/pre-flight/guest-lobby/component';
import {
  GuestDeniedActions,
  GuestDeniedHeader,
} from '/imports/ui/components/pre-flight/error-screen/guest-denied/component';
import {
  ConnectionLostActions,
  ConnectionLostHeader,
} from '/imports/ui/components/pre-flight/error-screen/connection-lost/component';
import SessionInfo from '/imports/ui/components/pre-flight/session-info/component';
import {
  JoiningRoomActions,
  JoiningRoomHeader,
} from '/imports/ui/components/pre-flight/joining-room/component';
import { isPreFlightEnabled } from '/imports/ui/components/pre-flight/service';
import {
  RoomModeActions,
  RoomModePanel,
} from '/imports/ui/components/pre-flight/room-mode/component';
import useRoomModePanelGate from '/imports/ui/components/pre-flight/room-mode/useRoomModePanelGate';
import RoomModeApplyOnJoin from '/imports/ui/components/pre-flight/room-mode/apply-on-join';
import { getRoomMode } from '/imports/ui/components/pre-flight/room-mode/modes';
import { RoomModeChoice } from '/imports/ui/components/pre-flight/room-mode/settings';
import PluginTopLevelManager from '/imports/ui/components/plugin-top-level-manager/component';
import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import useMediaQuery from '/imports/ui/hooks/useMediaQuery';
import { smallOnly, mediumOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const connectionTimeout = 60000;
const MESSAGE_TIMEOUT = 3000;
// Well before connectionTimeout, which throws into the error boundary.
const JOIN_RETRY_TIMEOUT = 20000;

interface PresenceManagerContainerProps {
    children: React.ReactNode;
  }

interface PresenceManagerProps extends PresenceManagerContainerProps {
    authToken: string;
    logoutUrl: string;
    meetingId: string;
    meetingName: string;
    meetingCreatedTime: number;
    userName: string;
    extId: string;
    userId: string;
    joinErrorCode: string;
    joinErrorMessage: string;
    joined: boolean;
    meetingEnded: boolean;
    endedReasonCode: string;
    endedBy: string;
    ejectReasonCode: string;
    bannerColor: string;
    bannerText: string;
    customLogoUrl: string;
    customDarkLogoUrl: string;
    loggedOut: boolean;
    guestStatus: string;
    guestLobbyMessage: string | null;
    positionInWaitingQueue: number | null;
    isBot: boolean;
    isModerator: boolean;
    roomMode: string | undefined;
    guestPolicy: string | undefined;
    record: boolean;
    autoStartRecording: boolean;
}

const PresenceManager: React.FC<PresenceManagerProps> = ({
  authToken,
  children,
  logoutUrl,
  meetingId,
  meetingName,
  meetingCreatedTime,
  userName,
  extId,
  userId,
  joinErrorCode,
  joinErrorMessage,
  joined,
  meetingEnded,
  endedReasonCode,
  endedBy,
  ejectReasonCode,
  bannerColor,
  bannerText,
  customLogoUrl,
  customDarkLogoUrl,
  loggedOut,
  guestLobbyMessage,
  guestStatus,
  positionInWaitingQueue,
  isBot,
  isModerator,
  roomMode,
  guestPolicy,
  record,
  autoStartRecording,
}) => {
  const [allowToRender, setAllowToRender] = React.useState(false);
  const [dispatchUserJoin] = useMutation(userJoinMutation);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const loadingContextInfo = useContext(LoadingContext);
  const [isGuestAllowed, setIsGuestAllowed] = useState(guestStatus === GUEST_STATUSES.ALLOW);
  const PUBLIC_CONFIG = window.meetingClientSettings.public;
  const CLIENT_TITLE = getFromUserSettings('bbb_client_title', PUBLIC_CONFIG.app.clientTitle);
  // The pre-flight gates the join on a user action; bots have nobody to press
  // the button, so they keep the automatic join.
  const preFlightEnabled = isPreFlightEnabled() && !isBot;
  const [joinRequested, setJoinRequested] = useState(!preFlightEnabled);
  const [joinFailed, setJoinFailed] = useState(false);
  const joinRetryRef = React.useRef<ReturnType<typeof setTimeout>>();
  const preFlightCommitRef = React.useRef<(() => boolean) | null>(null);
  // The room mode picked before the join, applied to the room once the user is in.
  const roomModeChoiceRef = React.useRef<RoomModeChoice | null>(null);
  const [applyingRoomMode, setApplyingRoomMode] = useState(false);
  const isConnected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  // A socket that stops carrying messages stays "connected" until the
  // heartbeat watchdog terminates it, about 45 s into the silence.
  const serverIsResponding = useReactiveVar(connectionStatus.getServerIsRespondingVar());
  // Only a drop counts: the socket is still opening when the screen mounts.
  const [hasConnected, setHasConnected] = useState(isConnected);
  if (isConnected && !hasConnected) setHasConnected(true);
  const connectionLost = hasConnected && (!isConnected || !serverIsResponding);

  useEffect(() => {
    const allowed = guestStatus === GUEST_STATUSES.ALLOW;
    if (allowed) {
      // The approval message is only held on screen when nothing else holds
      // the user in place.
      if (preFlightEnabled) {
        setIsGuestAllowed(true);
        return;
      }
      setTimeout(() => {
        setIsGuestAllowed(true);
      }, MESSAGE_TIMEOUT);
    } else {
      setIsGuestAllowed(false);
    }
  }, [guestStatus, preFlightEnabled]);

  useEffect(() => {
    const sessionToken = Auth.sessionToken as string;
    setAuthData({
      meetingId,
      userId,
      authToken,
      logoutUrl,
      sessionToken,
      userName,
      extId,
      meetingName,
    });
    setUserDataToSessionStorage({
      meetingId,
      userId,
      authToken,
      logoutUrl,
      sessionToken,
      userName,
      extId,
      meetingName,
      customLogoUrl,
      customDarkLogoUrl,
    });
  }, []);

  useEffect(() => {
    if (isGuestAllowed && joinRequested) {
      timeoutRef.current = setTimeout(() => {
        loadingContextInfo.setLoading(false);
        throw new Error('Authentication timeout');
      }, connectionTimeout);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [isGuestAllowed, joinRequested]);

  // Hand the join back to the user if it stalls, instead of leaving them on a
  // spinner until connectionTimeout throws.
  useEffect(() => {
    if (!preFlightEnabled || !isGuestAllowed || !joinRequested || joined) return undefined;

    joinRetryRef.current = setTimeout(() => {
      setJoinFailed(true);
      setJoinRequested(false);
    }, JOIN_RETRY_TIMEOUT);

    return () => clearTimeout(joinRetryRef.current);
  }, [preFlightEnabled, isGuestAllowed, joinRequested, joined]);

  useEffect(() => {
    if (bannerColor || bannerText) {
      Session.setItem('bannerText', bannerText);
      Session.setItem('bannerColor', bannerColor);
    }
  }, [bannerColor, bannerText]);

  useEffect(() => {
    if (authToken && !joined && isGuestAllowed && joinRequested) {
      dispatchUserJoin({
        variables: {
          authToken,
          clientType: 'HTML5',
          clientIsMobile: deviceInfo.isMobile,
        },
      });
    }
  }, [joined, authToken, isGuestAllowed, joinRequested]);

  useEffect(() => {
    if (joined) {
      // The stalled join landed after all: the panel stayed editable under
      // its screen, and what it shows now is what the user expects to join
      // with. A device denied meanwhile commits nothing, as on a retry.
      if (joinFailed) preFlightCommitRef.current?.();
      clearTimeout(timeoutRef.current);
      const roomModeChoice = roomModeChoiceRef.current;
      if (roomModeChoice && getRoomMode(roomModeChoice.modeId)) {
        // A join that landed after it stalled shows the panel as joining while
        // the mode is applied, not as delayed.
        setJoinFailed(false);
        setApplyingRoomMode(true);
      } else {
        setAllowToRender(true);
      }
    }
  }, [joined]);

  const finishRoomModeApply = () => {
    roomModeChoiceRef.current = null;
    setApplyingRoomMode(false);
    setAllowToRender(true);
  };

  useEffect(() => {
    if (joinErrorCode) {
      loadingContextInfo.setLoading(false);
    }
  },
  [joinErrorCode, joinErrorMessage]);

  const errorCode = loggedOut ? 'user_logged_out_reason' : joinErrorCode || ejectReasonCode;

  const hasLeftMeeting = meetingEnded || !!joinErrorCode || !!ejectReasonCode || loggedOut;
  const userCurrentlyInMeeting = allowToRender && !hasLeftMeeting;
  const showPreFlight = preFlightEnabled && !userCurrentlyInMeeting && !hasLeftMeeting;
  const roomModePanel = useRoomModePanelGate(
    roomMode,
    guestPolicy,
    record,
    autoStartRecording,
    isModerator,
    isBot,
    showPreFlight,
  );
  // The panel stays up while its choice is applied, though the room shows the
  // mode by then.
  const showRoomModePanel = roomModePanel.show || applyingRoomMode;
  // Joining lasts until the room opens: a stalled join that landed late is no
  // longer requested, but its room mode is still being applied.
  const isJoining = joinRequested || applyingRoomMode;
  const isPhoneWidth = useMediaQuery(smallOnly);
  const isTabletWidth = useMediaQuery(mediumOnly);
  const isGuestDenied = guestStatus === GUEST_STATUSES.DENY;
  const isSettingUp = guestStatus === GUEST_STATUSES.ALLOW || guestStatus === GUEST_STATUSES.WAIT;
  // The panel stays up behind a denial only for the guest who was already
  // using it: a tab that loads into the denial asks for no devices.
  const [setupPanelShown, setSetupPanelShown] = useState(isSettingUp);
  if (isSettingUp && !setupPanelShown) setSetupPanelShown(true);
  const guestDeniedRedirect = useGuestDeniedRedirect(
    logoutUrl,
    showPreFlight && isGuestDenied,
    { countdown: true },
  );

  // The lobby leaves the denial redirect to this component, which shows its
  // countdown.
  let preFlightHeader: React.ReactNode = (
    <GuestLobby
      meetingName={meetingName}
      clientTitle={CLIENT_TITLE}
      guestLobbyMessage={guestLobbyMessage}
      guestStatus={guestStatus}
      logoutUrl={logoutUrl}
      positionInWaitingQueue={positionInWaitingQueue}
      redirectOnDeny={false}
    />
  );
  let preFlightActions: React.ReactNode = null;
  let preFlightPanel: React.ReactNode = null;
  let preFlightError: PreFlightError | null = null;

  const retryConnection = () => {
    // The socket reconnects on its own; a retry while it is down starts over.
    // Offline, a reload only trades the setup for the browser's error page.
    if (connectionLost) {
      if (navigator.onLine) window.location.reload();
      return;
    }
    // The panel stayed editable under the error: commit it again, as the
    // join button does. A device denied meanwhile holds the join instead, and
    // its screen takes over once this one is cleared.
    const committed = preFlightCommitRef.current?.() ?? true;
    setJoinFailed(false);
    if (committed) setJoinRequested(true);
  };

  if (isGuestDenied) {
    // The lobby stays as the header: a phone keeps it behind the dialog.
    preFlightError = {
      header: (
        <GuestDeniedHeader
          secondsLeft={guestDeniedRedirect.secondsLeft}
          meetingName={meetingName}
        />
      ),
      actions: <GuestDeniedActions onLeave={guestDeniedRedirect.redirect} />,
      onClose: guestDeniedRedirect.redirect,
    };
  } else if (connectionLost || joinFailed) {
    preFlightError = {
      header: <ConnectionLostHeader joinStalled={!connectionLost} />,
      actions: <ConnectionLostActions onRetry={retryConnection} />,
      onClose: retryConnection,
    };
  }

  // A tablet has no room for the room mode panel beside the setup: with the
  // panel up, the pre-flight lays out as on a phone. That layout pins the
  // actions to the bottom, so the join notices stay in the header.
  const phoneLayout = isPhoneWidth
    || (isTabletWidth && !isGuestDenied && isGuestAllowed && showRoomModePanel);

  if (!isGuestDenied && isGuestAllowed) {
    preFlightHeader = (
      <JoiningRoomHeader
        meetingName={meetingName}
        clientTitle={CLIENT_TITLE}
        isJoining={isJoining}
        withNotices={!showRoomModePanel || phoneLayout}
      />
    );
    if (showRoomModePanel) {
      preFlightPanel = (
        <RoomModePanel isJoining={isJoining} roomValues={roomModePanel.roomValues} />
      );
      preFlightActions = (
        <RoomModeActions
          isJoining={isJoining}
          onJoin={() => setJoinRequested(true)}
        />
      );
    } else {
      preFlightActions = (
        <JoiningRoomActions
          isJoining={isJoining}
          onJoin={() => setJoinRequested(true)}
        />
      );
    }
  }

  return (
    <>
      <PluginTopLevelManager
        currentUserCurrentlyInMeeting={userCurrentlyInMeeting}
      />
      {userCurrentlyInMeeting ? children : null}
      {
        hasLeftMeeting
          ? (
            <MeetingEndedContainer
              meetingEndedCode={endedReasonCode}
              endedBy={endedBy}
              joinErrorCode={errorCode}
              isBot={isBot}
            />
          )
          : null
      }
      {
        showPreFlight
          ? (
            <PreFlight
              showSetupPanel={isSettingUp || (isGuestDenied && setupPanelShown)}
              header={preFlightHeader}
              topInfo={<SessionInfo meetingName={meetingName} createdTime={meetingCreatedTime} />}
              headerNamesSession={!isGuestDenied && isGuestAllowed}
              actions={preFlightActions}
              error={preFlightError}
              gateJoinOnDevices={isGuestAllowed && !isJoining}
              commitRef={preFlightCommitRef}
              roomModeChoiceRef={roomModeChoiceRef}
              panel={preFlightPanel}
              phoneLayout={phoneLayout}
            />
          )
          : null
      }
      {
        applyingRoomMode && roomModeChoiceRef.current
          ? (
            <RoomModeApplyOnJoin
              choice={roomModeChoiceRef.current}
              roomValues={roomModePanel.roomValues}
              onDone={finishRoomModeApply}
            />
          )
          : null
      }
      {
        !preFlightEnabled && !isGuestAllowed && !hasLeftMeeting
          ? (
            <GuestWaitContainer
              meetingName={meetingName}
              clientTitle={CLIENT_TITLE}
              guestLobbyMessage={guestLobbyMessage}
              guestStatus={guestStatus}
              logoutUrl={logoutUrl}
              positionInWaitingQueue={positionInWaitingQueue}
            />
          )
          : null
      }
    </>
  );
};

const PresenceManagerContainer: React.FC<PresenceManagerContainerProps> = ({ children }) => {
  const {
    data: currentUserData,
    loading: currentUserLoading,
    errors: currentUserErrors,
  } = useCurrentUser((u) => ({
    authToken: u.authToken,
    joinErrorCode: u.joinErrorCode,
    joinErrorMessage: u.joinErrorMessage,
    joined: u.joined,
    ejectReasonCode: u.ejectReasonCode,
    loggedOut: u.loggedOut,
    guestStatus: u.guestStatus,
    meeting: u.meeting,
    name: u.name,
    extId: u.extId,
    userId: u.userId,
    bot: u.bot,
    logoutUrl: u.logoutUrl,
    isModerator: u.isModerator,
  }));

  const { error, data } = useDeduplicatedSubscription<GetGuestLobbyInfo>(getGuestLobbyInfo, {
    skip: !!currentUserLoading || !!currentUserErrors || (!!currentUserData && currentUserData.guestStatus === 'ALLOW'),
  });

  const meetingStaticStore = meetingStaticData.getMeetingData();

  const loadingContextInfo = useContext(LoadingContext);
  if (error) {
    loadingContextInfo.setLoading(false);
    logger.debug(`Error on user authentication: ${error}`);
  }

  if (!currentUserData || !meetingStaticStore) return null;
  const {
    authToken,
    joinErrorCode,
    joinErrorMessage,
    joined,
    ejectReasonCode,
    loggedOut,
    guestStatus,
    meeting,
    userId,
    extId,
    name,
    bot = false,
    logoutUrl,
    isModerator = false,
  } = currentUserData;

  const guestStatusDetails = data?.user_current?.[0]?.guestStatusDetails;

  const {
    meetingId,
    name: meetingName,
    createdTime: meetingCreatedTime,
    bannerColor,
    bannerText,
    customLogoUrl,
    customDarkLogoUrl,
  } = meetingStaticStore;

  return (
    <PresenceManager
      authToken={authToken ?? ''}
      logoutUrl={logoutUrl ?? ''}
      meetingId={meetingId ?? ''}
      meetingName={meetingName ?? ''}
      meetingCreatedTime={meetingCreatedTime ?? 0}
      userName={name ?? ''}
      extId={extId ?? ''}
      userId={userId ?? ''}
      joined={joined ?? false}
      joinErrorCode={joinErrorCode ?? ''}
      joinErrorMessage={joinErrorMessage ?? ''}
      meetingEnded={meeting?.ended ?? false}
      endedReasonCode={meeting?.endedReasonCode ?? ''}
      endedBy={meeting?.endedByUserName ?? ''}
      ejectReasonCode={ejectReasonCode ?? ''}
      bannerColor={bannerColor ?? ''}
      bannerText={bannerText ?? ''}
      loggedOut={loggedOut ?? false}
      customLogoUrl={customLogoUrl ?? ''}
      customDarkLogoUrl={customDarkLogoUrl ?? ''}
      guestLobbyMessage={guestStatusDetails?.guestLobbyMessage ?? null}
      positionInWaitingQueue={guestStatusDetails?.positionInWaitingQueue ?? null}
      guestStatus={guestStatus ?? ''}
      isBot={bot}
      isModerator={isModerator}
      roomMode={meeting?.roomMode}
      guestPolicy={meeting?.usersPolicies?.guestPolicy}
      // Fixed at creation, so read from the meeting's static data rather than
      // polled with the user. False is the server's default.
      record={meetingStaticStore?.recordingPolicies?.record ?? false}
      autoStartRecording={meetingStaticStore?.recordingPolicies?.autoStartRecording ?? false}
    >
      {children}
    </PresenceManager>
  );
};

export default PresenceManagerContainer;
