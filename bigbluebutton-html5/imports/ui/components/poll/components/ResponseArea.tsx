import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Checkbox from '/imports/ui/components/common/checkbox/component';
import Toggle from '/imports/ui/components/common/switch/component';
import Styled from '../styles';
import { pollTypes, isDefaultPoll } from '../service';
import StartPollButton from './StartPollButton';
import PollInputs from './PollInputs';

const intlMessages = defineMessages({
  enableMultipleResponseLabel: {
    id: 'app.poll.enableMultipleResponseLabel',
    description: 'label for checkbox to enable multiple choice',
  },
  addOptionLabel: {
    id: 'app.poll.addItem.label',
    description: '',
  },
  secretPollLabel: {
    id: 'app.poll.secretPoll.label',
    description: '',
  },
  isSecretPollLabel: {
    id: 'app.poll.secretPoll.isSecretLabel',
    description: '',
  },
  on: {
    id: 'app.switch.onLabel',
    description: 'label for toggle switch on state',
  },
  off: {
    id: 'app.switch.offLabel',
    description: 'label for toggle switch off state',
  },
});

interface ResponseAreaProps {
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
  isQuiz: boolean;
  correctAnswer: {
    text: string;
    index: number;
  };
  setCorrectAnswer: (param: {text: string, index: number }) => void;
}

const ResponseArea: React.FC<ResponseAreaProps> = ({
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
  isQuiz,
  correctAnswer,
  setCorrectAnswer,
}) => {
  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
  const intl = useIntl();
  const defaultPoll = isDefaultPoll(type as string);
  if (defaultPoll || type === pollTypes.Response) {
    return (
      <Styled.ResponseArea>
        {(defaultPoll && !isQuiz) && (
          <div>
            <Styled.PollCheckbox data-test="allowMultiple">
              <Checkbox
                onChange={toggleMultipleResponse}
                checked={multipleResponse}
                ariaLabelledBy="multipleResponseCheckboxLabel"
                label={intl.formatMessage(intlMessages.enableMultipleResponseLabel)}
              />
            </Styled.PollCheckbox>
            <div id="multipleResponseCheckboxLabel" hidden>
              {intl.formatMessage(intlMessages.enableMultipleResponseLabel)}
            </div>
          </div>
        )}
        {defaultPoll && (
          <PollInputs
            error={error}
            optList={optList}
            handleInputChange={handleInputChange}
            handleRemoveOption={handleRemoveOption}
            type={type}
            isQuiz={isQuiz}
            correctAnswer={correctAnswer}
            setCorrectAnswer={setCorrectAnswer}
          />
        )}
        {defaultPoll && (
          <Styled.AddItemButton
            data-test="addPollItem"
            label={intl.formatMessage(intlMessages.addOptionLabel)}
            aria-describedby="add-item-button"
            color="default"
            icon="add"
            disabled={optList.length >= MAX_CUSTOM_FIELDS}
            onClick={() => handleAddOption()}
          />
        )}
        {
          !isQuiz && (
            <Styled.AnonymousRow>
              <Styled.AnonymousHeadingCol aria-hidden="true">
                <Styled.AnonymousHeading>
                  {intl.formatMessage(intlMessages.secretPollLabel)}
                </Styled.AnonymousHeading>
              </Styled.AnonymousHeadingCol>
              <Styled.AnonymousToggleCol>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <Styled.Toggle>
                  <Styled.ToggleLabel>
                    {secretPoll
                      ? intl.formatMessage(intlMessages.on)
                      : intl.formatMessage(intlMessages.off)}
                  </Styled.ToggleLabel>
                  <Toggle
                    // @ts-ignore - component Wrapped by intl, not reflecting the correct props
                    icons={false}
                    checked={secretPoll}
                    onChange={() => handleToggle()}
                    ariaLabel={intl.formatMessage(intlMessages.secretPollLabel)}
                    showToggleLabel={false}
                    data-test="anonymousPollBtn"
                  />
                </Styled.Toggle>
              </Styled.AnonymousToggleCol>
            </Styled.AnonymousRow>
          )
        }
        {secretPoll && (
          <Styled.PollParagraph>
            {intl.formatMessage(intlMessages.isSecretPollLabel)}
          </Styled.PollParagraph>
        )}
        <StartPollButton
          question={question}
          multipleResponse={multipleResponse}
          optList={optList}
          type={type}
          secretPoll={secretPoll}
          setError={setError}
          setIsPolling={setIsPolling}
          key="startPollButton"
          isQuiz={isQuiz}
          correctAnswerText={correctAnswer.text}
        />
      </Styled.ResponseArea>
    );
  }
  return null;
};

export default ResponseArea;
