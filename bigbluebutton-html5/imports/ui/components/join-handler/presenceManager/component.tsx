import { useMutation, useQuery, useSubscription } from '@apollo/client';
import React, { useContext, useEffect } from 'react';
import { Session } from 'meteor/session';
import {
  getUserCurrent,
  GetUserCurrentResponse,
  getUserInfo,
  GetUserInfoResponse,
  userJoinMutation,
} from './queries';
import { setAuthData } from '/imports/ui/core/local-states/useAuthData';
import MeetingEndedContainer from '../../meeting-ended/meeting-ended-ts/component';
import { setUserDataToSessionStorage } from './service';
import { LoadingContext } from '../../common/loading-screen/loading-screen-HOC/component';

const connectionTimeout = 60000;

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
    loggedOut: boolean;
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
  loggedOut,
}) => {
  const [allowToRender, setAllowToRender] = React.useState(false);
  const [dispatchUserJoin] = useMutation(userJoinMutation);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const loadingContextInfo = useContext(LoadingContext);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      loadingContextInfo.setLoading(false, '');
      throw new Error('Authentication timeout');
    }, connectionTimeout);

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
    });
  }, []);

  useEffect(() => {
    if (bannerColor || bannerText) {
      Session.set('bannerText', bannerText);
      Session.set('bannerColor', bannerColor);
    }
  }, [bannerColor, bannerText]);

  useEffect(() => {
    if (authToken && !joined) {
      dispatchUserJoin({
        variables: {
          authToken,
          clientType: 'HTML5',
        },
      });
    }
  }, [joined, authToken]);

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
    </>
  );
};

const PresenceManagerContainer: React.FC<PresenceManagerContainerProps> = ({ children }) => {
  const { loading, error, data } = useSubscription<GetUserCurrentResponse>(getUserCurrent);

  const {
    loading: userInfoLoading,
    error: userInfoError,
    data: userInfoData,
  } = useQuery<GetUserInfoResponse>(getUserInfo);

  const loadingContextInfo = useContext(LoadingContext);
  if (loading || userInfoLoading) return null;
  if (error || userInfoError) {
    loadingContextInfo.setLoading(false, '');
    throw new Error('Error on user authentication: ', error);
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
  } = data.user_current[0];
  const {
    logoutUrl,
    meetingId,
    name: meetingName,
    bannerColor,
    bannerText,
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
    >
      {children}
    </PresenceManager>
  );
};

export default PresenceManagerContainer;
