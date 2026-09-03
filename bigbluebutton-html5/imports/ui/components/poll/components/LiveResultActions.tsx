import React, { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react/Button';
import Styled from '../styles';
import { POLL_CANCEL, POLL_PUBLISH_RESULT } from '../mutations';
import { layoutDispatch } from '../../layout/context';
import { ACTIONS, PANELS } from '../../layout/enums';
import useCurrentPoll from '../useCurrentPoll';
import Session from '/imports/ui/services/storage/in-memory';

const intlMessages = defineMessages({
  publishLabel: {
    id: 'app.poll.publishLabel',
    description: 'label for the publish button',
  },
  cancelPollLabel: {
    id: 'app.poll.cancelPollLabel',
    description: 'label for cancel poll button',
  },
  showCorrectAnswerLabel: {
    id: 'app.poll.quiz.showCorrectAnswer',
    description: 'Label for checkbox to show correct answer in quiz poll',
  },
});

/**
 * The actions of a running poll, rendered in the panel footer rather than inline with
 * the results, so they stay reachable while the responses table scrolls. It reads the
 * running poll from the same subscription as LiveResult - the subscription store
 * deduplicates it, so the two components share a single stream.
 */
const LiveResultActions: React.FC = () => {
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

  const intl = useIntl();
  const [pollPublishResult] = useMutation(POLL_PUBLISH_RESULT);
  const [stopPoll] = useMutation(POLL_CANCEL);
  const [shouldShowCorrectAnswer, setShouldShowCorrectAnswers] = useState(true);
  const layoutContextDispatch = layoutDispatch();

  const { currentPoll, numberOfAnswerCount } = useCurrentPoll();

  const publishPoll = useCallback((pId: string, showAnswer: boolean) => {
    pollPublishResult({
      variables: {
        pollId: pId,
        showAnswer,
      },
    });
  }, []);

  if (!currentPoll) return null;

  const { pollId, quiz: isQuiz } = currentPoll;

  return (
    <>
      {isQuiz && (
        <Styled.ShowCorrectAnswerLabel
          htmlFor="showCorrectAnswerCheckbox"
          data-test="showCorrectAnswerCheckbox"
        >
          <input
            id="showCorrectAnswerCheckbox"
            type="checkbox"
            checked={shouldShowCorrectAnswer}
            onChange={(e) => {
              setShouldShowCorrectAnswers(e.target.checked);
            }}
          />
          {intl.formatMessage(intlMessages.showCorrectAnswerLabel)}
        </Styled.ShowCorrectAnswerLabel>
      )}
      <Styled.LiveResultActionsRow>
        <BBButton
          dataTest="publishPollingLabel"
          label={intl.formatMessage(intlMessages.publishLabel)}
          variant="primary"
          color="default"
          disabled={numberOfAnswerCount <= 0}
          onClick={() => {
            Session.setItem('pollInitiated', false);
            publishPoll(pollId, shouldShowCorrectAnswer);
            stopPoll();
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.CHAT,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_ID_CHAT_OPEN,
              value: PUBLIC_GROUP_CHAT_KEY,
            });
          }}
        />
        <BBButton
          dataTest="cancelPollLabel"
          label={intl.formatMessage(intlMessages.cancelPollLabel)}
          variant="tertiary"
          color="default"
          onClick={() => {
            Session.setItem('pollInitiated', false);
            Session.setItem('resetPollPanel', true);
            stopPoll();
          }}
        />
      </Styled.LiveResultActionsRow>
    </>
  );
};

export default LiveResultActions;
