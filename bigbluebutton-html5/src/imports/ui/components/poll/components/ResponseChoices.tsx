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
});

interface ResponseChoicesProps {
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
  customInput: boolean;
  questionAndOptions: string[] | string;
}

const ResponseChoices: React.FC<ResponseChoicesProps> = ({
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
  customInput,
  questionAndOptions,
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
        <Styled.SectionHeading>
          {intl.formatMessage(intlMessages.responseChoices)}
        </Styled.SectionHeading>
        {type === pollTypes.Response && (
          <Styled.PollParagraph>
            <span>{intl.formatMessage(intlMessages.typedResponseDesc)}</span>
          </Styled.PollParagraph>
        )}
        <ResponseArea
          error={error}
          type={type}
          toggleIsMultipleResponse={toggleIsMultipleResponse}
          isMultipleResponse={isMultipleResponse}
          optList={optList}
          handleAddOption={handleAddOption}
          secretPoll={secretPoll}
          question={question}
          setError={setError}
          setIsPolling={setIsPolling}
          hasCurrentPresentation={hasCurrentPresentation}
          handleToggle={handleToggle}
          handleInputChange={handleInputChange}
          handleRemoveOption={handleRemoveOption}
        />
      </div>
    );
  }
  return null;
};

export default ResponseChoices;
