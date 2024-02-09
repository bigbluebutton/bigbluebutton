import { useMutation, useQuery, useSubscription } from '@apollo/client';
import React, { useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';
import {
  getUserCurrent,
  GetUserCurrentResponse,
  getUserInfo,
  GetUserInfoResponse,
  userJoinMutation,
} from './queries';
import { setAuthData } from '/imports/ui/core/local-states/useAuthData';
import MeetingEndedContainer from '../../meeting-ended/meeting-ended-ts/component';

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
}) => {
  const [allowToRender, setAllowToRender] = React.useState(false);
  const [dispatchUserJoin] = useMutation(userJoinMutation);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      throw new Error('Authentication timeout');
    }, connectionTimeout);

    DDP.onReconnect(() => {
      Meteor.callAsync('validateConnection', authToken, meetingId, userId);
    });

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
  }, []);

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
    console.log('joined', joined);
    if (!joined || (meetingEnded || joinErrorCode || ejectReasonCode)) {
      clearTimeout(timeoutRef.current);
    }
  }, [joined]);

  useEffect(() => {
    if (joined) {
      Meteor.callAsync('validateConnection', authToken, meetingId, userId).then(() => {
        setAllowToRender(true);
      });
    }
  }, [joined]);

  useEffect(() => {
    if (joinErrorCode) {
      throw new Error(joinErrorMessage);
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
  if (loading || userInfoLoading) return null;
  if (error || userInfoError) {
    throw new Error('Error on user authentication: ', error);
  }

  if (!data || data.user_current.length === 0) return null;
  if (!userInfoData
      || userInfoData.meeting.length === 0
      || userInfoData.user_current.length === 0) return null;
  const {
    authToken,
    authed,
    joinErrorCode,
    joinErrorMessage,
    joined,
    ejectReasonCode,
    meeting,
  } = data.user_current[0];
  const { logoutUrl, meetingId, name: meetingName } = userInfoData.meeting[0];
  const { extId, name: userName, userId } = userInfoData.user_current[0];

  return (
    <PresenceManager
      authToken={authToken}
      authed={authed}
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
      endedBy={meeting.endedBy}
      ejectReasonCode={ejectReasonCode}
    >
      {children}
    </PresenceManager>
  );
};

export default PresenceManagerContainer;
