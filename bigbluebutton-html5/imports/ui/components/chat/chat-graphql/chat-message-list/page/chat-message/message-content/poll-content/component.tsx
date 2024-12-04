import React from 'react';
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis,
} from 'recharts';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';
import { defineMessages, useIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import Styled from './styles';

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

  const pollData = JSON.parse(string) as unknown;
  assertAsMetadata(pollData);

  const answers = pollData.answers.reduce(caseInsensitiveReducer, []);

  const translatedAnswers = answers.map((answer: Answers) => {
    const translationKey = intlMessages[answer.key.toLowerCase() as keyof typeof intlMessages];
    const pollAnswer = translationKey ? intl.formatMessage(translationKey) : answer.key;
    return {
      ...answer,
      pollAnswer,
    };
  });

  const useHeight = height || translatedAnswers.length * 50;
  const useWidth = deviceInfo.isPortrait() ? '100%' : '130%';
  return (
    <Styled.PollWrapper data-test="chatPollMessageText">
      <Styled.PollText>
        {pollData.questionText}
      </Styled.PollText>
      <ResponsiveContainer width={useWidth} height={useHeight}>
        <BarChart
          data={translatedAnswers}
          layout="vertical"
        >
          <XAxis
            type="number"
            allowDecimals={false}
          />
          <YAxis width={80} type="category" dataKey="pollAnswer" />
          <Bar dataKey="numVotes" fill="#0C57A7" />
        </BarChart>
      </ResponsiveContainer>
    </Styled.PollWrapper>
  );
};

export default ChatPollContent;
