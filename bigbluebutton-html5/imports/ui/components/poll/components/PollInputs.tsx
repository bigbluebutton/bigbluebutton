import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { MdOutlineDelete } from 'react-icons/md';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react/Button';
import { pollTypes } from '../service';
import Styled from '../styles';
import Tooltip from '/imports/ui/components/common/tooltip/container';

const intlMessages = defineMessages({
  customPlaceholder: {
    id: 'app.poll.customPlaceholder',
    description: 'custom poll input field placeholder text',
  },
  delete: {
    id: 'app.poll.optionDelete.label',
    description: '',
  },
  deleteRespDesc: {
    id: 'app.poll.deleteRespDesc',
    description: '',
  },
  emptyPollOpt: {
    id: 'app.poll.emptyPollOpt',
    description: 'screen reader for blank poll option',
  },
  correctAnswerSelectionTooltip: {
    id: 'app.poll.quiz.options.tooltip',
    description: 'Tooltip for the correct answer option selection in a quiz',
  },
  correctAnswerLabel: {
    id: 'app.poll.quiz.liveResult.title.correct',
    description: 'Label for the correct answer of a quiz',
  },
});

interface PollInputsProps {
  optList: Array<{ key: string; val: string }>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, i: number) => void;
  handleRemoveOption: (i: number) => void;
  type: string | null;
  error: string | null;
  isQuiz: boolean;
  correctAnswer: {
    text: string;
    index: number;
  };
  setCorrectAnswer: (param: {text: string, index: number }) => void;
}

const PollInputs: React.FC<PollInputsProps> = ({
  optList,
  handleInputChange,
  handleRemoveOption,
  type,
  error,
  isQuiz,
  correctAnswer,
  setCorrectAnswer,
}) => {
  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
  const MAX_INPUT_CHARS = POLL_SETTINGS.maxTypedAnswerLength;
  const MIN_OPTIONS_LENGTH = 2;
  const intl = useIntl();
  let hasVal = false;
  return optList.slice(0, MAX_CUSTOM_FIELDS).map((o: { key: string; val: string }, i: number) => {
    const pollOptionKey = `poll-option-${i}`;
    if (o.val && o.val.length > 0) hasVal = true;
    return (
      <span key={pollOptionKey}>
        <Styled.OptionWrapper>
          {isQuiz && (
            <Tooltip title={intl.formatMessage(intlMessages.correctAnswerSelectionTooltip)}>
              <Styled.QuizCorrectAnswerCheckbox
                type="checkbox"
                id={`correct-answer-${i}`}
                checked={correctAnswer.index === i}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                  if (ev.target.checked) {
                    setCorrectAnswer({
                      text: o.key,
                      index: i,
                    });
                  }
                }}
              />
            </Tooltip>
          )}
          <Styled.PollInputContainer>
            <Styled.PollOptionInput
              type="text"
              value={o.val}
              placeholder={intl.formatMessage(intlMessages.customPlaceholder)}
              $isCorrect={isQuiz && correctAnswer.index === i}
              onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>, i)}
              // The library wraps a MUI field, so anything that has to reach the <input>
              // itself - the test hook included - goes through the htmlInput slot.
              slotProps={{
                htmlInput: {
                  'data-test': 'pollOptionItem',
                  maxLength: MAX_INPUT_CHARS,
                  onPaste: (e: React.ClipboardEvent) => { e.stopPropagation(); },
                  onCut: (e: React.ClipboardEvent) => { e.stopPropagation(); },
                  onCopy: (e: React.ClipboardEvent) => { e.stopPropagation(); },
                },
              }}
            />
            {isQuiz && correctAnswer.index === i && (
              <Styled.CorrectLabel
                data-test="correctAnswerLabel"
                aria-label={intl.formatMessage(intlMessages.correctAnswerLabel)}
              >
                {intl.formatMessage(intlMessages.correctAnswerLabel)}
              </Styled.CorrectLabel>
            )}
          </Styled.PollInputContainer>
          {optList.length > MIN_OPTIONS_LENGTH && (
            <Styled.DeletePollOptionButton>
              <BBButton
                layout="squared"
                icon={<MdOutlineDelete />}
                ariaLabel={intl.formatMessage(intlMessages.delete)}
                ariaDescribedBy={`option-${i}`}
                dataTest="deletePollOption"
                variant="tertiary"
                color="default"
                onClick={() => {
                  handleRemoveOption(i);
                }}
              />
            </Styled.DeletePollOptionButton>
          )}
          <span className="sr-only" id={`option-${i}`}>
            {intl.formatMessage(
              intlMessages.deleteRespDesc,
              { option: o.val || intl.formatMessage(intlMessages.emptyPollOpt) },
            )}
          </span>
        </Styled.OptionWrapper>
        {!hasVal && type !== pollTypes.Response && error ? (
          <Styled.InputError data-test="errorNoValueInput">{error}</Styled.InputError>
        ) : (
          <Styled.ErrorSpacer>&nbsp;</Styled.ErrorSpacer>
        )}
      </span>
    );
  });
};

export default PollInputs;
