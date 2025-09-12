import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { USER_LEAVE_MEETING } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import Session from '/imports/ui/services/storage/in-memory';
import logger from '/imports/startup/client/logger';

import Styled from './styles';

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

interface RecordingNotifyModalProps {
  toggleShouldNotify: () => void;
  closeModal: () => void;
  isOpen: boolean;
  priority: string;
}

const RecordingNotifyModal: React.FC<RecordingNotifyModalProps> = ({
  toggleShouldNotify,
  closeModal,
  isOpen,
  priority,
}) => {
  const [userLeaveMeeting] = useMutation(USER_LEAVE_MEETING);

  const intl = useIntl();
  const skipButtonHandle = useCallback(() => {
    logger.info({
      logCode: 'recording_started_notify_user_hit_leave',
      extraInfo: {},
    }, 'The user is reminded that recording commences. The user pressed Leave.');
    userLeaveMeeting();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Session is a global variable in Meteor
    Session.setItem('codeError', LOGOUT_CODE);
    toggleShouldNotify();
  }, []);

  const handleContinueInRecordedSession = useCallback(() => {
    logger.info({
      logCode: 'recording_started_notify_user_hit_continue',
      extraInfo: {},
    }, 'The user is reminded that recording commences. The user pressed Continue.');
    closeModal();
  }, []);

  return (
    <Styled.RecordingNotifyModal
      contentLabel={intl.formatMessage(intlMessages.title)}
      shouldShowCloseButton={false}
      title={intl.formatMessage(intlMessages.title)}
      {...{
        isOpen,
        priority,
        modalIsOpen: isOpen,
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

export default RecordingNotifyModal;
