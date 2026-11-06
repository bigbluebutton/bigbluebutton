import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react/Button';
import { pollTypes, pollTypesKeys } from '../service';
import Styled from '../styles';

// The library's Button has no `selected` state. The selected look is its `primary` fill;
// the unselected one is the design's grey, which no variant provides - Styled.ResponseTypeButton
// paints it, so the variant underneath is only a neutral base.
const variantFor = (selected: boolean) => (selected ? 'primary' : 'tertiary');

const intlMessages = defineMessages({
  responseTypesLabel: {
    id: 'app.poll.responseTypes.label',
    description: '',
  },
  tf: {
    id: 'app.poll.tf',
    description: 'label for true / false poll',
  },
  true: {
    id: 'app.poll.answer.true',
    description: '',
  },
  false: {
    id: 'app.poll.answer.false',
    description: '',
  },
  a4: {
    id: 'app.poll.a4',
    description: 'label for A / B / C / D poll',
  },
  a: {
    id: 'app.poll.answer.a',
    description: '',
  },
  b: {
    id: 'app.poll.answer.b',
    description: '',
  },
  c: {
    id: 'app.poll.answer.c',
    description: '',
  },
  d: {
    id: 'app.poll.answer.d',
    description: '',
  },
  e: {
    id: 'app.poll.answer.e',
    description: '',
  },
  yna: {
    id: 'app.poll.yna',
    description: '',
  },
  yes: {
    id: 'app.poll.y',
    description: '',
  },
  no: {
    id: 'app.poll.n',
    description: '',
  },
  abstention: {
    id: 'app.poll.abstention',
    description: '',
  },
  userResponse: {
    id: 'app.poll.userResponse.label',
    description: '',
  },
});

interface ResponseTypesProps {
  customInput: boolean;
  setType: (type: string | null) => void;
  type: string | null;
  setOptList: (optList: Array<{ key: string; val: string }>) => void;
  isQuiz: boolean;
  setCorrectAnswer: (correctAnswer: { text: string; index: number }) => void;
  setMultipleResponse: (multipleResponse: boolean) => void;
}

const ResponseTypes: React.FC<ResponseTypesProps> = ({
  customInput,
  setType,
  type,
  setOptList,
  isQuiz,
  setCorrectAnswer,
  setMultipleResponse,
}) => {
  const intl = useIntl();
  if (!customInput) {
    return (
      <div data-test="responseTypes">
        <Styled.SectionHeading>
          {intl.formatMessage(intlMessages.responseTypesLabel)}
        </Styled.SectionHeading>
        <Styled.ResponseType>
          <Styled.ResponseTypeButton $selected={type === pollTypes.TrueFalse}>
            <BBButton
              variant={variantFor(type === pollTypes.TrueFalse)}
              label={intl.formatMessage(intlMessages.tf)}
              ariaDescribedBy="poll-config-button"
              dataTest="pollTrueFalse"
              color="default"
              onClick={() => {
                setType(pollTypes.TrueFalse);
                setOptList([
                  {
                    key: pollTypesKeys.true,
                    val: intl.formatMessage(intlMessages.true),
                  },
                  {
                    key: pollTypesKeys.false,
                    val: intl.formatMessage(intlMessages.false),
                  },
                ]);
                setCorrectAnswer({ text: '', index: -1 });
              }}
            />
          </Styled.ResponseTypeButton>
          <Styled.ResponseTypeButton $selected={type === pollTypes.Letter}>
            <BBButton
              variant={variantFor(type === pollTypes.Letter)}
              label={intl.formatMessage(intlMessages.a4)}
              ariaDescribedBy="poll-config-button"
              dataTest="pollLetterAlternatives"
              color="default"
              onClick={() => {
                if (!customInput) {
                  setType(pollTypes.Letter);
                  setOptList([
                    { key: pollTypesKeys.A, val: intl.formatMessage(intlMessages.a) },
                    { key: pollTypesKeys.B, val: intl.formatMessage(intlMessages.b) },
                    { key: pollTypesKeys.C, val: intl.formatMessage(intlMessages.c) },
                    { key: pollTypesKeys.D, val: intl.formatMessage(intlMessages.d) },
                  ]);
                  setCorrectAnswer({ text: '', index: -1 });
                }
              }}
            />
          </Styled.ResponseTypeButton>
          <Styled.ResponseTypeButton $selected={type === pollTypes.YesNoAbstention}>
            <BBButton
              variant={variantFor(type === pollTypes.YesNoAbstention)}
              label={intl.formatMessage(intlMessages.yna)}
              ariaDescribedBy="poll-config-button"
              dataTest="pollYesNoAbstentionBtn"
              color="default"
              onClick={() => {
                setType(pollTypes.YesNoAbstention);
                setOptList([
                  { key: pollTypesKeys.yes, val: intl.formatMessage(intlMessages.yes) },
                  { key: pollTypesKeys.no, val: intl.formatMessage(intlMessages.no) },
                  { key: pollTypesKeys.abstention, val: intl.formatMessage(intlMessages.abstention) },
                ]);
                setCorrectAnswer({ text: '', index: -1 });
              }}
            />
          </Styled.ResponseTypeButton>
          {
            !isQuiz && (
              <Styled.ResponseTypeButton $selected={type === pollTypes.Response}>
                <BBButton
                  variant={variantFor(type === pollTypes.Response)}
                  label={intl.formatMessage(intlMessages.userResponse)}
                  ariaDescribedBy="poll-config-button"
                  dataTest="userResponseBtn"
                  color="default"
                  onClick={() => {
                    setType(pollTypes.Response);
                    setCorrectAnswer({ text: '', index: -1 });
                    // A typed response cannot be multiple choice; without this the flag
                    // stays set from a previous type and still reaches POLL_CREATE.
                    setMultipleResponse(false);
                  }}
                />
              </Styled.ResponseTypeButton>
            )
          }
        </Styled.ResponseType>
      </div>
    );
  }
  return null;
};

export default ResponseTypes;
