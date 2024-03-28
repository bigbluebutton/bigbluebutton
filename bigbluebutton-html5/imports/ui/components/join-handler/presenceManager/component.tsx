import { useMutation, useQuery, useSubscription } from '@apollo/client';
import React, { useContext, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
// @ts-ignore - type avaible only to server package
import { DDP } from 'meteor/ddp-client';
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
}) => {
  const [allowToRender, setAllowToRender] = React.useState(false);
  const [dispatchUserJoin] = useMutation(userJoinMutation);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const loadingContextInfo = useContext(LoadingContext);
  const clientSettingsRef = useRef(JSON.parse(sessionStorage.getItem('clientStartupSettings') || '{}'));

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      loadingContextInfo.setLoading(false, '');
      throw new Error('Authentication timeout');
    }, connectionTimeout);

    if (!clientSettingsRef.current.skipMeteorConnection) {
      DDP.onReconnect(() => {
        Meteor.callAsync('validateConnection', authToken, meetingId, userId);
      });
    }

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
      if (clientSettingsRef.current.skipMeteorConnection) {
        setAllowToRender(true);
      } else {
        Meteor.callAsync('validateConnection', authToken, meetingId, userId).then(() => {
          setAllowToRender(true);
        });
      }
    }
  }, [joined]);

  useEffect(() => {
    if (joinErrorCode) {
      loadingContextInfo.setLoading(false, '');
    }
  },
  [joinErrorCode, joinErrorMessage]);

  return (
    <>
      {allowToRender && !(meetingEnded || joinErrorCode || ejectReasonCode) ? children : null}
      {
        meetingEnded || joinErrorCode || ejectReasonCode
          ? (
            <MeetingEndedContainer
              meetingEndedCode={endedReasonCode}
              endedBy={endedBy}
              joinErrorCode={joinErrorCode || ejectReasonCode}
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
    >
      {children}
    </PresenceManager>
  );
};

export default PresenceManagerContainer;
