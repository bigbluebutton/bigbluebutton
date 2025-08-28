import { useMutation, useQuery } from '@apollo/client';
import React, { useContext, useEffect, useState } from 'react';
import Bowser from 'bowser';
import { isBrowserSupported } from 'livekit-client';
import Session from '/imports/ui/services/storage/in-memory';
import {
  GetGuestLobbyInfo,
  getGuestLobbyInfo,
  getUserInfo,
  GetUserInfoResponse,
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
import Legacy from '/imports/ui/components/legacy/component';
import PluginTopLevelManager from '/imports/ui/components/plugin-top-level-manager/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const connectionTimeout = 60000;
const MESSAGE_TIMEOUT = 3000;

interface PresenceManagerContainerProps {
    children: React.ReactNode;
  }

interface PresenceManagerProps extends PresenceManagerContainerProps {
    authToken: string;
    logoutUrl: string;
    meetingId: string;
    meetingName: string;
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
    isSupportedBrowser: boolean | undefined;
    hasWebrtcSupport: boolean;
}

const PresenceManager: React.FC<PresenceManagerProps> = ({
  authToken,
  children,
  logoutUrl,
  meetingId,
  meetingName,
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
  isSupportedBrowser,
  hasWebrtcSupport,
}) => {
  const [allowToRender, setAllowToRender] = React.useState(false);
  const [dispatchUserJoin] = useMutation(userJoinMutation);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const loadingContextInfo = useContext(LoadingContext);
  const [isGuestAllowed, setIsGuestAllowed] = useState(guestStatus === GUEST_STATUSES.ALLOW);

  useEffect(() => {
    const allowed = guestStatus === GUEST_STATUSES.ALLOW;
    if (allowed) {
      setTimeout(() => {
        setIsGuestAllowed(true);
      }, MESSAGE_TIMEOUT);
    } else {
      setIsGuestAllowed(false);
    }
  }, [guestStatus]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken') as string;
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
    if (isGuestAllowed) {
      timeoutRef.current = setTimeout(() => {
        loadingContextInfo.setLoading(false);
        throw new Error('Authentication timeout');
      }, connectionTimeout);
    }
  }, [isGuestAllowed]);

  useEffect(() => {
    if (bannerColor || bannerText) {
      Session.setItem('bannerText', bannerText);
      Session.setItem('bannerColor', bannerColor);
    }
  }, [bannerColor, bannerText]);

  useEffect(() => {
    if (authToken && !joined && isGuestAllowed) {
      dispatchUserJoin({
        variables: {
          authToken,
          clientType: 'HTML5',
          clientIsMobile: deviceInfo.isMobile,
        },
      });
    }
  }, [joined, authToken, isGuestAllowed]);

  useEffect(() => {
    if (joined) {
      clearTimeout(timeoutRef.current);
      setAllowToRender(true);
    }
  }, [joined]);

  useEffect(() => {
    if (joinErrorCode) {
      loadingContextInfo.setLoading(false);
    }
  },
  [joinErrorCode, joinErrorMessage]);

  const errorCode = loggedOut ? 'user_logged_out_reason' : joinErrorCode || ejectReasonCode;

  if (isSupportedBrowser === false || hasWebrtcSupport === false) {
    const reason = isSupportedBrowser === false ? 'USER_AGENT' : 'WEBRTC';
    const message = isSupportedBrowser === false
      ? 'The browser is not supported or is using an outdated version.'
      : 'WebRTC is not supported in this browser.';
    logger.warn({
      logCode: 'unsupported_browser',
      extraInfo: {
        reason,
      },
    }, message);

    return <Legacy setLoading={loadingContextInfo.setLoading} />;
  }

  const userCurrentlyInMeeting = allowToRender && !(meetingEnded || joinErrorCode || ejectReasonCode || loggedOut);

  return (
    <>
      <PluginTopLevelManager
        currentUserCurrentlyInMeeting={userCurrentlyInMeeting}
      />
      {userCurrentlyInMeeting ? children : null}
      {
        meetingEnded || joinErrorCode || ejectReasonCode || loggedOut
          ? (
            <MeetingEndedContainer
              meetingEndedCode={endedReasonCode}
              endedBy={endedBy}
              joinErrorCode={errorCode}
            />
          )
          : null
      }
      {
        !isGuestAllowed && !(meetingEnded || joinErrorCode || ejectReasonCode || loggedOut)
          ? (
            <GuestWaitContainer
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
  }));

  const { error, data } = useDeduplicatedSubscription<GetGuestLobbyInfo>(getGuestLobbyInfo, {
    skip: !!currentUserLoading || !!currentUserErrors || (!!currentUserData && currentUserData.guestStatus === 'ALLOW'),
  });

  const {
    loading: userInfoLoading,
    error: userInfoError,
    data: userInfoData,
  } = useQuery<GetUserInfoResponse>(getUserInfo);

  const loadingContextInfo = useContext(LoadingContext);
  if (userInfoLoading) return null;
  if (error || userInfoError) {
    loadingContextInfo.setLoading(false);
    logger.debug(`Error on user authentication: ${error}`);
  }

  if (
    !userInfoLoading
    && (userInfoData?.meeting.length === 0)
  ) {
    throw new Error('Meeting Not Found.', { cause: 'meeting_not_found' });
  }

  if (!currentUserData) return null;
  if (!userInfoData
      || userInfoData.meeting.length === 0) return null;
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
  } = currentUserData;

  const guestStatusDetails = data?.user_current?.[0]?.guestStatusDetails;

  const {
    logoutUrl,
    meetingId,
    name: meetingName,
    bannerColor,
    bannerText,
    customLogoUrl,
    customDarkLogoUrl,
  } = userInfoData.meeting[0];

  const MIN_BROWSER_CONFIG = window.meetingClientSettings.public.minBrowserVersions;
  const userAgent = window.navigator?.userAgent;
  const isSupportedBrowser = Bowser.getParser(userAgent).satisfies(MIN_BROWSER_CONFIG);
  const hasWebrtcSupport = isBrowserSupported();

  return (
    <PresenceManager
      authToken={authToken ?? ''}
      logoutUrl={logoutUrl ?? ''}
      meetingId={meetingId ?? ''}
      meetingName={meetingName ?? ''}
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
      isSupportedBrowser={isSupportedBrowser}
      hasWebrtcSupport={hasWebrtcSupport}
    >
      {children}
    </PresenceManager>
  );
};

export default PresenceManagerContainer;
