import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { MdAddCircle } from 'react-icons/md';
import { BBBToggle } from '@bigbluebutton/bbb-ui-components-react/Toggle';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react/Button';
import Styled from '../styles';
import { pollTypes, isDefaultPoll } from '../service';
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
});

interface ResponseAreaProps {
  type: string | null;
  toggleMultipleResponse: () => void;
  multipleResponse: boolean;
  optList: Array<{ key: string; val: string }>;
  handleAddOption: () => void;
  secretPoll: boolean;
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
        {!isQuiz && (
          <Styled.PollCheckbox data-test="allowMultiple">
            <BBBToggle
              onChange={toggleMultipleResponse}
              checked={multipleResponse}
              // Typed responses cannot be multiple choice, but the design keeps
              // the toggle visible and disabled rather than removing it.
              disabled={!defaultPoll}
              label={intl.formatMessage(intlMessages.enableMultipleResponseLabel)}
            />
          </Styled.PollCheckbox>
        )}
        {
          !isQuiz && (
            <Styled.AnonymousRow>
              <BBBToggle
                checked={secretPoll}
                onChange={() => handleToggle()}
                label={intl.formatMessage(intlMessages.secretPollLabel)}
                helperText={secretPoll ? intl.formatMessage(intlMessages.isSecretPollLabel) : undefined}
                inputProps={{ 'data-test': 'anonymousPollBtn' } as React.InputHTMLAttributes<HTMLInputElement>}
              />
            </Styled.AnonymousRow>
          )
        }
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
          <Styled.AddItemButton>
            <BBButton
              dataTest="addPollItem"
              label={intl.formatMessage(intlMessages.addOptionLabel)}
              ariaDescribedBy="add-item-button"
              variant="subtle"
              color="default"
              iconStart={<MdAddCircle />}
              disabled={optList.length >= MAX_CUSTOM_FIELDS}
              onClick={() => handleAddOption()}
            />
          </Styled.AddItemButton>
        )}
      </Styled.ResponseArea>
    );
  }
  return null;
};

export default ResponseArea;
