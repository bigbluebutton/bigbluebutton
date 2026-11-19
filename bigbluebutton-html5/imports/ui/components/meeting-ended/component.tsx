import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { isEmpty } from 'radash';
import { ApolloLink, useQuery } from '@apollo/client';
import isURL from 'validator/lib/isURL';
import {
  JoinErrorCodeTable,
  MeetingEndedTable,
  openLearningDashboardUrl,
  setLearningDashboardCookie,
  allowRedirectToLogoutURL,
} from './service';
import { MeetingEndDataResponse, getMeetingEndData } from './queries';
import useAuthData from '/imports/ui/core/local-states/useAuthData';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import GenericModal from '/imports/ui/components/common/modal/generic/component';
import Styled from './styles';
import { LoadingContext } from '../common/loading-screen/loading-screen-HOC/component';
import logger from '/imports/startup/client/logger';
import apolloContextHolder from '/imports/ui/core/graphql/apolloContextHolder/apolloContextHolder';
import useMeeting from '../../core/hooks/useMeeting';
import useCurrentUser from '../../core/hooks/useCurrentUser';

const intlMessage = defineMessages({
  410: {
    id: 'app.meeting.ended',
    description: 'message when meeting is ended',
  },
  403: {
    id: 'app.error.removed',
    description: 'Message to display when user is removed from the conference',
  },
  430: {
    id: 'app.error.meeting.ended',
    description: 'user logged conference',
  },
  'acl-not-allowed': {
    id: 'app.error.removed',
    description: 'Message to display when user is removed from the conference',
  },
  messageEnded: {
    id: 'app.meeting.endedMessage',
    description: 'message saying to go back to home screen',
  },
  messageEndedByUser: {
    id: 'app.meeting.endedByUserMessage',
    description: 'message informing who ended the meeting',
  },
  messageEndedByNoModeratorSingular: {
    id: 'app.meeting.endedByNoModeratorMessageSingular',
    description: 'message informing that the meeting was ended due to no moderator present (singular)',
  },
  messageEndedByNoModeratorPlural: {
    id: 'app.meeting.endedByNoModeratorMessagePlural',
    description: 'message informing that the meeting was ended due to no moderator present (plural)',
  },
  buttonOkay: {
    id: 'app.meeting.endNotification.ok.label',
    description: 'label okay for button',
  },
  [JoinErrorCodeTable.DUPLICATE_USER]: {
    id: 'app.meeting.logout.duplicateUserEjectReason',
    description: 'message for duplicate users',
  },
  [JoinErrorCodeTable.PERMISSION_FAILED]: {
    id: 'app.meeting.logout.permissionEjectReason',
    description: 'message for whom was kicked by doing something without permission',
  },
  [JoinErrorCodeTable.EJECT_USER]: {
    id: 'app.meeting.logout.ejectedFromMeeting',
    description: 'message when the user is removed by someone',
  },
  [JoinErrorCodeTable.SYSTEM_EJECT_USER]: {
    id: 'app.meeting.logout.ejectedFromMeeting',
    description: 'message when the user is removed by the system',
  },
  [JoinErrorCodeTable.MAX_PARTICIPANTS]: {
    id: 'app.meeting.logout.maxParticipantsReached',
    description: 'message when the user is rejected due to max participants limit',
  },
  [JoinErrorCodeTable.VALIDATE_TOKEN]: {
    id: 'app.meeting.logout.validateTokenFailedEjectReason',
    description: 'invalid auth token',
  },
  [JoinErrorCodeTable.USER_INACTIVITY]: {
    id: 'app.meeting.logout.userInactivityEjectReason',
    description: 'message to whom was kicked by inactivity',
  },
  [JoinErrorCodeTable.USER_LOGGED_OUT]: {
    id: 'app.feedback.title',
    description: 'message to whom was kicked by logging out',
  },
  [JoinErrorCodeTable.BANNED_USER_REJOINING]: {
    id: 'app.error.userBanned',
    description: 'message to whom was banned',
  },
  open_activity_report_btn: {
    id: 'app.learning-dashboard.clickHereToOpen',
    description: 'description of link to open activity report',
  },
  [MeetingEndedTable.ENDED_FROM_API]: {
    id: 'app.meeting.endedFromAPI',
    description: '',
  },
  [MeetingEndedTable.ENDED_WHEN_NOT_JOINED]: {
    id: 'app.meeting.endedWhenNoUserJoined',
    description: '',
  },
  [MeetingEndedTable.ENDED_WHEN_LAST_USER_LEFT]: {
    id: 'app.meeting.endedWhenLastUserLeft',
    description: '',
  },
  [MeetingEndedTable.ENDED_AFTER_USER_LOGGED_OUT]: {
    id: 'app.meeting.endedWhenLastUserLeft',
    description: '',
  },
  [MeetingEndedTable.ENDED_AFTER_EXCEEDING_DURATION]: {
    id: 'app.meeting.endedAfterExceedingDuration',
    description: '',
  },
  [MeetingEndedTable.BREAKOUT_ENDED_EXCEEDING_DURATION]: {
    id: 'app.meeting.breakoutEndedAfterExceedingDuration',
    description: '',
  },
  [MeetingEndedTable.BREAKOUT_ENDED_BY_MOD]: {
    id: 'app.meeting.breakoutEndedByModerator',
    description: '',
  },
  [MeetingEndedTable.ENDED_DUE_TO_NO_AUTHED_USER]: {
    id: 'app.meeting.endedDueNoAuthed',
    description: '',
  },
  [MeetingEndedTable.ENDED_DUE_TO_NO_MODERATOR]: {
    id: 'app.meeting.endedDueNoModerators',
    description: '',
  },
  [MeetingEndedTable.ENDED_DUE_TO_SERVICE_INTERRUPTION]: {
    id: 'app.meeting.endedDueServiceInterruption',
    description: '',
  },
});

