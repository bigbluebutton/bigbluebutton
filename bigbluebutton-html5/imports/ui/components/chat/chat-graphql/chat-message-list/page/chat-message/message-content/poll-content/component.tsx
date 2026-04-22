import React from 'react';
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis,
} from 'recharts';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import CustomizedAxisTick from '/imports/ui/components/poll/components/CustomizedAxisTick';
import { layoutSelectOutput, layoutSelect } from '/imports/ui/components/layout/context';
import { Layout, Output } from '/imports/ui/components/layout/layoutTypes';

interface ChatPollContentProps {
  metadata: string;
  height?: number;
}

interface Metadata {
  id: string;
  question: string;
  numRespondents: number;
  numResponders: number;
  questionText: string;
  questionType: string;
  answers: Array<Answers>;
}

interface Answers {
  key: string;
  numVotes: number;
  id: number;
  isCorrectAnswer: boolean;
}

const intlMessages = defineMessages({
  true: {
    id: 'app.poll.t',
    description: 'Poll true option value',
  },
  false: {
    id: 'app.poll.f',
    description: 'Poll false option value',
  },
  yes: {
    id: 'app.poll.y',
    description: 'Poll yes option value',
  },
  no: {
    id: 'app.poll.n',
    description: 'Poll no option value',
  },
  abstention: {
    id: 'app.poll.abstention',
    description: 'Poll Abstention option value',
  },
  vote: {
    id: 'app.chat.content.pollVote',
    description: 'Vote label',
  },
  votes: {
    id: 'app.chat.content.pollVotes',
    description: 'Votes label',
  },
  correctAnswer: {
    id: 'app.poll.quiz.options.correct',
    description: 'Correct answer label for quiz options',
  },
});

function assertAsMetadata(metadata: unknown): asserts metadata is Metadata {
  if (typeof metadata !== 'object' || metadata === null) {
    throw new Error('metadata is not an object');
  }
  if (typeof (metadata as Metadata).id !== 'string') {
    throw new Error('metadata.id is not a string');
  }
  if (typeof (metadata as Metadata).numRespondents !== 'number') {
    throw new Error('metadata.numRespondents is not a number');
  }
  if (typeof (metadata as Metadata).numResponders !== 'number') {
    throw new Error('metadata.numResponders is not a number');
  }
  if (typeof (metadata as Metadata).questionText !== 'string') {
    throw new Error('metadata.questionText is not a string');
  }
  if (typeof (metadata as Metadata).questionType !== 'string') {
    throw new Error('metadata.questionType is not a string');
  }
  if (!Array.isArray((metadata as Metadata).answers)) {
    throw new Error('metadata.answers is not an array');
  }
}

const ChatPollContent: React.FC<ChatPollContentProps> = ({
  metadata: string,
  height = undefined,
}) => {
  const intl = useIntl();
  const sidebarContent: Output['sidebarContent'] = layoutSelectOutput((i: Output) => i.sidebarContent);
  const fontSize: Layout['fontSize'] = layoutSelect((i: Layout) => i.fontSize);

  const pollData = JSON.parse(string) as unknown;
  assertAsMetadata(pollData);

  const answers = pollData.answers.reduce(caseInsensitiveReducer, []);

  const translatedAnswers = answers.map((answer: Answers) => {
    const translationKey = intlMessages[answer.key.toLowerCase() as keyof typeof intlMessages];
    const pollAnswer = translationKey ? intl.formatMessage(translationKey) : answer.key;
    const pollAnswerWithNumVotes = `${answer.isCorrectAnswer ? '✅ ' : ''}${pollAnswer} (${answer.numVotes})`;
    return {
      ...answer,
      pollAnswer,
      pollAnswerWithNumVotes,
    };
  });

  const useHeight = height || translatedAnswers.length * 50;
  return (
    <>
      <Styled.PollWrapper aria-hidden data-test="chatPollMessageText">
        <Styled.PollText>
          {pollData.questionText}
        </Styled.PollText>
        <ResponsiveContainer width="100%" height={useHeight}>
          <BarChart
            data={translatedAnswers}
            layout="vertical"
          >
            <XAxis
              type="number"
              allowDecimals={false}
            />
            <YAxis width={sidebarContent.width / 3} fontSize={fontSize} type="category" dataKey="pollAnswerWithNumVotes" tick={CustomizedAxisTick} />
            <Bar dataKey="numVotes" fill="#0C57A7" />
          </BarChart>
        </ResponsiveContainer>
      </Styled.PollWrapper>
      <p className="sr-only">
        {pollData.questionText ? `${pollData.questionText}: ` : ''}
        {`${translatedAnswers
          .map((a: Answers & { pollAnswer: string }) => `${a.isCorrectAnswer ? `${intl.formatMessage(intlMessages.correctAnswer)}: ` : ''}${a.pollAnswer}: ${a.numVotes} ${
            a.numVotes === 1 ? intl.formatMessage(intlMessages.vote) : intl.formatMessage(intlMessages.votes)
          }`)
          .join(', ')}.`}
      </p>
      <ul className="sr-only">
        {translatedAnswers.map((a: Answers & { pollAnswer: string }) => (
          <li key={a.pollAnswer}>{`${a.isCorrectAnswer ? `${intl.formatMessage(intlMessages.correctAnswer)}: ` : ''}${a.pollAnswer} — ${a.numVotes}`}</li>
        ))}
      </ul>
    </>
  );
};

export default ChatPollContent;
