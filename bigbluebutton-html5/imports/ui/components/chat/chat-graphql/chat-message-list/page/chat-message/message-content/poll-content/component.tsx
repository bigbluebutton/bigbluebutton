import React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import Styled from './styles';

interface ChatPollContentProps {
  metadata: string;
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
  if ((metadata as Metadata).answers.length === 0) {
    throw new Error('metadata.answers is empty');
  }
}

const ChatPollContent: React.FC<ChatPollContentProps> = ({
  metadata: string,
}) => {
  const pollData = JSON.parse(string) as unknown;
  assertAsMetadata(pollData);
  return (
    <div>
      <Styled.pollText>
        {pollData.questionText}
      </Styled.pollText>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={pollData.answers}
          layout="vertical"
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="key" />
          <Bar dataKey="numVotes" fill="#0C57A7" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChatPollContent;