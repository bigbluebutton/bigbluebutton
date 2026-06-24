import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import ReactDOM from 'react-dom';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import Checkbox from '/imports/ui/components/common/checkbox/component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  POLL_SUBMIT_TYPED_VOTE,
  POLL_SUBMIT_VOTE,
} from '/imports/ui/components/poll/mutations';
import {
  hasPendingPoll,
  HasPendingPollResponse,
} from './queries';
import Service from './service';
import Styled from './styles';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import { useIsPollingEnabled } from '../../services/features';
import logger from '/imports/startup/client/logger';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import useMeeting from '../../core/hooks/useMeeting';

const intlMessages = defineMessages({
  pollingTitleLabel: {
    id: 'app.polling.pollingTitle',
  },
  quizTitleLabel: {
    id: 'app.poll.quiz.options.title',
  },
  pollAnswerLabel: {
    id: 'app.polling.pollAnswerLabel',
  },
  pollAnswerDesc: {
    id: 'app.polling.pollAnswerDesc',
  },
  pollQuestionTitle: {
    id: 'app.polling.pollQuestionTitle',
  },
  responseIsSecret: {
    id: 'app.polling.responseSecret',
  },
  responseNotSecret: {
    id: 'app.polling.responseNotSecret',
  },
  quizResponseNotSecret: {
    id: 'app.poll.quiz.options.responseNotSecret',
  },
  submitLabel: {
    id: 'app.polling.submitLabel',
  },
  submitAriaLabel: {
    id: 'app.polling.submitAriaLabel',
  },
  responsePlaceholder: {
    id: 'app.polling.responsePlaceholder',
  },
});

const validateInput = (i: string) => {
  let input = i;
  if (/^\s/.test(input)) input = '';
  return input;
};

interface PollingGraphqlProps {
  handleTypedVote: (pollId: string, answer: string) => void;
  handleVote: (pollId: string, answerIds: Array<number>) => void;
  pollAnswerIds: Record<string, { id: string; description: string }>;
  pollTypes: Record<string, string>;
  isDefaultPoll: (pollType: string) => boolean;
  playAlert: () => void;
  poll: {
    quiz: boolean;
    pollId: string;
    multipleResponses: boolean;
    type: string;
    stackOptions: boolean;
    questionText: string;
    secret: boolean;
    options: Array<{
      optionDesc: string;
      optionId: number;
      pollId: string;
    }>;
  };
}

