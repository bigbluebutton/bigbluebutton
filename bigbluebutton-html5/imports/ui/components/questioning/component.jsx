import React, { Component } from 'react';
import PropTypes from 'prop-types';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { defineMessages, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import Styled from './styles';
import AudioService from '/imports/ui/components/audio/service';
import Checkbox from '/imports/ui/components/common/checkbox/component';


const intlMessages = defineMessages({
  questionQuizingTitleLabel: {
    id: 'app.questionQuiz.options.label',
  },
  questionQuizAnswerLabel: {
    id: 'app.questioning.questionQuizAnswerLabel',
  },
  questionQuizAnswerDesc: {
    id: 'app.polling.pollAnswerDesc',
  },
  questionQuizQuestionTitle: {
    id: 'app.questionQuiz.question.label',
  },
  responseIsSecret: {
    id: 'app.questioning.responseSecret',
  },
  responseNotSecret: {
    id: 'app.questioning.responseNotSecret',
  },
  submitLabel: {
    id: 'app.polling.submitLabel',
  },
  submitAriaLabel: {
    id: 'app.questioning.submitAriaLabel',
  },
  responsePlaceholder: {
    id: 'app.polling.responsePlaceholder',
  },
});

const validateInput = (i) => {
  let _input = i;
  if (/^\s/.test(_input)) _input = '';
  return _input;
};

class Questioning extends Component {
  constructor(props) {
    super(props);

    this.state = {
      typedAns: '',
      checkedAnswers: [],
    };

    this.play = this.play.bind(this);
    this.handleUpdateResponseInput = this.handleUpdateResponseInput.bind(this);
    this.renderButtonAnswers = this.renderButtonAnswers.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderCheckboxAnswers = this.renderCheckboxAnswers.bind(this);
    this.handleMessageKeyDown = this.handleMessageKeyDown.bind(this);
  }

  componentDidMount() {
    this.play();
  }

  play() {
    AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
      + Meteor.settings.public.app.basename
      + Meteor.settings.public.app.instanceId}`
      + '/resources/sounds/Poll.mp3');
  }

  handleUpdateResponseInput(e) {
    this.responseInput.value = validateInput(e.target.value);
    this.setState({ typedAns: this.responseInput.value });
  }

  handleSubmit(questionQuizId) {
    const { handleVote } = this.props;
    const { checkedAnswers } = this.state;
    handleVote(questionQuizId, checkedAnswers);
  }

  handleCheckboxChange(questionQuizId, answerId) {
    const { checkedAnswers } = this.state;
    if (checkedAnswers.includes(answerId)) {
      checkedAnswers.splice(checkedAnswers.indexOf(answerId), 1);
    } else {
      checkedAnswers.push(answerId);
    }
    checkedAnswers.sort();
    this.setState({ checkedAnswers });
  }

  handleMessageKeyDown(e) {
    const {
      questionQuiz,
      handleTypedVote,
    } = this.props;

    const {
      typedAns,
    } = this.state;

    if (e.keyCode === 13 && typedAns.length > 0) {
      handleTypedVote(questionQuiz.questionQuizId, typedAns);
    }
  }

  renderButtonAnswers() {
    const {
      isMeteorConnected,
      intl,
      questionQuiz,
      handleVote,
      handleTypedVote,
      questionQuizAnswerIds,
      questionQuizTypes,
      isDefaultQuestionQuiz,
    } = this.props;

    const {
      typedAns,
    } = this.state;

    if (!questionQuiz) return null;

    const { stackOptions, answers, question, questionQuizType } = questionQuiz;
    const defaultQuestionQuiz = isDefaultQuestionQuiz(questionQuizType);
    return (
      <div>
          {
            questionQuiz.questionQuizType !== questionQuizTypes.Response && (
              <span>
                {
                  question.length === 0 && (
                    <Styled.QuestionQuizingTitle>
                      {intl.formatMessage(intlMessages.questionQuizingTitleLabel)}
                    </Styled.QuestionQuizingTitle>
                  )
                }
                <Styled.QuestionQuizingAnswers 
                removeColumns={answers.length === 1}
                stacked={stackOptions}>
                  {answers.map((questionQuizAnswer) => {
                    const formattedMessageIndex = questionQuizAnswer?.key.toLowerCase();
                    let label = questionQuizAnswer.key;
                    if (defaultQuestionQuiz && questionQuizAnswerIds[formattedMessageIndex]) {
                      label = intl.formatMessage(questionQuizAnswerIds[formattedMessageIndex]);
                    }

                    return (
                      <Styled.QuestionQuizButtonWrapper key={questionQuizAnswer.id} >
                        <Styled.QuestionQuizingButton
                          disabled={!isMeteorConnected}
                          color="success"
                          size="md"
                          label={label}
                          key={questionQuizAnswer.key}
                          onClick={() => handleVote(questionQuiz.questionQuizId,
                          [questionQuizAnswer.id])}
                          aria-labelledby={`questionQuizAnswerLabel${questionQuizAnswer.key}`}
                          aria-describedby={`questionQuizAnswerDesc${questionQuizAnswer.key}`}
                          data-test="questionQuizAnswerOption"
                        />
                        <Styled.Hidden id={`questionQuizAnswerLabel${questionQuizAnswer.key}`}>
                          {intl.formatMessage(intlMessages.questionQuizAnswerLabel, { 0: label })}
                        </Styled.Hidden>
                        <Styled.Hidden id={`questionQuizAnswerDesc${questionQuizAnswer.key}`}>
                          {intl.formatMessage(intlMessages.questionQuizAnswerDesc, { 0: label })}
                        </Styled.Hidden>
                      </Styled.QuestionQuizButtonWrapper>
                    );
                  })}
                </Styled.QuestionQuizingAnswers>
            </span>
          )
        }
        <Styled.QuestionQuizingSecret>
          {intl.formatMessage(questionQuiz.secretQuestionQuiz ? 
          intlMessages.responseIsSecret : intlMessages.responseNotSecret)}
        </Styled.QuestionQuizingSecret>
      </div>
    );
  }

  renderCheckboxAnswers() {
    const {
      isMeteorConnected,
      intl,
      questionQuiz,
      questionQuizAnswerIds,
    } = this.props;
    const { checkedAnswers } = this.state;
    const { question } = questionQuiz;
    return (
      <div>
        {question.length === 0
          && (
          <Styled.QuestionQuizingTitle>
            {intl.formatMessage(intlMessages.questionQuizingTitleLabel)}
          </Styled.QuestionQuizingTitle>
          )}
        <Styled.MultipleResponseAnswersTable>
          {questionQuiz.answers.map((questionQuizAnswer) => {
            const formattedMessageIndex = questionQuizAnswer.key.toLowerCase();
            let label = questionQuizAnswer.key;
            if (questionQuizAnswerIds[formattedMessageIndex]) {
              label = intl.formatMessage(questionQuizAnswerIds[formattedMessageIndex]);
            }

            return (
              <Styled.CheckboxContainer
                key={questionQuizAnswer.id}
              >
                <td>
                  <Styled.QuestionQuizingCheckbox>
                    <Checkbox
                      disabled={!isMeteorConnected}
                      id={`answerInput${questionQuizAnswer.key}`}
                      onChange={() => this.handleCheckboxChange
                      (questionQuiz.questionQuizId, questionQuizAnswer.id)}
                      checked={checkedAnswers.includes(questionQuizAnswer.id)}
                      ariaLabelledBy={`questionQuizAnswerLabel${questionQuizAnswer.key}`}
                      ariaDescribedBy={`questionQuizAnswerDesc${questionQuizAnswer.key}`}
                    />
                  </Styled.QuestionQuizingCheckbox>
                </td>
                <Styled.MultipleResponseAnswersTableAnswerText>
                  <label id={`questionQuizAnswerLabel${questionQuizAnswer.key}`}>
                    {label}
                  </label>
                  <Styled.Hidden id={`questionQuizAnswerDesc${questionQuizAnswer.key}`} >
                    {intl.formatMessage(intlMessages.questionQuizAnswerDesc, { 0: label })}
                  </Styled.Hidden>
                </Styled.MultipleResponseAnswersTableAnswerText>
              </Styled.CheckboxContainer>
            );
          })}
        </Styled.MultipleResponseAnswersTable>
        <div>
          <Styled.SubmitVoteButton
            disabled={!isMeteorConnected || checkedAnswers.length === 0}
            color="primary"
            size="sm"
            label={intl.formatMessage(intlMessages.submitLabel)}
            aria-label={intl.formatMessage(intlMessages.submitAriaLabel)}
            onClick={() => this.handleSubmit(questionQuiz.questionQuizId)}
          />
        </div>
      </div>
    );
  }

  render() {
    const {
      intl,
      questionQuiz,
    } = this.props;

    if (!questionQuiz) return null;

    const { stackOptions, question } = questionQuiz;

    return (
      <Styled.Overlay>
        <Styled.QuestionQuizingContainer
          autoWidth={stackOptions}
          data-test="questionQuizingContainer"
          role="alert"
        >
          {
            question.length > 0 && (
              <Styled.QHeader>
                <Styled.QTitle>
                  {intl.formatMessage(intlMessages.questionQuizQuestionTitle)}
                </Styled.QTitle>
                <Styled.QText data-test="quizQuestion">{question}</Styled.QText>
              </Styled.QHeader>
            )
          }
          {questionQuiz.isMultipleResponse ? this.renderCheckboxAnswers() :
          this.renderButtonAnswers()}
        </Styled.QuestionQuizingContainer>
      </Styled.Overlay>
    );
  }
}

export default injectIntl(injectWbResizeEvent(Questioning));

Questioning.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleVote: PropTypes.func.isRequired,
  handleTypedVote: PropTypes.func.isRequired,
  questionQuiz: PropTypes.shape({
    questionQuizId: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      key: PropTypes.string,
    }).isRequired).isRequired,
  }).isRequired,
};
