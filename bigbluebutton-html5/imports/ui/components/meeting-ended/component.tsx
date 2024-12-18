import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
} from './service';
import { MeetingEndDataResponse, getMeetingEndData } from './queries';
import useAuthData from '/imports/ui/core/local-states/useAuthData';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import Styled from './styles';
import Rating from './rating/component';
import { LoadingContext } from '../common/loading-screen/loading-screen-HOC/component';
import logger from '/imports/startup/client/logger';
import apolloContextHolder from '/imports/ui/core/graphql/apolloContextHolder/apolloContextHolder';
import getFromUserSettings from '/imports/ui/services/users-settings';

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
  title: {
    id: 'app.feedback.title',
    description: 'title for feedback screen',
  },
  subtitle: {
    id: 'app.feedback.subtitle',
    description: 'subtitle for feedback screen',
  },
  textarea: {
    id: 'app.feedback.textarea',
    description: 'placeholder for textarea',
  },
  confirmDesc: {
    id: 'app.leaveConfirmation.confirmDesc',
    description: 'adds context to confim option',
  },
  sendLabel: {
    id: 'app.feedback.sendFeedback',
    description: 'send feedback button label',
  },
  sendDesc: {
    id: 'app.feedback.sendFeedbackDesc',
    description: 'adds context to send feedback option',
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

interface MeetingEndedContainerProps {
  endedBy: string;
  meetingEndedCode: string;
  joinErrorCode: string;
}

interface MeetingEndedProps extends MeetingEndedContainerProps {
  allowDefaultLogoutUrl: boolean;
  askForFeedbackOnLogout: boolean
  learningDashboardAccessToken: string;
  isModerator: boolean;
  logoutUrl: string;
  learningDashboardBase: string;
  isBreakout: boolean;
}

const MeetingEnded: React.FC<MeetingEndedProps> = ({
  endedBy,
  joinErrorCode,
  meetingEndedCode,
  allowDefaultLogoutUrl,
  askForFeedbackOnLogout,
  learningDashboardAccessToken,
  isModerator,
  logoutUrl,
  learningDashboardBase,
  isBreakout,
}) => {
  const loadingContextInfo = useContext(LoadingContext);
  const intl = useIntl();
  const [{
    authToken,
    meetingId,
    userName,
    userId,
  }] = useAuthData();
  const [selectedStars, setSelectedStars] = useState(0);
  const [dispatched, setDispatched] = useState(false);

  const generateEndMessage = useCallback((joinErrorCode: string, meetingEndedCode: string, endedBy: string) => {
    if (!isEmpty(endedBy)) {
      return intl.formatMessage(intlMessage.messageEndedByUser, { 0: endedBy });
    }
    // OR opetaror always returns the first truthy value

    const code = meetingEndedCode || joinErrorCode || '410';
    return intl.formatMessage(intlMessage[code]);
  }, []);

  const sendFeedback = useCallback(() => {
    const textarea = document.getElementById('feedbackComment') as HTMLTextAreaElement;
    const comment = (textarea?.value || '').trim();

    const message = {
      rating: selectedStars,
      userId,
      userName,
      authToken,
      meetingId,
      comment,
      isModerator,
    };

    const pathMatch = window.location.pathname.match('^(.*)/html5client/$');
    if (pathMatch == null) {
      throw new Error('Failed to match BBB client URI');
    }
    const serverPathPrefix = pathMatch[1];

    const sessionToken = sessionStorage.getItem('sessionToken');

    const url = `https://${window.location.hostname}${serverPathPrefix}/bigbluebutton/api/feedback?sessionToken=${sessionToken}`;
    const options = {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    setDispatched(true);

    fetch(url, options).then(() => {
      if (!isModerator) {
        const REDIRECT_WAIT_TIME = 5000;
        setTimeout(() => {
          window.location.href = logoutUrl;
        }, REDIRECT_WAIT_TIME);
      }
    }).catch((e) => {
      logger.warn({
        logCode: 'user_feedback_not_sent_error',
        extraInfo: {
          errorName: e.name,
          errorMessage: e.message,
        },
      }, `Unable to send feedback: ${e.message}`);
    });
  }, [selectedStars]);

  const confirmRedirect = (isBreakout: boolean, allowRedirect: boolean) => {
    if (isBreakout) window.close();
    if (allowRedirect) {
      if (isURL(logoutUrl)) {
        window.location.href = logoutUrl;
      }
    }
  };

  const logoutButton = useMemo(() => {
    const { locale } = intl;
    return (
      (
        <Styled.Wrapper>
          {
            learningDashboardAccessToken && isModerator
            // Always set cookie in case Dashboard is already opened
            && setLearningDashboardCookie(learningDashboardAccessToken, meetingId, learningDashboardBase) === true
              ? (
                <Styled.Text>
                  <Styled.MeetingEndedButton
                    color="default"
                    onClick={() => openLearningDashboardUrl(learningDashboardAccessToken,
                      meetingId,
                      authToken,
                      learningDashboardBase,
                      locale)}
                    aria-details={intl.formatMessage(intlMessage.open_activity_report_btn)}
                  >
                    <Icon
                      iconName="multi_whiteboard"
                    />
                  </Styled.MeetingEndedButton>
                </Styled.Text>
              ) : null
          }
          <Styled.Text>
            {intl.formatMessage(intlMessage.messageEnded)}
          </Styled.Text>

          <Styled.MeetingEndedButton
            color="primary"
            onClick={() => confirmRedirect(isBreakout, allowDefaultLogoutUrl)}
            /* @eslint-disable-next-line */
            aria-details={intl.formatMessage(intlMessage.confirmDesc)}
          >
            {intl.formatMessage(intlMessage.buttonOkay)}
          </Styled.MeetingEndedButton>
        </Styled.Wrapper>
      )
    );
  }, [learningDashboardAccessToken, isModerator, meetingId, authToken, learningDashboardBase]);

  const feedbackScreen = useMemo(() => {
    const shouldShowFeedback = askForFeedbackOnLogout && !dispatched;
    const noRating = selectedStars === 0;

    let buttonAction = () => confirmRedirect(isBreakout, allowDefaultLogoutUrl);
    let buttonDesc = intl.formatMessage(intlMessage.confirmDesc);
    let buttonLabel = intl.formatMessage(intlMessage.buttonOkay);

    if (!dispatched) {
      if (noRating) {
        buttonAction = () => setDispatched(true);
        buttonDesc = intl.formatMessage(intlMessage.confirmDesc);
        buttonLabel = intl.formatMessage(intlMessage.buttonOkay);
      } else {
        buttonAction = () => sendFeedback();
        buttonDesc = intl.formatMessage(intlMessage.sendDesc);
        buttonLabel = intl.formatMessage(intlMessage.sendLabel);
      }
    }

    return (
      <>
        <Styled.Text>
          {shouldShowFeedback
            ? intl.formatMessage(intlMessage.subtitle)
            : intl.formatMessage(intlMessage.messageEnded)}
        </Styled.Text>

        {shouldShowFeedback ? (
          <div data-test="rating">
            <Rating
              total="5"
              onRate={setSelectedStars}
            />
            {!noRating ? (
              <Styled.TextArea
                rows={5}
                id="feedbackComment"
                placeholder={intl.formatMessage(intlMessage.textarea)}
                aria-describedby="textareaDesc"
              />
            ) : null}
          </div>
        ) : null}
        <Styled.Wrapper>
          <Styled.MeetingEndedButton
            color="primary"
            onClick={buttonAction}
            aria-details={buttonDesc}
            data-test={(!noRating && !dispatched) ? 'sendFeedbackButton' : null}
          >
            {buttonLabel}
          </Styled.MeetingEndedButton>
        </Styled.Wrapper>
      </>
    );
  }, [askForFeedbackOnLogout, dispatched, selectedStars]);

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
        ws.terminate();
      }, 5000);
    }
  }, []);

  return (
    <Styled.Parent>
      <Styled.Modal data-test="meetingEndedModal">
        <Styled.Content>
          <Styled.Title>
            {generateEndMessage(joinErrorCode, meetingEndedCode, endedBy)}
          </Styled.Title>
          {allowDefaultLogoutUrl && !askForFeedbackOnLogout ? logoutButton : null}
          {askForFeedbackOnLogout ? feedbackScreen : null}
        </Styled.Content>
      </Styled.Modal>
    </Styled.Parent>
  );
};

