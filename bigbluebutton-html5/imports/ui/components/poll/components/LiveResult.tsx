import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis,
} from 'recharts';
import Styled from '../styles';
import { ResponseInfo, UserInfo } from '../queries';
import logger from '/imports/startup/client/logger';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { layoutSelect, layoutSelectOutput } from '../../layout/context';
import useCurrentPoll from '../useCurrentPoll';
import CustomizedAxisTick from './CustomizedAxisTick';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import Tooltip from '../../common/tooltip/component';
import { Layout, Output } from '../../layout/layoutTypes';

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.poll.liveResult.usersTitle',
    description: 'heading label for poll users',
  },
  responsesTitle: {
    id: 'app.poll.liveResult.responsesTitle',
    description: 'heading label for poll responses',
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
  true: {
    id: 'app.poll.t',
    description: 'Poll true option value',
  },
  false: {
    id: 'app.poll.f',
    description: 'Poll false option value',
  },
  yes: {
    id: 'app.poll.y',
    description: 'Poll yes option value',
  },
  no: {
    id: 'app.poll.n',
    description: 'Poll no option value',
  },
  abstention: {
    id: 'app.poll.abstention',
    description: 'Poll Abstention option value',
  },
  correctAnswerTitle: {
    id: 'app.poll.quiz.liveResult.title.correct',
    description: 'Title for correct answer in quiz poll live result',
  },
  correctOption: {
    id: 'app.poll.quiz.options.correct',
    description: 'Label for correct answer option in quiz poll',
  },
  incorrectOption: {
    id: 'app.poll.quiz.options.incorrect',
    description: 'Label for incorrect answer option in quiz poll',
  },
});

interface LiveResultProps {
  questionText: string;
  responses: Array<ResponseInfo>;
  usersCount: number;
  numberOfAnswerCount: number;
  animations: boolean;
  users: Array<UserInfo>;
  isSecret: boolean;
  isQuiz: boolean;
  type: string;
}

const LiveResult: React.FC<LiveResultProps> = ({
  questionText,
  responses,
  usersCount,
  numberOfAnswerCount,
  animations,
  users,
  isSecret,
  isQuiz,
  type,
}) => {
  const intl = useIntl();
  const sidebarContent: Output['sidebarContent'] = layoutSelectOutput((i: Output) => i.sidebarContent);
  const fontSize: Layout['fontSize'] = layoutSelect((i: Layout) => i.fontSize);

  const translatedResponses = responses.map((response) => {
    const translationKey = intlMessages[response.optionDesc.toLowerCase() as keyof typeof intlMessages];
    const optionDesc = translationKey ? intl.formatMessage(translationKey) : response.optionDesc;
    return {
      ...response,
      optionDesc,
    };
  });

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
                  current: numberOfAnswerCount,
                  total: usersCount,
                })} `}
              </span>
            )
            : <span>{intl.formatMessage(intlMessages.doneLabel)}</span>}
          {usersCount !== numberOfAnswerCount
            ? <Styled.ConnectingAnimation animations={animations} /> : null}
        </Styled.Status>
        <ResponsiveContainer width="90%" height={translatedResponses.length * 50}>
          <BarChart
            data={translatedResponses}
            layout="vertical"
          >
            <XAxis type="number" allowDecimals={false} />
            <YAxis width={type === 'R-' ? (sidebarContent.width / 3) : 70} fontSize={fontSize} type="category" dataKey="optionDesc" tick={<CustomizedAxisTick />} />
            <Bar dataKey="optionResponsesCount" fill="#0C57A7" />
          </BarChart>
        </ResponsiveContainer>
      </Styled.Stats>
      <Styled.Separator />
      {
        !isSecret
          ? (
            <Styled.LiveResultTable>
              <tbody>
                <tr>
                  <Styled.THeading>{intl.formatMessage(intlMessages.usersTitle)}</Styled.THeading>
                  <Styled.THeading>{intl.formatMessage(intlMessages.responsesTitle)}</Styled.THeading>
                  {
                    isQuiz ? (
                      <Styled.THeading>{intl.formatMessage(intlMessages.correctAnswerTitle)}</Styled.THeading>
                    ) : null
                  }
                </tr>
                {
                  users.map((user) => (
                    <tr key={user.user.userId}>
                      <Styled.ResultLeft>{user.user.name}</Styled.ResultLeft>
                      <Styled.ResultRight data-test="userVoteLiveResult">
                        {
                          user.optionDescIds.map((optDesc) => {
                            const translationKey = intlMessages[optDesc.toLowerCase() as keyof typeof intlMessages];
                            return translationKey ? intl.formatMessage(translationKey) : optDesc;
                          }).join()
                        }
                      </Styled.ResultRight>
                      {
                        isQuiz ? user.optionDescIds.length > 0 && (
                          <Styled.ResultRight>
                            {user.optionDescIds.filter((opt) => {
                              const response = responses.find((r) => r.optionDesc === opt);
                              return response && response.correctOption;
                            }).length > 0
                              ? (
                                <Tooltip title={intl.formatMessage(intlMessages.correctOption)}>
                                  <span aria-label={intl.formatMessage(intlMessages.correctOption)}>✅</span>
                                </Tooltip>
                              )
                              : (
                                <Tooltip title={intl.formatMessage(intlMessages.incorrectOption)}>
                                  <span aria-label={intl.formatMessage(intlMessages.incorrectOption)}>❌</span>
                                </Tooltip>
                              )}
                          </Styled.ResultRight>
                        ) : null
                      }
                    </tr>
                  ))
                }
              </tbody>
            </Styled.LiveResultTable>
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
    currentPoll,
    loading: currentPollLoading,
    error: currentPollDataError,
    numberOfAnswerCount,
    usersCount,
  } = useCurrentPoll();

  // This is the single place the poll subscription's failure is reported, so a failure is
  // logged once no matter how many components are reading the poll.
  if (currentPollDataError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: currentPollDataError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  if (currentPollLoading || !currentPoll) return null;

  const Settings = getSettingsSingletonInstance();
  // @ts-ignore - JS code
  const { animations } = Settings.application;
  const {
    questionText,
    responses,
    users,
    type,
    secret: isSecret,
    quiz: isQuiz,
  } = currentPoll;

  return (
    <LiveResult
      questionText={questionText}
      responses={responses}
      isSecret={isSecret}
      usersCount={usersCount}
      numberOfAnswerCount={numberOfAnswerCount}
      animations={animations}
      users={users}
      isQuiz={isQuiz}
      type={type}
    />
  );
};

export default LiveResultContainer;