const MEETING_ENDED_DESCRIPTION_ID = 'meetingEndedDescription';

interface MeetingEndedContainerProps {
  endedBy: string;
  meetingEndedCode: string;
  joinErrorCode: string;
  isBot: boolean;
}

interface MeetingEndedProps {
  endedBy: string;
  meetingEndedCode: string;
  joinErrorCode: string;
  skipMeetingEnded: boolean;
  learningDashboardAccessToken: string;
  isModerator: boolean;
  logoutUrl: string;
  learningDashboardBase: string;
  isBreakout: boolean;
  allowRedirect: boolean;
}

const MeetingEnded: React.FC<MeetingEndedProps> = ({
  endedBy,
  joinErrorCode,
  meetingEndedCode,
  skipMeetingEnded,
  learningDashboardAccessToken,
  isModerator,
  logoutUrl,
  learningDashboardBase,
  isBreakout,
  allowRedirect,
}) => {
  const loadingContextInfo = useContext(LoadingContext);
  const intl = useIntl();
  const [{
    authToken,
    meetingId,
  }] = useAuthData();
  const endMessageCode = meetingEndedCode || joinErrorCode || '410';

  const generateEndMessage = useCallback((endMessageCode: string, endedBy: string) => {
    if (!isEmpty(endedBy)) {
      return intl.formatMessage(intlMessage.messageEndedByUser, { userName: endedBy });
    }

    if (intlMessage[endMessageCode]) {
      return intl.formatMessage(intlMessage[endMessageCode]);
    }
    logger.error(`No meeting end message found for code: ${endMessageCode}`);
    return intl.formatMessage(intlMessage.messageEnded);
  }, []);

  const confirmRedirect = (isBreakout: boolean, allowRedirect: boolean) => {
    if (isBreakout) window.close();
    if (allowRedirect) {
      const reason = generateEndMessage(endMessageCode, endedBy);
      const finalUrl = reason
        ? `${logoutUrl}${logoutUrl.includes('?') ? '&' : '?'}reason=${encodeURIComponent(reason)}&reasonCode=${encodeURIComponent(endMessageCode)}`
        : logoutUrl;
      window.location.href = finalUrl;
    }
  };

  // isURL forwards allow_numeric_tld to isFQDN, but its types do not declare it.
  // @ts-ignore
  const hasLogoutUrl = isURL(logoutUrl, { allow_numeric_tld: true });
  const showRedirectButton = allowRedirect && hasLogoutUrl;

  const footerContent = useMemo(() => {
    if (!allowRedirect) return null;

    const { locale } = intl;
    const showLearningDashboardButton = !!learningDashboardAccessToken && isModerator
      // Always set cookie in case Dashboard is already opened
      && setLearningDashboardCookie(learningDashboardAccessToken, meetingId, learningDashboardBase) === true;

    if (!showLearningDashboardButton && !showRedirectButton) return null;

    return (
      <Styled.Footer>
        {showLearningDashboardButton ? (
          <Styled.FooterButton
            variant="secondary"
            iconStart={<Icon iconName="multi_whiteboard" />}
            label={intl.formatMessage(intlMessage.open_activity_report_btn)}
            dataTest="openLearningDashboardButton"
            onClick={() => openLearningDashboardUrl(learningDashboardAccessToken,
              meetingId,
              authToken,
              learningDashboardBase,
              locale)}
          />
        ) : null}
        {showRedirectButton ? (
          <Styled.FooterButton
            variant="primary"
            label={intl.formatMessage(intlMessage.buttonOkay)}
            onClick={() => confirmRedirect(isBreakout, allowRedirect)}
            ariaDescribedBy={MEETING_ENDED_DESCRIPTION_ID}
            dataTest="redirectButton"
          />
        ) : null}
      </Styled.Footer>
    );
  }, [learningDashboardAccessToken, isModerator, meetingId, authToken, learningDashboardBase, logoutUrl,
    allowRedirect, isBreakout]);

  useEffect(() => {
    // Sets Loading to falsed and removes loading splash screen
    loadingContextInfo.setLoading(false);
    // Stops all media tracks
    window.dispatchEvent(new Event('StopAudioTracks'));
    // get the media tag from the session storage
    // @ts-ignore
    const data = window.meetingClientSettings.public.media;
    // get media element and stops it and removes the audio source
    const mediaElement = document.querySelector<HTMLMediaElement>(data.mediaTag);
    if (mediaElement) {
      mediaElement.pause();
      mediaElement.srcObject = null;
    }
    // stops apollo client and removes it connection
    const apolloClient = apolloContextHolder.getClient();
    // stops client queries
    if (apolloClient) {
      apolloClient.stop();
    }

    apolloContextHolder.setShouldRetry(false);

    const ws = apolloContextHolder.getLink();
    // stops client connection after 5 seconds, if made immediately some data is lost
    if (ws) {
      setTimeout(() => {
        // overwrites the link with an empty link
        // if not new connection is made
        apolloClient.setLink(ApolloLink.empty());
        // closes the connection
        ws.dispose();
      }, 5000);
    }
  }, []);

  useEffect(() => {
    const { timeoutBeforeRedirectOnMeetingEnd } = window.meetingClientSettings.public.app;
    if (typeof timeoutBeforeRedirectOnMeetingEnd === 'number' && !skipMeetingEnded) {
      setTimeout(() => {
        confirmRedirect(isBreakout, allowRedirect);
      }, timeoutBeforeRedirectOnMeetingEnd);
    }
  }, []);

  if (skipMeetingEnded) {
    confirmRedirect(isBreakout, allowRedirect);
    return <></>; // even though well redirect, return empty component and prevent lint error
  }

  return (
    <Styled.Parent>
      <GenericModal
        isOpen
        onRequestClose={() => {}}
        title={generateEndMessage(endMessageCode, endedBy)}
        hideCloseButton
        shouldCloseOnEsc={false}
        shouldCloseOnOverlayClick={false}
        dataTest="meetingEndedModal"
        footerContent={footerContent}
      >
        {showRedirectButton ? (
          <Styled.Description id={MEETING_ENDED_DESCRIPTION_ID}>
            {intl.formatMessage(intlMessage.messageEnded)}
          </Styled.Description>
        ) : null}
      </GenericModal>
    </Styled.Parent>
  );
};

