import { useMutation, useSubscription } from '@apollo/client';
import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Session } from 'meteor/session';
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis,
} from 'recharts';
import Styled from '../styles';
import { ResponseInfo, UserInfo, getCurrentPollData, getCurrentPollDataResponse } from '../queries';
import logger from '/imports/startup/client/logger';
import Settings from '/imports/ui/services/settings';
import { POLL_CANCEL, POLL_PUBLISH_RESULT } from '../mutation';

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.poll.liveResult.usersTitle',
    description: 'heading label for poll users',
  },
  responsesTitle: {
    id: 'app.poll.liveResult.responsesTitle',
    description: 'heading label for poll responses',
  },
  publishLabel: {
    id: 'app.poll.publishLabel',
    description: 'label for the publish button',
  },
  cancelPollLabel: {
    id: 'app.poll.cancelPollLabel',
    description: 'label for cancel poll button',
  },
  backLabel: {
    id: 'app.poll.backLabel',
    description: 'label for the return to poll options button',
  },
  doneLabel: {
    id: 'app.createBreakoutRoom.doneLabel',
    description: 'label shown when all users have responded',
  },
  waitingLabel: {
    id: 'app.poll.waitingLabel',
    description: 'label shown while waiting for responses',
  },
  secretPollLabel: {
    id: 'app.poll.liveResult.secretLabel',
    description: 'label shown instead of users in poll responses if poll is secret',
  },
  activePollInstruction: {
    id: 'app.poll.activePollInstruction',
    description: 'instructions displayed when a poll is active',
  },
});

interface LiveResultProps {
  questionText: string;
  responses: Array<ResponseInfo>;
  isSecret: boolean;
  usersCount: number;
  numberOfAnswerCount: number;
  animations: boolean;
  pollId: string;
  users: Array<UserInfo>;
}

const LiveResult: React.FC<LiveResultProps> = ({
  questionText,
  responses,
  isSecret,
  usersCount,
  numberOfAnswerCount,
  animations,
  pollId,
  users,
}) => {
  const intl = useIntl();
  const [pollPublishResult] = useMutation(POLL_PUBLISH_RESULT);
  const [stopPoll] = useMutation(POLL_CANCEL);

  const publishPoll = useCallback((pId: string) => {
    pollPublishResult({
      variables: {
        pollId: pId,
      },
    });
  }, []);

  return (
    <div>
      <Styled.Instructions>
        {intl.formatMessage(intlMessages.activePollInstruction)}
      </Styled.Instructions>
      <Styled.Stats>
        {questionText ? <Styled.Title data-test="currentPollQuestion">{questionText}</Styled.Title> : null}
        <Styled.Status>
          {usersCount !== numberOfAnswerCount
            ? (
              <span>
                {`${intl.formatMessage(intlMessages.waitingLabel, {
                  0: numberOfAnswerCount,
                  1: usersCount,
                })} `}
              </span>
            )
            : <span>{intl.formatMessage(intlMessages.doneLabel)}</span>}
          {usersCount !== numberOfAnswerCount
            ? <Styled.ConnectingAnimation animations={animations} /> : null}
        </Styled.Status>
        <ResponsiveContainer width="90%" height={250}>
          <BarChart
            data={responses}
            layout="vertical"
          >
            <XAxis type="number" />
            <YAxis width={70} type="category" dataKey="optionDesc" />
            <Bar dataKey="optionResponsesCount" fill="#0C57A7" />
          </BarChart>
        </ResponsiveContainer>
      </Styled.Stats>
      {numberOfAnswerCount >= 0
        ? (
          <Styled.ButtonsActions>
            <Styled.PublishButton
              onClick={() => {
                Session.set('pollInitiated', false);
                publishPoll(pollId);
                stopPoll();
              }}
              label={intl.formatMessage(intlMessages.publishLabel)}
              data-test="publishPollingLabel"
              color="primary"
            />
            <Styled.CancelButton
              onClick={() => {
                Session.set('pollInitiated', false);
                Session.set('resetPollPanel', true);
                stopPoll();
              }}
              label={intl.formatMessage(intlMessages.cancelPollLabel)}
              data-test="cancelPollLabel"
            />
          </Styled.ButtonsActions>
        ) : (
          <Styled.LiveResultButton
            onClick={() => {
              stopPoll();
            }}
            label={intl.formatMessage(intlMessages.backLabel)}
            color="primary"
            data-test="restartPoll"
          />
        )}
      <Styled.Separator />
      {
        !isSecret
          ? (
            <table>
              <tbody>
                <tr>
                  <Styled.THeading>{intl.formatMessage(intlMessages.usersTitle)}</Styled.THeading>
                  <Styled.THeading>{intl.formatMessage(intlMessages.responsesTitle)}</Styled.THeading>
                </tr>
                {
                  users.map((user) => (
                    <tr key={user.user.userId}>
                      <Styled.ResultLeft>{user.user.name}</Styled.ResultLeft>
                      <Styled.ResultRight>{user.optionDescIds.join()}</Styled.ResultRight>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          )
          : (
            <div>
              {intl.formatMessage(intlMessages.secretPollLabel)}
            </div>
          )
      }
    </div>
  );
};

const LiveResultContainer: React.FC = () => {
  const {
    data: currentPollData,
    loading: currentPollLoading,
    error: currentPollDataError,
  } = useSubscription<getCurrentPollDataResponse>(getCurrentPollData);

  if (currentPollLoading || !currentPollData) {
    return null;
  }

  if (currentPollDataError) {
    logger.error(currentPollDataError);
    return (
      <div>
        {JSON.stringify(currentPollDataError)}
      </div>
    );
  }

  if (!currentPollData.poll.length) return null;
  // @ts-ignore - JS code
  const { animations } = Settings.application;
  const currentPoll = currentPollData.poll[0];
  const isSecret = currentPoll.secret;
  const {
    multipleResponses,
    questionText,
    responses,
    secret,
    published,
    pollId,
    users,
  } = currentPoll;

  const numberOfAnswerCount = currentPoll.responses_aggregate.aggregate.sum.optionResponsesCount;
  const numberOfUsersCount = currentPoll.users_aggregate.aggregate.count;

  return (
    <LiveResult
      multipleResponses={multipleResponses}
      questionText={questionText}
      responses={responses}
      secret={secret}
      published={published}
      isSecret={isSecret}
      usersCount={numberOfUsersCount}
      numberOfAnswerCount={numberOfAnswerCount ?? 0}
      animations={animations}
      pollId={pollId}
      users={users}
    />
  );
};

export default LiveResultContainer;
