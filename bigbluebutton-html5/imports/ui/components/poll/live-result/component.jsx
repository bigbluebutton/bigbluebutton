import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';
import { Session } from 'meteor/session';
import Styled from './styles';
import Service from './service';
import Settings from '/imports/ui/services/settings';

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
});

const getResponseString = (obj) => {
  const { children } = obj.props;
  if (typeof children !== 'string') {
    return getResponseString(children[1]);
  }

  return children;
};

class LiveResult extends PureComponent {
  static getDerivedStateFromProps(nextProps) {
    const {
      currentPoll, intl, pollAnswerIds, usernames, isDefaultPoll,
    } = nextProps;

    if (!currentPoll) return null;

    const {
      answers, responses, users, numResponders, pollType
    } = currentPoll;

    const defaultPoll = isDefaultPoll(pollType);

    const currentPollQuestion = (currentPoll.question) ? currentPoll.question : '';

    let userAnswers = responses
      ? [...users, ...responses.map(u => u.userId)]
      : [...users];

    userAnswers = userAnswers.map(id => usernames[id])
      .map((user) => {
        let answer = '';

        if (responses) {
          const response = responses.find(r => r.userId === user.userId);
          if (response) {
            const formattedAnswers = [];
            response.answerIds.forEach((answerId) => {
              const formattedMessageIndex = answers[answerId]?.key?.toLowerCase();
              const formattedAnswer = defaultPoll && pollAnswerIds[formattedMessageIndex]
                ? intl.formatMessage(pollAnswerIds[formattedMessageIndex])
                : answers[answerId].key;

              formattedAnswers.push(formattedAnswer);
            });
            answer = formattedAnswers.join(', ');
          }
        }

        return {
          name: user.name,
          answer,
        };
      })
      .sort(Service.sortUsers)
      .reduce((acc, user) => {
        return ([
          ...acc,
          (
            <tr key={_.uniqueId('stats-')}>
              <Styled.ResultLeft>{user.name}</Styled.ResultLeft>
              <Styled.ResultRight data-test="receivedAnswer">
                {user.answer}
              </Styled.ResultRight>
            </tr>
          ),
        ]);
      }, []);

    const pollStats = [];

    answers.reduce(caseInsensitiveReducer, []).map((obj) => {
      const formattedMessageIndex = obj?.key?.toLowerCase();
      const pct = Math.round(obj.numVotes / numResponders * 100);
      const pctFotmatted = `${Number.isNaN(pct) ? 0 : pct}%`;

      const calculatedWidth = {
        width: pctFotmatted,
      };

      return pollStats.push(
        <Styled.Main key={_.uniqueId('stats-')}>
          <Styled.Left>
            {
              defaultPoll && pollAnswerIds[formattedMessageIndex]
                ? intl.formatMessage(pollAnswerIds[formattedMessageIndex])
                : obj.key
            }
          </Styled.Left>
          <Styled.Center>
            <Styled.BarShade style={calculatedWidth} />
            <Styled.BarVal>{obj.numVotes || 0}</Styled.BarVal>
          </Styled.Center>
          <Styled.Right>
            {pctFotmatted}
          </Styled.Right>
        </Styled.Main>,
      );
    });

    return {
      userAnswers,
      pollStats,
      currentPollQuestion,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      userAnswers: null,
      pollStats: null,
      currentPollQuestion: null,
    };
  }

  render() {
    const {
      isMeteorConnected,
      intl,
      stopPoll,
      handleBackClick,
      currentPoll,
    } = this.props;

    const { userAnswers, pollStats, currentPollQuestion } = this.state;
    const { animations } = Settings.application;

    let waiting;
    let userCount = 0;
    let respondedCount = 0;

    if (userAnswers) {
      userCount = userAnswers.length;
      userAnswers.map((user) => {
        const response = getResponseString(user);
        if (response === '') return user;
        respondedCount += 1;
        return user;
      });

      waiting = respondedCount !== userAnswers.length && currentPoll;
    }

    return (
      <div>
        <Styled.Stats>
          {currentPollQuestion ? <Styled.Title>{currentPollQuestion}</Styled.Title> : null}
          <Styled.Status>
            {waiting
              ? (
                <span>
                  {`${intl.formatMessage(intlMessages.waitingLabel, {
                    0: respondedCount,
                    1: userCount,
                  })} `}
                </span>
              )
              : <span>{intl.formatMessage(intlMessages.doneLabel)}</span>}
            {waiting
              ? <Styled.ConnectingAnimation animations={animations}/> : null}
          </Styled.Status>
          {pollStats}
        </Styled.Stats>
        {currentPoll && currentPoll.answers.length >= 0
          ? (
            <Styled.ButtonsActions>
              <Styled.PublishButton
                disabled={!isMeteorConnected}
                onClick={() => {
                  Session.set('pollInitiated', false);
                  Service.publishPoll();
                  stopPoll();
                }}
                label={intl.formatMessage(intlMessages.publishLabel)}
                data-test="publishPollingLabel"
                color="primary"
              />
              <Styled.CancelButton
                disabled={!isMeteorConnected}
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
              disabled={!isMeteorConnected}
              onClick={() => {
                handleBackClick();
              }}
              label={intl.formatMessage(intlMessages.backLabel)}
              color="primary"
              data-test="restartPoll"
            />
          )
        }
        <Styled.Separator />
        { currentPoll && !currentPoll.secretPoll
          ? (
            <table>
              <tbody>
                <tr>
                  <Styled.THeading>{intl.formatMessage(intlMessages.usersTitle)}</Styled.THeading>
                  <Styled.THeading>{intl.formatMessage(intlMessages.responsesTitle)}</Styled.THeading>
                </tr>
                {userAnswers}
              </tbody>
            </table>
          ) : (
            currentPoll ? (<div>{intl.formatMessage(intlMessages.secretPollLabel)}</div>) : null
        )}
      </div>
    );
  }
}

export default injectIntl(LiveResult);

LiveResult.defaultProps = { currentPoll: null };

LiveResult.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentPoll: PropTypes.oneOfType([
    PropTypes.arrayOf(Object),
    PropTypes.shape({
      answers: PropTypes.arrayOf(PropTypes.object),
      users: PropTypes.arrayOf(PropTypes.string),
    }),
  ]),
  stopPoll: PropTypes.func.isRequired,
  handleBackClick: PropTypes.func.isRequired,
};