const PollingGraphql: React.FC<PollingGraphqlProps> = (props) => {
  const {
    handleTypedVote,
    handleVote,
    poll,
    pollAnswerIds,
    pollTypes,
    isDefaultPoll,
    playAlert,
  } = props;

  const [typedAns, setTypedAns] = useState('');
  const [checkedAnswers, setCheckedAnswers] = useState<Array<number>>([]);
  const intl = useIntl();
  const responseInput = useRef<HTMLInputElement>(null);
  const pollingContainer = useRef<HTMLElement>(null);

  useEffect(() => {
    playAlert();
    if (pollingContainer.current) {
      pollingContainer.current.focus();
    }
  }, []);

  const handleUpdateResponseInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (responseInput.current) {
      responseInput.current.value = validateInput(e.target.value);
      setTypedAns(responseInput.current.value);
    }
  };

  const handleSubmit = (pollId: string) => {
    handleVote(pollId, checkedAnswers);
  };

  const handleCheckboxChange = (answerId: number) => {
    if (checkedAnswers.includes(answerId)) {
      checkedAnswers.splice(checkedAnswers.indexOf(answerId), 1);
    } else {
      checkedAnswers.push(answerId);
    }
    checkedAnswers.sort();
    setCheckedAnswers([...checkedAnswers]);
  };

  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13 && typedAns.length > 0) {
      handleTypedVote(poll.pollId, typedAns);
    }
  };

  const renderButtonAnswers = () => {
    const {
      stackOptions,
      options,
      questionText,
      type,
    } = poll;
    const defaultPoll = isDefaultPoll(type);

    const MAX_INPUT_CHARS = window.meetingClientSettings.public.poll.maxTypedAnswerLength;

    return (
      <div>
        {poll.type !== pollTypes.Response && (
          <span>
            {questionText.length === 0 && (
              <Styled.PollingTitle>
                {
                  poll.quiz
                    ? intl.formatMessage(intlMessages.quizTitleLabel)
                    : intl.formatMessage(intlMessages.pollingTitleLabel)
                }
              </Styled.PollingTitle>
            )}
            <Styled.PollingAnswers
              removeColumns={options.length === 1}
              stacked={stackOptions}
            >
              {options.map((option) => {
                const formattedMessageIndex = option.optionDesc.toLowerCase();
                let label = option.optionDesc;
                if (
                  (defaultPoll || type.includes('CUSTOM'))
                  && pollAnswerIds[formattedMessageIndex]
                ) {
                  label = intl.formatMessage(
                    pollAnswerIds[formattedMessageIndex],
                  );
                }

                return (
                  <Styled.PollButtonWrapper key={option.optionId}>
                    <Styled.PollingButton
                      color="primary"
                      size="md"
                      label={label}
                      key={option.optionDesc}
                      onClick={() => handleVote(poll.pollId, [option.optionId])}
                      aria-labelledby={`pollAnswerLabel${option.optionDesc}`}
                      aria-describedby={`pollAnswerDesc${option.optionDesc}`}
                      data-test="pollAnswerOption"
                    />
                    <Styled.Hidden id={`pollAnswerLabel${option.optionDesc}`}>
                      {intl.formatMessage(intlMessages.pollAnswerLabel, {
                        option: label,
                      })}
                    </Styled.Hidden>
                    <Styled.Hidden id={`pollAnswerDesc${option.optionDesc}`}>
                      {intl.formatMessage(intlMessages.pollAnswerDesc, {
                        option: label,
                      })}
                    </Styled.Hidden>
                  </Styled.PollButtonWrapper>
                );
              })}
            </Styled.PollingAnswers>
          </span>
        )}
        {poll.type === pollTypes.Response && (
          <Styled.TypedResponseWrapper>
            <Styled.TypedResponseInput
              data-test="pollAnswerOption"
              onChange={(e) => {
                handleUpdateResponseInput(e);
              }}
              onKeyDown={(e) => {
                handleMessageKeyDown(e);
              }}
              type="text"
              placeholder={intl.formatMessage(intlMessages.responsePlaceholder)}
              maxLength={MAX_INPUT_CHARS}
              ref={responseInput}
              onPaste={(e) => {
                e.stopPropagation();
              }}
              onCut={(e) => {
                e.stopPropagation();
              }}
              onCopy={(e) => {
                e.stopPropagation();
              }}
            />
            <Styled.SubmitVoteButton
              data-test="submitAnswer"
              disabled={typedAns.length === 0}
              color="primary"
              size="sm"
              label={intl.formatMessage(intlMessages.submitLabel)}
              aria-label={intl.formatMessage(intlMessages.submitAriaLabel)}
              onClick={() => {
                handleTypedVote(poll.pollId, typedAns);
              }}
            />
          </Styled.TypedResponseWrapper>
        )}
        <Styled.PollingSecret>
          {intl.formatMessage(
            poll.secret
              ? intlMessages.responseIsSecret
              : (poll.quiz && intlMessages.quizResponseNotSecret) || intlMessages.responseNotSecret,
          )}
        </Styled.PollingSecret>
      </div>
    );
  };

  const renderCheckboxAnswers = () => {
    return (
      <div>
        {poll.questionText.length === 0 && (
          <Styled.PollingTitle>
            {
              poll.quiz
                ? intl.formatMessage(intlMessages.quizTitleLabel)
                : intl.formatMessage(intlMessages.pollingTitleLabel)
            }
          </Styled.PollingTitle>
        )}
        <Styled.MultipleResponseAnswersTable>
          {poll.options.map((option) => {
            const formattedMessageIndex = option.optionDesc.toLowerCase();
            let label = option.optionDesc;
            if (pollAnswerIds[formattedMessageIndex]) {
              label = intl.formatMessage(pollAnswerIds[formattedMessageIndex]);
            }

            return (
              <Styled.CheckboxContainer key={option.optionId}>
                {/* eslint-disable-next-line */}
                <td>
                  <Styled.PollingCheckbox data-test="optionsAnswers">
                    <Checkbox
                      id={`answerInput${option.optionDesc}`}
                      onChange={() => handleCheckboxChange(option.optionId)}
                      checked={checkedAnswers.includes(option.optionId)}
                      ariaLabelledBy={`pollAnswerLabel${option.optionDesc}`}
                      ariaDescribedBy={`pollAnswerDesc${option.optionDesc}`}
                    />
                  </Styled.PollingCheckbox>
                </td>
                <Styled.MultipleResponseAnswersTableAnswerText>
                  <label
                    id={`pollAnswerLabel${option.optionDesc}`}
                    htmlFor={`answerInput${option.optionDesc}`}
                  >
                    {label}
                  </label>
                  <Styled.Hidden id={`pollAnswerDesc${option.optionDesc}`}>
                    {intl.formatMessage(intlMessages.pollAnswerDesc, {
                      option: label,
                    })}
                  </Styled.Hidden>
                </Styled.MultipleResponseAnswersTableAnswerText>
              </Styled.CheckboxContainer>
            );
          })}
        </Styled.MultipleResponseAnswersTable>
        <div>
          <Styled.SubmitVoteButton
            disabled={checkedAnswers.length === 0}
            color="primary"
            size="sm"
            label={intl.formatMessage(intlMessages.submitLabel)}
            aria-label={intl.formatMessage(intlMessages.submitAriaLabel)}
            onClick={() => handleSubmit(poll.pollId)}
            data-test="submitAnswersMultiple"
          />
        </div>
      </div>
    );
  };

  return ReactDOM.createPortal(
    <Styled.Overlay>
      <Styled.PollingContainer
        autoWidth={poll.stackOptions}
        data-test="pollingContainer"
        role="complementary"
        ref={pollingContainer}
        tabIndex={-1}
      >
        {poll.questionText.length > 0 && (
          <Styled.QHeader>
            <Styled.QTitle>
              {
                poll.quiz
                  ? intl.formatMessage(intlMessages.quizTitleLabel)
                  : intl.formatMessage(intlMessages.pollQuestionTitle)
              }
            </Styled.QTitle>
            <Styled.QText data-test="pollQuestion">
              {poll.questionText}
            </Styled.QText>
          </Styled.QHeader>
        )}
        {poll.multipleResponses
          ? renderCheckboxAnswers()
          : renderButtonAnswers()}
      </Styled.PollingContainer>
    </Styled.Overlay>,
    document.getElementById('polling-container') || document.body,
  );
};