const MeetingEndedContainer: React.FC<MeetingEndedContainerProps> = ({
  endedBy,
  meetingEndedCode,
  joinErrorCode,
}) => {
  const {
    loading: meetingEndLoading,
    error: meetingEndError,
    data: meetingEndData,
  } = useQuery<MeetingEndDataResponse>(getMeetingEndData);

  if (meetingEndLoading || !meetingEndData) {
    return (
      <MeetingEnded
        endedBy=""
        joinErrorCode=""
        meetingEndedCode=""
        allowDefaultLogoutUrl={false}
        askForFeedbackOnLogout={false}
        learningDashboardAccessToken=""
        isModerator={false}
        logoutUrl=""
        learningDashboardBase=""
        isBreakout={false}
      />
    );
  }

  if (meetingEndError) {
    logger.error('Error on fetching meeting end data: ', meetingEndError);
    return (
      <MeetingEnded
        endedBy=""
        joinErrorCode=""
        meetingEndedCode=""
        allowDefaultLogoutUrl={false}
        askForFeedbackOnLogout={false}
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
    meeting,
  } = user_current[0];

  const {
    learningDashboard,
    isBreakout,
    clientSettings,
  } = meeting;

  const {
    askForFeedbackOnLogout,
    allowDefaultLogoutUrl,
    learningDashboardBase,
  } = clientSettings;

  const shouldAskForFeedback = !isBreakout
  && (askForFeedbackOnLogout
  || getFromUserSettings('bbb_ask_for_feedback_on_logout'));

  return (
    <MeetingEnded
      endedBy={endedBy}
      joinErrorCode={joinErrorCode}
      meetingEndedCode={meetingEndedCode}
      allowDefaultLogoutUrl={allowDefaultLogoutUrl}
      askForFeedbackOnLogout={shouldAskForFeedback}
      learningDashboardAccessToken={learningDashboard?.learningDashboardAccessToken}
      isModerator={isModerator}
      logoutUrl={logoutUrl}
      learningDashboardBase={learningDashboardBase}
      isBreakout={isBreakout}
    />
  );
};

export default MeetingEndedContainer;
