import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import KEYS from '/imports/utils/keys';
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
  newPollLabel: {
    id: 'app.poll.newPoll.label',
    description: 'heading above the poll question input',
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
  // Custom input swaps the library's textarea for the drag-and-drop one, which needs the
  // two extra props to turn a dropped file into poll options.
  const dragAndDropProps = customInput
    ? { as: DraggableTextArea, MAX_INPUT_CHARS, handleTextareaChange }
    : {};
  return (
    <Styled.PollQuestionAreaWrapper>
      {!customInput && (
        <Styled.SectionHeading>
          {intl.formatMessage(intlMessages.newPollLabel)}
        </Styled.SectionHeading>
      )}
      <Styled.PollQuestionArea
        $hasError={Boolean(hasQuestionError || hasOptionError)}
        data-test="pollQuestionArea"
        value={customInput ? questionAndOptions : question}
        onChange={handleTextareaChange}
        onPaste={(e: React.ClipboardEvent) => { e.stopPropagation(); setIsPasting(true); }}
        onCut={(e: React.ClipboardEvent) => { e.stopPropagation(); }}
        onCopy={(e: React.ClipboardEvent) => { e.stopPropagation(); }}
        onKeyPress={(event: React.KeyboardEvent) => {
          if (event.key === KEYS.ENTER && customInput) {
            handlePollLetterOptions();
          }
        }}
        rows={3}
        cols={35}
        maxLength={QUESTION_MAX_INPUT_CHARS}
        aria-label={intl.formatMessage(customInput ? questionsAndOptionsPlaceholder
          : questionPlaceholder)}
        placeholder={intl.formatMessage(customInput ? questionsAndOptionsPlaceholder
          : questionPlaceholder)}
        // The panel owns focus (it refocuses whenever the custom-input mode flips), so the
        // library's own autofocus stays off to keep a single owner.
        autoFocus={false}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...dragAndDropProps}
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
