import { useMutation, useQuery, useSubscription } from '@apollo/client';
import React, { useEffect } from 'react';
import {
  getUserCurrent,
  GetUserCurrentResponse,
  getUserInfo,
  GetUserInfoResponse,
  userJoinMutation,
} from './queries';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import Auth from '/imports/ui/services/auth';

const { connectionTimeout } = window.meetingClientSettings.public.app;

interface JoinHandlerContainerProps {
    children: React.ReactNode;
  }

interface JoinHandlerProps extends JoinHandlerContainerProps {
    authToken: string;
    authed: boolean;
    logoutUrl: string;
    meetingId: string;
    meetingName: string;
    userName: string;
    extId: string;
    userId: string;
    joinErrorCode: string;
    joinErrorMessage: string;
}

const JoinHandler: React.FC<JoinHandlerProps> = ({
  authToken,
  authed,
  children,
  logoutUrl,
  meetingId,
  meetingName,
  userName,
  extId,
  userId,
  joinErrorCode,
  joinErrorMessage,
}) => {
  const [allowToRender, setAllowToRender] = React.useState(false);
  const [dispatchUserJoin] = useMutation(userJoinMutation);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      throw new Error('Authentication timeout');
    }, connectionTimeout);
  }, []);
  useEffect(() => {
    if (authToken && !authed) {
      dispatchUserJoin({
        variables: {
          authToken,
          clientType: 'HTML5',
        },
      });
    }
  }, [authed, authToken]);
  useEffect(() => {
    if (authed) {
      clearTimeout(timeoutRef.current);
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('sessionToken');
      Auth.clearCredentials();
      Auth.set(
        meetingId,
        userId,
        authToken,
        logoutUrl,
        sessionToken,
        userName,
        extId,
        meetingName,
      );
      setAllowToRender(true);
    }
  }, [authed]);
  useEffect(() => {
    if (joinErrorCode) {
      throw new Error(joinErrorMessage);
    }
  },
  [joinErrorCode, joinErrorMessage]);
  return allowToRender ? children
    : (
      <LoadingScreen>
        {/* I made this because the component is in JS and requires a child, but it's optional */}
        <div style={{
          display: 'none',
        }}
        >
          <h1>Loading...</h1>
        </div>
      </LoadingScreen>
    );
};

const JoinHandlerContainer: React.FC<JoinHandlerContainerProps> = ({ children }) => {
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
  if (!userInfoData || userInfoData.meeting.length === 0) return null;
  const {
    authToken,
    authed,
    joinErrorCode,
    joinErrorMessage,
  } = data.user_current[0];
  const { logoutUrl, meetingId, name: meetingName } = userInfoData.meeting[0];
  const { extId, name: userName, userId } = userInfoData.user_current[0];
  return (
    <JoinHandler
      authToken={authToken}
      authed={authed}
      logoutUrl={logoutUrl}
      meetingId={meetingId}
      meetingName={meetingName}
      userName={userName}
      extId={extId}
      userId={userId}
      joinErrorCode={joinErrorCode}
      joinErrorMessage={joinErrorMessage}
    >
      {children}
    </JoinHandler>
  );
};

export default JoinHandlerContainer;
