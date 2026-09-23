import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { USER_LEAVE_MEETING } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
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
  notifyRecordingAppend: string;
}

const RecordingNotifyModal: React.FC<RecordingNotifyModalProps> = ({
  toggleShouldNotify,
  closeModal,
  isOpen,
  priority,
  notifyRecordingAppend,
}) => {
  const [userLeaveMeeting] = useMutation(USER_LEAVE_MEETING);
  const hasRecordingAppend = notifyRecordingAppend.trim().length > 0;

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
      data-test="recordingNotifyModal"
      shouldShowCloseButton={false}
      title={intl.formatMessage(intlMessages.title)}
      {...{
        isOpen,
        priority,
        modalIsOpen: isOpen,
      }}
    >
      <Styled.Container>
        <Styled.Description data-test="recordingNotifyDescription">
          {intl.formatMessage(intlMessages.description)}
          {hasRecordingAppend ? (
            <Styled.AppendDescription data-test="recordingNotifyAppend">
              {notifyRecordingAppend}
            </Styled.AppendDescription>
          ) : null}
        </Styled.Description>
        <Styled.Footer>
          <Styled.ScreenreaderLabel id="recordingNotifyContinueLabel">
            {intl.formatMessage(intlMessages.continueAriaLabel)}
          </Styled.ScreenreaderLabel>
          <Styled.ScreenreaderLabel id="recordingNotifyLeaveLabel">
            {intl.formatMessage(intlMessages.leaveAriaLabel)}
          </Styled.ScreenreaderLabel>
          <BBButton
            variant="primary"
            dataTest="recordingNotifyContinue"
            label={intl.formatMessage(intlMessages.continue)}
            onClick={handleContinueInRecordedSession}
            ariaLabelledBy="recordingNotifyContinueLabel"
          />
          <BBButton
            variant="secondary"
            dataTest="recordingNotifyLeave"
            label={intl.formatMessage(intlMessages.leave)}
            onClick={skipButtonHandle}
            ariaLabelledBy="recordingNotifyLeaveLabel"
          />
        </Styled.Footer>
      </Styled.Container>
    </Styled.RecordingNotifyModal>
  );
};

export default RecordingNotifyModal;
