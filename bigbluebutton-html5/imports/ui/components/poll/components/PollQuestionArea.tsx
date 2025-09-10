import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import DraggableTextArea from './DragAndDrop';
import { pollTypes } from '../service';
import Styled from '../styles';

const QUESTION_MAX_INPUT_CHARS = 1200;

const intlMessages = defineMessages({
  questionAndOptionsPlaceholder: {
    id: 'app.poll.questionAndoptions.label',
    description: 'poll input questions and options label',
  },
  questionLabel: {
    id: 'app.poll.question.label',
    description: '',
  },
  optionalQuestionLabel: {
    id: 'app.poll.optionalQuestion.label',
    description: '',
  },
});

interface PollQuestionAreaProps {
  customInput: boolean;
  optList: Array<{ val: string }>;
  warning: string | null;
  type: string | null;
  error: string | null;
  questionAndOptions: string | string[];
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setIsPasting: (isPasting: boolean) => void;
  handlePollLetterOptions: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  question: string | string[];
}

const PollQuestionArea: React.FC<PollQuestionAreaProps> = ({
  customInput,
  optList,
  warning,
  error,
  type,
  questionAndOptions,
  handleTextareaChange,
  setIsPasting,
  handlePollLetterOptions,
  textareaRef,
  question,
}) => {
  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const MAX_INPUT_CHARS = POLL_SETTINGS.maxTypedAnswerLength;
  const intl = useIntl();
  const hasOptionError = (customInput && optList.length === 0 && error);
  const hasWarning = (customInput && warning);
  const hasQuestionError = (type === pollTypes.Response
    && questionAndOptions.length === 0 && error);
  const questionsAndOptionsPlaceholder = intlMessages.questionAndOptionsPlaceholder;
  const questionPlaceholder = (type === pollTypes.Response)
    ? intlMessages.questionLabel
    : intlMessages.optionalQuestionLabel;
  return (
    <Styled.PollQuestionAreaWrapper>
      <Styled.PollQuestionArea
        hasError={hasQuestionError || hasOptionError}
        data-test="pollQuestionArea"
        value={customInput ? questionAndOptions : question}
        onChange={(e) => handleTextareaChange(e)}
        onPaste={(e) => { e.stopPropagation(); setIsPasting(true); }}
        onCut={(e) => { e.stopPropagation(); }}
        onCopy={(e) => { e.stopPropagation(); }}
        onKeyPress={(event) => {
          if (event.key === 'Enter' && customInput) {
            handlePollLetterOptions();
          }
        }}
        rows="5"
        cols="35"
        maxLength={QUESTION_MAX_INPUT_CHARS}
        aria-label={intl.formatMessage(customInput ? questionsAndOptionsPlaceholder
          : questionPlaceholder)}
        placeholder={intl.formatMessage(customInput ? questionsAndOptionsPlaceholder
          : questionPlaceholder)}
        {...{ MAX_INPUT_CHARS }}
        as={customInput ? DraggableTextArea : 'textarea'}
        ref={textareaRef}
      />
      {hasQuestionError || hasOptionError ? (
        <Styled.InputError>{error}</Styled.InputError>
      ) : (
        null
      )}
      {hasWarning ? (
        <Styled.Warning>{warning}</Styled.Warning>
      ) : (
        null
      )}
    </Styled.PollQuestionAreaWrapper>
  );
};

export default PollQuestionArea;
