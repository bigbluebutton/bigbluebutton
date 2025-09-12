import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from '../styles';
import { pollTypes, checkPollType } from '../service';
import { POLL_CREATE } from '../mutations';

const intlMessages = defineMessages({
  startPollLabel: {
    id: 'app.poll.start.label',
    description: '',
  },
  startQuizLabel: {
    id: 'app.poll.quiz.start.label',
    description: '',
  },
  questionErr: {
    id: 'app.poll.questionErr',
    description: 'question text area error label',
  },
  quizErr: {
    id: 'app.poll.quiz.error',
    description: 'quiz error label',
  },
  optionErr: {
    id: 'app.poll.optionErr',
    description: 'poll input error label',
  },
  minOptionsErr: {
    id: 'app.poll.minOptionsErr',
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
  multipleResponse: boolean;
  isQuiz: boolean;
  correctAnswerText: string;
}

const StartPollButton: React.FC<StartPollButtonProps> = ({
  optList,
  question,
  type,
  setError,
  setIsPolling,
  secretPoll,
  multipleResponse,
  isQuiz = false,
  correctAnswerText = '',
}) => {
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

  const POLL_SETTINGS = window.meetingClientSettings.public.poll;
  const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
  const intl = useIntl();

  const [createPoll] = useMutation(POLL_CREATE);

  const startPoll = (
    pollType: string | null,
    secretPoll: boolean,
    question: string | string[],
    multipleResponse: boolean,
    isQuiz: boolean = false,
    correctAnswerText: string = '',
    answers: (string | null)[] = [],
  ) => {
    const pollId = PUBLIC_CHAT_KEY;

    createPoll({
      variables: {
        pollType,
        pollId: `${pollId}/${new Date().getTime()}`,
        secretPoll,
        question,
        multipleResponse,
        quiz: isQuiz,
        answers,
        correctAnswer: correctAnswerText,
      },
    });
  };

  const hasNotMinOptions = (type !== pollTypes.Response
    && optList.filter((o) => o.val.trim().length > 0).length < 1);
  const quizHasNoCorrectAnswer = (isQuiz && correctAnswerText.trim().length === 0);
  return (
    <Styled.StartPollBtn
      data-test="startPoll"
      label={isQuiz ? intl.formatMessage(intlMessages.startQuizLabel) : intl.formatMessage(intlMessages.startPollLabel)}
      color="primary"
      disabled={hasNotMinOptions || quizHasNoCorrectAnswer}
      title={`${hasNotMinOptions ? intl.formatMessage(intlMessages.minOptionsErr) : ''}\n${quizHasNoCorrectAnswer ? intl.formatMessage(intlMessages.quizErr) : ''}`}
      onClick={() => {
        const optionsList = optList.slice(0, MAX_CUSTOM_FIELDS);
        let hasVal = false;
        optionsList.forEach((o) => {
          if (o.val.trim().length > 0) hasVal = true;
        });

        let err = null;
        if (hasNotMinOptions) {
          err = intl.formatMessage(intlMessages.optionErr);
        }
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
              multipleResponse,
              isQuiz,
              correctAnswerText,
              verifiedOptions?.filter(Boolean),
            );
          } else {
            startPoll(
              verifiedPollType,
              secretPoll,
              question,
              multipleResponse,
              isQuiz,
              correctAnswerText,
            );
          }
        }
      }}
    />
  );
};

export default StartPollButton;
