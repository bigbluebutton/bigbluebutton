import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { useQuery } from '@apollo/client';
import { GET_WELCOME_MESSAGE, WelcomeMsgsResponse } from './queries';
import Styled from './styles';

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
});

interface SessionDetailsContainerProps {
  isOpen: boolean,
  onRequestClose: () => void,
  priority: string,
}

interface SessionDetailsProps extends SessionDetailsContainerProps {
  meetingName: string;
  welcomeMessage: string;
  welcomeMsgForModerators: string;
  loginUrl: string,
  formattedDialNum: string,
  formattedTelVoice: string,
  anchorElement: HTMLElement | null,
}

const SessionDetails: React.FC<SessionDetailsProps> = (props) => {
  const {
    meetingName,
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

  const formattedPin = formattedTelVoice.replace(/(?=(\d{3})+(?!\d))/g, ' ');

  const copyData = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  return (
    <ModalSimple
      title={intl.formatMessage(intlMessages.title, { 0: meetingName })}
      dismiss={{
        label: intl.formatMessage(intlMessages.dismissLabel),
        description: intl.formatMessage(intlMessages.dismissDesc),
      }}
      {...{
        isOpen,
        onRequestClose,
        priority,
        anchorElement,
      }}
    >
      <Styled.Chevron />
      <Styled.Container>
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
                  onClick={() => copyData(loginUrl)}
                  hideLabel
                  color="primary"
                  icon="copy"
                  size="sm"
                  circle
                  ghost
                  label={intl.formatMessage(intlMessages.copyUrlTooltip)}
                />
              </p>
            </>
          )}
          <Styled.JoinTitle>
            {intl.formatMessage(intlMessages.joinByPhoneLabel)}
            <Styled.CopyButton
              key="copy-dial-in"
              onClick={() => copyData(formattedDialNum)}
              hideLabel
              color="primary"
              icon="copy"
              size="sm"
              circle
              ghost
              label={intl.formatMessage(intlMessages.copyPhoneTooltip)}
            />
          </Styled.JoinTitle>
          <p>{formattedDialNum}</p>
          <p>
            <b>
              {`${intl.formatMessage(intlMessages.phonePinLabel)}:`}
            </b>
            {` ${formattedPin} #`}
          </p>
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

  return (
    <SessionDetails
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      priority={priority}
      meetingName={currentMeeting.name ?? ''}
      loginUrl={currentMeeting.loginUrl ?? ''}
      welcomeMessage={welcomeData.user_welcomeMsgs[0]?.welcomeMsg ?? ''}
      welcomeMsgForModerators={welcomeData.user_welcomeMsgs[0]?.welcomeMsgForModerators ?? ''}
      formattedDialNum={formattedDialNum}
      formattedTelVoice={formattedTelVoice}
      anchorElement={anchorElement}
    />
  );
};

export default SessionDetailsContainer;
