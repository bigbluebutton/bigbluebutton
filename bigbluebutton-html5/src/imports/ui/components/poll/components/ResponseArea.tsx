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
  toggleIsMultipleResponse: () => void;
  isMultipleResponse: boolean;
  optList: Array<{ val: string }>;
  handleAddOption: () => void;
  secretPoll: boolean;
  question: string | string[];
  setError: (err: string) => void;
  setIsPolling: (isPolling: boolean) => void;
  hasCurrentPresentation: boolean;
  handleToggle: () => void;
  error: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>, i: number) => void;
  handleRemoveOption: (i: number) => void;
}

const ResponseArea: React.FC<ResponseAreaProps> = ({
  type,
  toggleIsMultipleResponse,
  isMultipleResponse,
  optList,
  handleAddOption,
  secretPoll,
  question,
  setError,
  setIsPolling,
  hasCurrentPresentation,
  handleToggle,
  error,
  handleInputChange,
  handleRemoveOption,
}) => {
  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
  const intl = useIntl();
  const defaultPoll = isDefaultPoll(type as string);
  if (defaultPoll || type === pollTypes.Response) {
    return (
      <Styled.ResponseArea>
        {defaultPoll && (
          <div>
            <Styled.PollCheckbox data-test="allowMultiple">
              <Checkbox
                onChange={toggleIsMultipleResponse}
                checked={isMultipleResponse}
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
                defaultChecked={secretPoll}
                onChange={() => handleToggle()}
                ariaLabel={intl.formatMessage(intlMessages.secretPollLabel)}
                showToggleLabel={false}
                data-test="anonymousPollBtn"
              />
            </Styled.Toggle>
          </Styled.AnonymousToggleCol>
        </Styled.AnonymousRow>
        {secretPoll && (
          <Styled.PollParagraph>
            {intl.formatMessage(intlMessages.isSecretPollLabel)}
          </Styled.PollParagraph>
        )}
        <StartPollButton
          hasCurrentPresentation={hasCurrentPresentation}
          question={question}
          isMultipleResponse={isMultipleResponse}
          optList={optList}
          type={type}
          secretPoll={secretPoll}
          setError={setError}
          setIsPolling={setIsPolling}
          key="startPollButton"
        />
      </Styled.ResponseArea>
    );
  }
  return null;
};

export default ResponseArea;
