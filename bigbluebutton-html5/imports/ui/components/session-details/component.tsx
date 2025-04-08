import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { useQuery } from '@apollo/client';
import { GET_WELCOME_MESSAGE, WelcomeMsgsResponse } from './queries';
import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';

const intlMessages = defineMessages({
  title: {
    id: 'app.sessionDetails.title',
    description: 'Session details title',
  },
  dismissLabel: {
    id: 'app.sessionDetails.dismissLabel',
    description: 'Dismiss button label',
  },
  dismissDesc: {
    id: 'app.sessionDetails.dismissDesc',
    description: 'adds descriptive context to dissmissLabel',
  },
  joinByUrlLabel: {
    id: 'app.sessionDetails.joinByUrl',
    description: 'adds descriptive context to dissmissLabel',
  },
  joinByPhoneLabel: {
    id: 'app.sessionDetails.joinByPhone',
    description: 'adds descriptive context to dissmissLabel',
  },
  copyUrlTooltip: {
    id: 'app.sessionDetails.copyUrlTooltip',
    description: 'adds descriptive context to dissmissLabel',
  },
  copyPhoneTooltip: {
    id: 'app.sessionDetails.copyPhoneTooltip',
    description: 'adds descriptive context to dissmissLabel',
  },
  phonePinLabel: {
    id: 'app.sessionDetails.phonePin',
    description: 'adds descriptive context to dissmissLabel',
  },
  copied: {
    id: 'app.sessionDetails.copied',
    description: 'Copied join data',
  },
});

interface SessionDetailsContainerProps {
  isOpen: boolean,
  onRequestClose: () => void,
  priority: string,
}

interface SessionDetailsProps extends SessionDetailsContainerProps {
  welcomeMessage: string;
  welcomeMsgForModerators: string;
  loginUrl: string,
  formattedDialNum: string,
  formattedTelVoice: string,
  anchorElement: HTMLElement | null,
}

const COPY_MESSAGE_TIMEOUT = 3000;

const SessionDetails: React.FC<SessionDetailsProps> = (props) => {
  const {
    welcomeMessage,
    welcomeMsgForModerators,
    isOpen,
    onRequestClose,
    priority,
    loginUrl,
    formattedDialNum,
    formattedTelVoice,
    anchorElement,
  } = props;
  const intl = useIntl();
  const [copyingJoinUrl, setCopyingJoinUrl] = useState(false);
  const [copyingDialIn, setCopyingDialIn] = useState(false);

  const formattedPin = formattedTelVoice.replace(/(?=(\d{3})+(?!\d))/g, ' ');

  const copyData = async (content: string, type: string) => {
    if (type === 'join-url') setCopyingJoinUrl(true);
    if (type === 'dial-in') setCopyingDialIn(true);

    await navigator.clipboard.writeText(content);

    setTimeout(() => {
      if (type === 'join-url') setCopyingJoinUrl(false);
      if (type === 'dial-in') setCopyingDialIn(false);
    }, COPY_MESSAGE_TIMEOUT);
  };

  const { isMobile } = deviceInfo;

  return (
    <ModalSimple
      title={intl.formatMessage(intlMessages.title)}
      dismiss={{
        label: intl.formatMessage(intlMessages.dismissLabel),
        description: intl.formatMessage(intlMessages.dismissDesc),
      }}
      data-test="sessionDetailsModal"
      {...{
        isOpen,
        onRequestClose,
        priority,
        anchorElement,
      }}
    >
      <Styled.Chevron />
      <Styled.Container
        isFullWidth={isMobile || !(loginUrl || (formattedDialNum && formattedTelVoice))}
      >
        <div>
          <Styled.WelcomeMessage dangerouslySetInnerHTML={{ __html: welcomeMessage }} />
          <Styled.WelcomeMessage dangerouslySetInnerHTML={{ __html: welcomeMsgForModerators }} />
        </div>
        <div>
          {loginUrl && (
            <>
              <Styled.JoinTitle>
                {intl.formatMessage(intlMessages.joinByUrlLabel)}
              </Styled.JoinTitle>
              <p>
                {loginUrl}
                <Styled.CopyButton
                  key="copy-join-url"
                  onClick={() => copyData(loginUrl, 'join-url')}
                  hideLabel
                  color="light"
                  icon={copyingJoinUrl ? 'check' : 'copy'}
                  size="sm"
                  circle
                  ghost
                  label={copyingJoinUrl
                    ? intl.formatMessage(intlMessages.copied)
                    : intl.formatMessage(intlMessages.copyUrlTooltip)}
                />
              </p>
            </>
          )}
          {formattedDialNum && formattedTelVoice && (
            <>
              <Styled.JoinTitle>
                {intl.formatMessage(intlMessages.joinByPhoneLabel)}
                <Styled.CopyButton
                  key="copy-dial-in"
                  onClick={() => copyData(formattedDialNum, 'dial-in')}
                  hideLabel
                  color="light"
                  icon={copyingDialIn ? 'check' : 'copy'}
                  size="sm"
                  circle
                  ghost
                  label={copyingDialIn
                    ? intl.formatMessage(intlMessages.copied)
                    : intl.formatMessage(intlMessages.copyPhoneTooltip)}
                />
              </Styled.JoinTitle>
              <p>{formattedDialNum}</p>
              <p>
                <b>
                  {`${intl.formatMessage(intlMessages.phonePinLabel)}:`}
                </b>
                {` ${formattedPin} #`}
              </p>
            </>
          )}
        </div>
      </Styled.Container>
    </ModalSimple>
  );
};

const SessionDetailsContainer: React.FC<SessionDetailsContainerProps> = ({
  isOpen,
  onRequestClose,
  priority,
}) => {
  const {
    data: welcomeData,
    loading: welcomeLoading,
    error: welcomeError,
  } = useQuery<WelcomeMsgsResponse>(GET_WELCOME_MESSAGE);

  const { loading, data: currentMeeting } = useMeeting((m) => {
    return {
      name: m.name,
      loginUrl: m.loginUrl,
      voiceSettings: m.voiceSettings,
    };
  });

  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  if (welcomeLoading) return null;
  if (welcomeError) return <div>{JSON.stringify(welcomeError)}</div>;
  if (!welcomeData || loading || !currentMeeting) return null;

  const invalidDialNumbers = ['0', '613-555-1212', '613-555-1234', '0000'];

  let formattedDialNum = '';
  let formattedTelVoice = '';

  if (currentMeeting && currentMeeting.voiceSettings) {
    const { dialNumber, telVoice } = currentMeeting.voiceSettings;
    if (invalidDialNumbers.indexOf(dialNumber) < 0) {
      formattedDialNum = dialNumber;
      formattedTelVoice = telVoice;
    }
  }

  const anchorElement = document.getElementById('presentationTitle') as HTMLElement;

  // login url should only be displayed for moderators
  let loginUrl = currentMeeting.loginUrl ?? '';
  const isModerator = currentUserData?.isModerator;

  if (!isModerator) {
    loginUrl = '';
  }

  return (
    <SessionDetails
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      priority={priority}
      loginUrl={loginUrl}
      welcomeMessage={welcomeData.user_welcomeMsgs[0]?.welcomeMsg ?? ''}
      welcomeMsgForModerators={welcomeData.user_welcomeMsgs[0]?.welcomeMsgForModerators ?? ''}
      formattedDialNum={formattedDialNum}
      formattedTelVoice={formattedTelVoice}
      anchorElement={anchorElement}
    />
  );
};

export default SessionDetailsContainer;
