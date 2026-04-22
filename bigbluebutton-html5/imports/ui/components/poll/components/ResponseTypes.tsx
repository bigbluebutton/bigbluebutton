import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { pollTypes, pollTypesKeys } from '../service';
import Styled from '../styles';

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
}

const ResponseTypes: React.FC<ResponseTypesProps> = ({
  customInput,
  setType,
  type,
  setOptList,
  isQuiz,
  setCorrectAnswer,
}) => {
  const intl = useIntl();
  if (!customInput) {
    return (
      <div data-test="responseTypes">
        <Styled.SectionHeading>
          {intl.formatMessage(intlMessages.responseTypesLabel)}
        </Styled.SectionHeading>
        <Styled.ResponseType>
          <Styled.PollConfigButton
            selected={type === pollTypes.TrueFalse}
            small={false}
            label={intl.formatMessage(intlMessages.tf)}
            aria-describedby="poll-config-button"
            data-test="pollTrueFalse"
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
          <Styled.PollConfigButton
            selected={type === pollTypes.Letter}
            small={false}
            label={intl.formatMessage(intlMessages.a4)}
            aria-describedby="poll-config-button"
            data-test="pollLetterAlternatives"
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
          <Styled.PollConfigButton
            selected={type === pollTypes.YesNoAbstention}
            small={false}
            full
            label={intl.formatMessage(intlMessages.yna)}
            aria-describedby="poll-config-button"
            data-test="pollYesNoAbstentionBtn"
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
          {
            !isQuiz && (
              <Styled.PollConfigButton
                selected={type === pollTypes.Response}
                small={false}
                full
                label={intl.formatMessage(intlMessages.userResponse)}
                aria-describedby="poll-config-button"
                data-test="userResponseBtn"
                color="default"
                onClick={() => {
                  setType(pollTypes.Response);
                  setCorrectAnswer({ text: '', index: -1 });
                }}
              />
            )
          }
        </Styled.ResponseType>
      </div>
    );
  }
  return null;
};

export default ResponseTypes;
