import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { makeCall } from '/imports/ui/services/api';
import Styled from './styles';
import logger from '/imports/startup/client/logger';

const intlMessages = defineMessages({
  title: {
    id: 'app.recording.notify.title',
    description: 'Title Modal Con sent',
  },
  description: {
    id: 'app.recording.notify.description',
    description: 'Question for accept or not meeting be recorded',
  },
  continue: {
    id: 'app.recording.notify.continue',
    description: 'Button accept',
  },
  leave: {
    id: 'app.recording.notify.leave',
    description: 'Button leave',
  },
  continueAriaLabel: {
    id: 'app.recording.notify.continueLabel',
    description: 'provides better context for yes btn label',
  },
  leaveAriaLabel: {
    id: 'app.recording.notify.leaveLabel',
    description: 'provides better context for no btn label',
  },

});

const LOGOUT_CODE = '680';

const RecordingNotifyModal = (props) => {
  const { intl, toggleShouldNotify, closeModal, isOpen, priority, } = props;

  function skipButtonHandle() {
    logger.info({
      logCode: 'recording_started_notify_user_hit_leave',
      extraInfo: {},
    }, 'The user is reminded that recording commences. The user pressed Leave.');
    makeCall('userLeftMeeting');
    Session.set('codeError', LOGOUT_CODE);
    toggleShouldNotify();
  }

  function handleContinueInRecordedSession() {
    logger.info({
      logCode: 'recording_started_notify_user_hit_continue',
      extraInfo: {},
    }, 'The user is reminded that recording commences. The user pressed Continue.');
    closeModal();
  }

  return (
    <Styled.RecordingNotifyModal
      contentLabel={intl.formatMessage(intlMessages.title)}
      shouldShowCloseButton={false}
      title={intl.formatMessage(intlMessages.title)}
      {...{
        isOpen,
        priority,
      }}
    >
      <Styled.Container>
        <Styled.Description>
          {intl.formatMessage(intlMessages.description)}
        </Styled.Description>
        <Styled.Footer>
          <Styled.NotifyButton
            color="primary"
            label={intl.formatMessage(intlMessages.continue)}
            onClick={handleContinueInRecordedSession}
            aria-label={intl.formatMessage(intlMessages.continueAriaLabel)}
          />
          <Styled.NotifyButton
            label={intl.formatMessage(intlMessages.leave)}
            onClick={skipButtonHandle}
            aria-label={intl.formatMessage(intlMessages.leaveAriaLabel)}
          />
        </Styled.Footer>
      </Styled.Container>
    </Styled.RecordingNotifyModal>
  );
};

export default injectIntl(RecordingNotifyModal);
