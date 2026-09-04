import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react/Button';
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
  noTypeErr: {
    id: 'app.poll.noTypeSelectedErr',
    description: 'reason the start button is disabled while no response type is picked',
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
  optList: Array<{val: string, key: string}>;
  question: string | string[];
  type: string | null;
  setError: (err: string) => void;
  setIsPolling: (isPolling: boolean) => void;
  secretPoll: boolean;
  multipleResponse: boolean;
  isQuiz: boolean;
  correctAnswer: {
    text: string;
    index: number;
  };
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
  correctAnswer = { text: '', index: -1 },
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
    correctAnswerText: string,
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
        quiz: isQuiz && correctAnswerText.trim().length > 0,
        answers,
        correctAnswer: isQuiz ? correctAnswerText : null,
      },
    });
  };

  const hasNotMinOptions = (type !== pollTypes.Response
    && optList.filter((o) => o.val.trim().length > 0).length < 1);
  const quizHasNoCorrectAnswer = (
    isQuiz
    && !(optList[correctAnswer.index]?.key === correctAnswer.text));
  // The button used to live inside ResponseArea, which only rendered once a type was
  // picked. It now sits in the panel footer and is always mounted, so the type has to be
  // checked here - otherwise POLL_CREATE would fire with an empty pollType. Note this
  // cannot use isDefaultPoll: that is `type !== Response`, which is true for '' as well.
  const hasNoType = !type;
  const disabledReason = [
    hasNoType ? intl.formatMessage(intlMessages.noTypeErr) : '',
    hasNotMinOptions ? intl.formatMessage(intlMessages.minOptionsErr) : '',
    quizHasNoCorrectAnswer ? intl.formatMessage(intlMessages.quizErr) : '',
  ].filter(Boolean).join('\n');
  return (
    // The reason sits on the wrapper, not on the button: the library sets
    // `pointer-events: none` on a disabled button, so anything bound to the button itself
    // would never be hoverable - which is exactly when the reason has to be readable.
    <Styled.StartPollBtn title={disabledReason || undefined}>
      <BBButton
        dataTest="startPoll"
        label={intl.formatMessage(isQuiz ? intlMessages.startQuizLabel : intlMessages.startPollLabel)}
        ariaDescribedBy="start-poll-button"
        variant="primary"
        color="default"
        disabled={hasNoType || hasNotMinOptions || quizHasNoCorrectAnswer}
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
                correctAnswer.text,
                verifiedOptions?.filter(Boolean),
              );
            } else {
              startPoll(
                verifiedPollType,
                secretPoll,
                question,
                multipleResponse,
                isQuiz,
                correctAnswer.text,
              );
            }
          }
        }}
      />
    </Styled.StartPollBtn>
  );
};

export default StartPollButton;
