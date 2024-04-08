import { useMutation } from '@apollo/client';
import React, { useContext, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
// @ts-ignore - type avaible only to server package
import { DDP } from 'meteor/ddp-client';
import { Session } from 'meteor/session';
import { userJoinMutation } from './queries';
import { setAuthData } from '/imports/ui/core/local-states/useAuthData';
import MeetingEndedContainer from '../../meeting-ended/meeting-ended-ts/component';
import { setUserDataToSessionStorage } from './service';
import { LoadingContext } from '../../common/loading-screen/loading-screen-HOC/component';
import useCurrentUnjoinedUser from '/imports/ui/core/hooks/useCurrentUnjoinedUser';
import useMeetingUnjoined from '/imports/ui/core/hooks/useMeetingUnjoined';

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
  const {
    data: userData,
    loading: userLoading,
    errors: userErrors,
  } = useCurrentUnjoinedUser((u) => u);
  const {
    data: meetingData,
    loading: meetingLoading,
    errors: meetingErrors,
  } = useMeetingUnjoined((m) => m);

  const loadingContextInfo = useContext(LoadingContext);
  if (userLoading || meetingLoading) return null;
  if (userErrors || meetingErrors) {
    loadingContextInfo.setLoading(false, '');
    throw new Error('Error on user authentication: ', userErrors?.[0] ?? meetingErrors?.[0]);
  }

  if (!userData) return null;
  if (!meetingData) return null;
  const {
    authToken,
    joinErrorCode,
    joinErrorMessage,
    joined,
    ejectReasonCode,
    name: userName,
    extId,
    userId,
  } = userData;
  const {
    logoutUrl,
    meetingId,
    name: meetingName,
    bannerColor,
    bannerText,
    endedReasonCode: meetingEndedReasonCode,
    ended: meetingEnded,
    endedByUserName: meetingEndedByUserName,
  } = meetingData;

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
      meetingEnded={meetingEnded}
      endedReasonCode={meetingEndedReasonCode}
      endedBy={meetingEndedByUserName}
      ejectReasonCode={ejectReasonCode}
      bannerColor={bannerColor}
      bannerText={bannerText}
    >
      {children}
    </PresenceManager>
  );
};

export default PresenceManagerContainer;
