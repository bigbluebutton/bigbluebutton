import { useMutation, useQuery } from '@apollo/client';
import React, { useContext, useEffect, useState } from 'react';
import Session from '/imports/ui/services/storage/in-memory';
import {
  getUserCurrent,
  GetUserCurrentResponse,
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
        loadingContextInfo.setLoading(false, '');
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
      loadingContextInfo.setLoading(false, '');
    }
  },
  [joinErrorCode, joinErrorMessage]);

  const errorCode = loggedOut ? 'user_logged_out_reason' : joinErrorCode || ejectReasonCode;

  return (
    <>
      {allowToRender && !(meetingEnded || joinErrorCode || ejectReasonCode || loggedOut) ? children : null}
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
  const { loading, error, data } = useDeduplicatedSubscription<GetUserCurrentResponse>(getUserCurrent);

  const {
    loading: userInfoLoading,
    error: userInfoError,
    data: userInfoData,
  } = useQuery<GetUserInfoResponse>(getUserInfo);

  const loadingContextInfo = useContext(LoadingContext);
  if (loading || userInfoLoading) return null;
  if (error || userInfoError) {
    loadingContextInfo.setLoading(false, '');
    logger.debug(`Error on user authentication: ${error}`);
  }

  if (!data || data.user_current.length === 0) return null;
  if (!userInfoData
      || userInfoData.meeting.length === 0
      || userInfoData.user_current.length === 0) return null;
  const {
    authToken,
    joinErrorCode,
    joinErrorMessage,
    joined,
    ejectReasonCode,
    meeting,
    loggedOut,
    guestStatusDetails,
    guestStatus,
  } = data.user_current[0];
  const {
    logoutUrl,
    meetingId,
    name: meetingName,
    bannerColor,
    bannerText,
    customLogoUrl,
    customDarkLogoUrl,
  } = userInfoData.meeting[0];
  const { extId, name: userName, userId } = userInfoData.user_current[0];

  return (
    <PresenceManager
      authToken={authToken}
      logoutUrl={logoutUrl}
      meetingId={meetingId}
      meetingName={meetingName}
      userName={userName}
      extId={extId}
      userId={userId}
      joined={joined}
      joinErrorCode={joinErrorCode}
      joinErrorMessage={joinErrorMessage}
      meetingEnded={meeting.ended}
      endedReasonCode={meeting.endedReasonCode}
      endedBy={meeting.endedByUserName}
      ejectReasonCode={ejectReasonCode}
      bannerColor={bannerColor}
      bannerText={bannerText}
      loggedOut={loggedOut}
      customLogoUrl={customLogoUrl}
      customDarkLogoUrl={customDarkLogoUrl}
      guestLobbyMessage={guestStatusDetails?.guestLobbyMessage ?? null}
      positionInWaitingQueue={guestStatusDetails?.positionInWaitingQueue ?? null}
      guestStatus={guestStatus}
    >
      {children}
    </PresenceManager>
  );
};

export default PresenceManagerContainer;
