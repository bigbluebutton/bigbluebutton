import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import { useMutation } from '@apollo/client';
import Styled from '../styles';
import { pollTypes, checkPollType } from '../service';
import { POLL_CREATE } from '../mutations';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

const POLL_SETTINGS = Meteor.settings.public.poll;
const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;

const intlMessages = defineMessages({
  startPollLabel: {
    id: 'app.poll.start.label',
    description: '',
  },
  questionErr: {
    id: 'app.poll.questionErr',
    description: 'question text area error label',
  },
  optionErr: {
    id: 'app.poll.optionErr',
    description: 'poll input error label',
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
  true: {
    id: 'app.poll.answer.true',
    description: '',
  },
  false: {
    id: 'app.poll.answer.false',
    description: '',
  },
});

interface StartPollButtonProps {
  optList: Array<{val: string}>;
  question: string | string[];
  type: string | null;
  setError: (err: string) => void;
  setIsPolling: (isPolling: boolean) => void;
  secretPoll: boolean;
  isMultipleResponse: boolean;
  hasCurrentPresentation: boolean;
}

const StartPollButton: React.FC<StartPollButtonProps> = ({
  optList,
  question,
  type,
  setError,
  setIsPolling,
  secretPoll,
  isMultipleResponse,
  hasCurrentPresentation,
}) => {
  const intl = useIntl();

  const [createPoll] = useMutation(POLL_CREATE);

  const startPoll = (
    pollType: string | null,
    secretPoll: boolean,
    question: string | string[],
    isMultipleResponse: boolean,
    answers: (string | null)[] = [],
  ) => {
    const pollId = hasCurrentPresentation || PUBLIC_CHAT_KEY;

    createPoll({
      variables: {
        pollType,
        pollId: `${pollId}/${new Date().getTime()}`,
        secretPoll,
        question,
        isMultipleResponse,
        answers,
      },
    });
  };

  return (
    <Styled.StartPollBtn
      data-test="startPoll"
      label={intl.formatMessage(intlMessages.startPollLabel)}
      color="primary"
      onClick={() => {
        const optionsList = optList.slice(0, MAX_CUSTOM_FIELDS);
        let hasVal = false;
        optionsList.forEach((o) => {
          if (o.val.trim().length > 0) hasVal = true;
        });

        let err = null;
        if (type === pollTypes.Response && question.length === 0) {
          err = intl.formatMessage(intlMessages.questionErr);
        }
        if (!hasVal && type !== pollTypes.Response) {
          err = intl.formatMessage(intlMessages.optionErr);
        }

        if (err) {
          setError(err);
        } else {
          setIsPolling(true);
          const verifiedPollType = checkPollType(
            type,
            optionsList,
            intl.formatMessage(intlMessages.yes),
            intl.formatMessage(intlMessages.no),
            intl.formatMessage(intlMessages.abstention),
            intl.formatMessage(intlMessages.true),
            intl.formatMessage(intlMessages.false),
          );
          const verifiedOptions = optionsList.map((o) => {
            if (o.val.trim().length > 0) return o.val;
            return null;
          });
          if (verifiedPollType === pollTypes.Custom) {
            startPoll(
              verifiedPollType,
              secretPoll,
              question,
              isMultipleResponse,
              verifiedOptions?.filter(Boolean),
            );
          } else {
            startPoll(verifiedPollType, secretPoll, question, isMultipleResponse);
          }
        }
      }}
    />
  );
};

export default StartPollButton;
