import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from '../styles';
import { pollTypes } from '../service';
import ResponseArea from './ResponseArea';

const intlMessages = defineMessages({
  typedResponseDesc: {
    id: 'app.poll.typedResponse.desc',
    description: '',
  },
  responseChoices: {
    id: 'app.poll.responseChoices.label',
    description: '',
  },
  pollingQuestion: {
    id: 'app.polling.pollQuestionTitle',
    description: 'polling question header',
  },
  correctAnswerSelected: {
    id: 'app.poll.quiz.correctAnswerSelected',
    description: 'Label indicating that a correct answer has been selected in a quiz',
  },
  selectCorrectAnswer: {
    id: 'app.poll.quiz.selectCorrectAnswer',
    description: 'Label prompting the user to select a correct answer in a quiz',
  },
  quizAnswerChoicesLabel: {
    id: 'app.poll.quiz.answerChoices.label',
    description: 'Label for the answer choices in a quiz',
  },
});

interface ResponseChoicesProps {
  type: string | null;
  toggleMultipleResponse: () => void;
  multipleResponse: boolean;
  optList: Array<{ key: string; val: string }>;
  handleAddOption: () => void;
  secretPoll: boolean;
  question: string | string[];
  setError: (err: string) => void;
  setIsPolling: (isPolling: boolean) => void;
  handleToggle: () => void;
  error: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, i: number) => void;
  handleRemoveOption: (i: number) => void;
  customInput: boolean;
  questionAndOptions: string[] | string;
  isQuiz: boolean;
  correctAnswer: {
    text: string;
    index: number;
  };
  setCorrectAnswer: (param: {text: string, index: number }) => void;
}

const ResponseChoices: React.FC<ResponseChoicesProps> = ({
  type,
  toggleMultipleResponse,
  multipleResponse,
  optList,
  handleAddOption,
  secretPoll,
  question,
  setError,
  setIsPolling,
  handleToggle,
  error,
  handleInputChange,
  handleRemoveOption,
  customInput,
  questionAndOptions,
  isQuiz,
  correctAnswer,
  setCorrectAnswer,
}) => {
  const intl = useIntl();
  if ((!customInput && type) || (questionAndOptions && customInput)) {
    return (
      <div data-test="responseChoices">
        {customInput && questionAndOptions && (
          <Styled.Question>
            <Styled.SectionHeading>
              {intl.formatMessage(intlMessages.pollingQuestion)}
            </Styled.SectionHeading>
            <Styled.PollParagraph>
              <span>{question}</span>
            </Styled.PollParagraph>
          </Styled.Question>
        )}
        <Styled.ResponseHeader>
          <Styled.SectionHeading>
            {
              isQuiz
                ? intl.formatMessage(intlMessages.quizAnswerChoicesLabel)
                : intl.formatMessage(intlMessages.responseChoices)
            }
          </Styled.SectionHeading>
          {isQuiz && (
            <Styled.SelectedCorrectAnswerIndicator hasCorrectAnswer={correctAnswer.index !== -1}>
              {correctAnswer.index !== -1 ? (
                <span>
                  {intl.formatMessage(intlMessages.correctAnswerSelected)}
                </span>
              ) : (
                <span>
                  {intl.formatMessage(intlMessages.selectCorrectAnswer)}
                </span>
              )}
            </Styled.SelectedCorrectAnswerIndicator>
          )}
        </Styled.ResponseHeader>
        {type === pollTypes.Response && (
          <Styled.PollParagraph>
            <span>{intl.formatMessage(intlMessages.typedResponseDesc)}</span>
          </Styled.PollParagraph>
        )}
        <ResponseArea
          error={error}
          type={type}
          toggleMultipleResponse={toggleMultipleResponse}
          multipleResponse={multipleResponse}
          optList={optList}
          handleAddOption={handleAddOption}
          secretPoll={secretPoll}
          question={question}
          setError={setError}
          setIsPolling={setIsPolling}
          handleToggle={handleToggle}
          handleInputChange={handleInputChange}
          handleRemoveOption={handleRemoveOption}
          isQuiz={isQuiz}
          correctAnswer={correctAnswer}
          setCorrectAnswer={setCorrectAnswer}
        />
      </div>
    );
  }
  return null;
};

export default ResponseChoices;
