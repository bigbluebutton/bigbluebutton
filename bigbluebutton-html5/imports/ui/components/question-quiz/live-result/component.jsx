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
    id: 'app.questionQuiz.publishLabel',
    description: 'label for the publish button',
  },
  cancelPollLabel: {
    id: 'app.poll.cancelPollLabel',
    description: 'label for cancel poll button',
  },
  backLabel: {
    id: 'app.questionQuiz.questionQuizBtn',
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
  secretQuestionQuizLabel: {
    id: 'app.questionQuiz.liveResult.secretLabel',
    description: 'label shown instead of users in quiz responses if quiz is secret',
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
      currentQuestionQuiz, intl, questionQuizAnswerIds, usernames, isDefaultQuestionQuiz,
    } = nextProps;

    if (!currentQuestionQuiz) return null;

    const {
      answers, responses, users, numResponders, questionQuizType
    } = currentQuestionQuiz;

    const defaultQuestionQuiz = isDefaultQuestionQuiz(questionQuizType);

    const currentQuestionQuizQuestion = (currentQuestionQuiz.question) ? currentQuestionQuiz.question : '';

    let userAnswers = responses
      ? [...users, ...responses.map(u => u.userId)]
      : [...users];

    userAnswers = userAnswers.map(id => usernames[id])
      .map((user) => {
        if(user){
          let answer = '';

          if (responses) {
            const response = responses.find(r => r.userId === user.userId);
            if (response) {
              const answerKeys = [];
              response.answerIds.forEach((answerId) => {
                answerKeys.push(answers[answerId].key);
              });
              answer = answerKeys.join(', ');
            }
          }
  
          return {
            name: user.name,
            answer,
          };
        }
      })
      .sort(Service.sortUsers)
      .reduce((acc, user) => {
        if(user){
          const formattedMessageIndex = user.answer.toLowerCase();
          return ([
            ...acc,
            (
              <tr key={_.uniqueId('stats-')}>
                <Styled.ResultLeft>{user.name}</Styled.ResultLeft>
                <Styled.ResultRight data-test="receivedAnswer">
                  {
                    defaultQuestionQuiz && questionQuizAnswerIds[formattedMessageIndex]
                      ? intl.formatMessage(questionQuizAnswerIds[formattedMessageIndex])
                      : user.answer
                  }
                </Styled.ResultRight>
              </tr>
            ),
          ]);
        }
      }, []);

    const questionQuizStats = [];

    answers.reduce(caseInsensitiveReducer, []).map((obj) => {
      const formattedMessageIndex = obj.key.toLowerCase();
      const pct = Math.round((obj.numVotes / numResponders )* 100);
      const pctFotmatted = `${Number.isNaN(pct) ? 0 : pct}%`;

      const calculatedWidth = {
        width: pctFotmatted,
      };
      return questionQuizStats.push(
        <Styled.Main isCorrect={obj.isCorrect} key={_.uniqueId('stats-')}>
          <Styled.Left isCorrect={obj.isCorrect}>
            {
              defaultQuestionQuiz && questionQuizAnswerIds[formattedMessageIndex]
                ? intl.formatMessage(questionQuizAnswerIds[formattedMessageIndex])
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
      questionQuizStats,
      currentQuestionQuizQuestion,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      userAnswers: null,
      questionQuizStats: null,
      currentQuestionQuizQuestion: null,
    };
  }

  render() {
    const {
      isMeteorConnected,
      intl,
      stopQuestionQuiz,
      handleBackClick,
      currentQuestionQuiz,
    } = this.props;

    const { userAnswers, questionQuizStats, currentQuestionQuizQuestion } = this.state;
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

      waiting = respondedCount !== userAnswers.length && currentQuestionQuiz;
    }

    return (
      <div>
        <Styled.Stats>
          {currentQuestionQuizQuestion ? 
          <Styled.Title>{currentQuestionQuizQuestion}</Styled.Title> : null}
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
          {questionQuizStats}
        </Styled.Stats>
        {currentQuestionQuiz && currentQuestionQuiz.answers.length >= 0
          ? (
            <Styled.ButtonsActions>
              <Styled.PublishButton
                disabled={!isMeteorConnected}
                onClick={() => {
                  Session.set('questionQuizInitiated', false);
                  Service.publishQuestionQuiz();
                  stopQuestionQuiz();
                }}
                label={intl.formatMessage(intlMessages.publishLabel)}
                data-test="publishQuestionQuizingLabel"
                color="primary"
              />
              <Styled.CancelButton
                disabled={!isMeteorConnected}
                onClick={() => {
                  Session.set('questionQuizInitiated', false);
                  Session.set('resetQuestionQuizPanel', true);
                  stopQuestionQuiz();
                }}
                label={intl.formatMessage(intlMessages.cancelPollLabel)}
                data-test="cancelQuestionQuizLabel"
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
              data-test="restartQuestionQuiz"
            />
          )
        }
        <Styled.Separator />
        { currentQuestionQuiz && !currentQuestionQuiz.secretQuestionQuiz
          ? (
            <table>
              <tbody>
                <tr>
                  <Styled.THeading>{intl.formatMessage(intlMessages.usersTitle)}
                  </Styled.THeading>
                  <Styled.THeading>{intl.formatMessage(intlMessages.responsesTitle)}
                  </Styled.THeading>
                </tr>
                {userAnswers}
              </tbody>
            </table>
          ) : (
            currentQuestionQuiz ? (
            <div>{intl.formatMessage(intlMessages.secretQuestionQuizLabel)}</div>
            ) : null
        )}
      </div>
    );
  }
}

export default injectIntl(LiveResult);

LiveResult.defaultProps = { currentQuestionQuiz: null };

LiveResult.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentQuestionQuiz: PropTypes.oneOfType([
    PropTypes.arrayOf(Object),
    PropTypes.shape({
      answers: PropTypes.arrayOf(PropTypes.object),
      users: PropTypes.arrayOf(PropTypes.string),
    }),
  ]),
  stopQuestionQuiz: PropTypes.func.isRequired,
  handleBackClick: PropTypes.func.isRequired,
};