const PollingGraphqlContainer: React.FC = () => {
  const { data: currentUserData } = useCurrentUser((u) => ({
    userId: u.userId,
    presenter: u.presenter,
  }));

  const {
    data: meeting,
    loading: meetingLoading,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const { data: hasPendingPollData, error, loading } = useDeduplicatedSubscription<HasPendingPollResponse>(
    hasPendingPoll,
    {
      variables: { userId: currentUserData?.userId },
      skip: !currentUserData || meetingLoading || !meeting?.componentsFlags?.hasPoll,
    },
  );
  const [pollSubmitUserTypedVote] = useMutation(POLL_SUBMIT_TYPED_VOTE);
  const [pollSubmitUserVote] = useMutation(POLL_SUBMIT_VOTE);
  const isPollingEnabled = useIsPollingEnabled();

  const meetingData = hasPendingPollData && hasPendingPollData.meeting[0];
  const pollData = meetingData && meetingData.polls[0];
  const userData = pollData && pollData.users[0];
  const pollExists = !!userData;
  const showPolling = pollExists && !currentUserData?.presenter && isPollingEnabled;
  const stackOptions = useMemo(
    () => !!pollData && Service.shouldStackOptions(pollData.options.map((o) => o.optionDesc)),
    [pollData],
  );

  const handleTypedVote = (pollId: string, answer: string) => {
    pollSubmitUserTypedVote({
      variables: {
        pollId,
        answer,
      },
    });
  };

  const handleVote = (pollId: string, answerIds: Array<number>) => {
    pollSubmitUserVote({
      variables: {
        pollId,
        answerIds,
      },
    });
  };

  if (!showPolling || error || loading) return null;

  if (error) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  return (
    <PollingGraphql
      handleTypedVote={handleTypedVote}
      handleVote={handleVote}
      poll={{
        ...pollData,
        stackOptions,
      }}
      pollAnswerIds={Service.pollAnswerIds}
      isDefaultPoll={Service.isDefaultPoll}
      pollTypes={Service.pollTypes}
      playAlert={Service.playAlert}
    />
  );
};

export default PollingGraphqlContainer;