const MeetingEndedContainer: React.FC<MeetingEndedContainerProps> = ({
  endedBy,
  meetingEndedCode,
  joinErrorCode,
  isBot,
}) => {
  const {
    loading: meetingEndLoading,
    error: meetingEndError,
    data: meetingEndData,
  } = useQuery<MeetingEndDataResponse>(getMeetingEndData);

  const {
    data: meetingData,
  } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
  }));

  const {
    data: currentUserData,
    loading: currentUserLoading,
    errors: currentUserErrors,
  } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
    logoutUrl: u.logoutUrl,
  }));

  if (meetingEndLoading || !meetingEndData || currentUserLoading || !currentUserData) {
    return null;
  }

  if (meetingEndError || currentUserErrors) {
    logger.error('Error on fetching meeting end data: ', meetingEndError);
    return (
      <MeetingEnded
        endedBy=""
        joinErrorCode=""
        meetingEndedCode=""
        allowRedirect={false}
        skipMeetingEnded={false}
        learningDashboardAccessToken=""
        isModerator={false}
        logoutUrl=""
        learningDashboardBase=""
        isBreakout={false}
      />
    );
  }

  const {
    user_current,
  } = meetingEndData;
  const {
    isModerator,
    logoutUrl,
  } = currentUserData;

  const {
    learningDashboard,
  } = user_current[0].meeting;

  const {
    skipMeetingEnded,
    learningDashboardBase,
  } = window.meetingClientSettings.public.app;

  const allowRedirect = allowRedirectToLogoutURL(logoutUrl ?? '') && !isBot;

  return (
    <MeetingEnded
      endedBy={endedBy}
      joinErrorCode={joinErrorCode}
      meetingEndedCode={meetingEndedCode}
      allowRedirect={allowRedirect}
      skipMeetingEnded={skipMeetingEnded}
      learningDashboardAccessToken={learningDashboard?.learningDashboardAccessToken}
      isModerator={isModerator ?? false}
      logoutUrl={logoutUrl ?? ''}
      learningDashboardBase={learningDashboardBase}
      isBreakout={meetingData?.isBreakout ?? false}
    />
  );
};

export default MeetingEndedContainer;
