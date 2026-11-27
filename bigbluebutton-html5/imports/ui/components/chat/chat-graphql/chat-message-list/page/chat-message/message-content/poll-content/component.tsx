import React, {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { flushSync } from 'react-dom';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { toPng } from 'html-to-image';
import logger from '/imports/startup/client/logger';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import CustomizedAxisTick, { isAxisLabelCut } from '/imports/ui/components/poll/components/CustomizedAxisTick';
import PollOptionsLegend from '/imports/ui/components/poll/components/PollOptionsLegend';
import { layoutSelectOutput, layoutSelect } from '/imports/ui/components/layout/context';
import { Layout, Output } from '/imports/ui/components/layout/layoutTypes';

interface ChatPollContentProps {
  metadata: string;
  height?: number;
  createdAt?: string;
}

export interface ChatPollContentHandle {
  copy: (onDone: () => void) => void;
  download: () => void;
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
  showMore: {
    id: 'app.chat.content.pollShowMore',
    description: 'Button that shows the whole question and options of a poll result',
  },
  showLess: {
    id: 'app.chat.content.pollShowLess',
    description: 'Button that shortens a poll result back',
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

const ChatPollContent = forwardRef<ChatPollContentHandle, ChatPollContentProps>((
  { metadata, height, createdAt },
  ref,
) => {
  const intl = useIntl();
  const chartRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isQuestionCut, setIsQuestionCut] = useState(false);
  const sidebarContent: Output['sidebarContent'] = layoutSelectOutput((i: Output) => i.sidebarContent);
  const fontSize: Layout['fontSize'] = layoutSelect((i: Layout) => i.fontSize);

  const pollData = JSON.parse(metadata) as unknown;
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

  const yAxisWidth = sidebarContent.width / 3;
  const hasCutLabels = translatedAnswers.some(
    ({ pollAnswerWithNumVotes }: { pollAnswerWithNumVotes: string }) => (
      isAxisLabelCut(pollAnswerWithNumVotes, yAxisWidth, fontSize)
    ),
  );

  // Collapsed, the question shows its first lines only, so one result cannot take the
  // whole chat; whether that cut anything is only known once it is laid out.
  useLayoutEffect(() => {
    const question = questionRef.current;
    if (!question || expanded) return;
    setIsQuestionCut(question.scrollHeight > question.clientHeight);
  }, [pollData.questionText, sidebarContent.width, expanded]);

  const canExpand = isQuestionCut || hasCutLabels;

  const handleCopy = useCallback((onDone: () => void) => {
    const pollDate = createdAt ? new Date(createdAt) : new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pollDate.getFullYear()}-${pad(pollDate.getMonth() + 1)}-${pad(pollDate.getDate())}`
      + ` ${pad(pollDate.getHours())}:${pad(pollDate.getMinutes())}:${pad(pollDate.getSeconds())}`;
    const lines = [
      `[${dateStr}]`,
      pollData.questionText,
      '',
      ...translatedAnswers.map((a: Answers & { pollAnswer: string }) => {
        const voteLabel = a.numVotes === 1
          ? intl.formatMessage(intlMessages.vote)
          : intl.formatMessage(intlMessages.votes);
        const correct = a.isCorrectAnswer
          ? `${intl.formatMessage(intlMessages.correctAnswer)}: `
          : '';
        return `${correct}${a.pollAnswer}: ${a.numVotes} ${voteLabel}`;
      }),
    ].filter((_line, idx) => idx !== 2 || pollData.questionText);
    if (!navigator.clipboard) {
      logger.warn({ logCode: 'poll_clipboard_unavailable' }, 'Clipboard API not available in this context');
      return;
    }
    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => {
        onDone();
      })
      .catch((err: Error) => {
        logger.warn({
          logCode: 'poll_clipboard_copy_error',
          extraInfo: { errorMessage: err?.message },
        }, 'Failed to copy poll results to clipboard');
      });
  }, [translatedAnswers, pollData, intl]);

  const handleDownload = useCallback(() => {
    if (!chartRef.current) return;
    const chartNode = chartRef.current;
    const pollDate = createdAt ? new Date(createdAt) : new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pollDate.getFullYear()}-${pad(pollDate.getMonth() + 1)}-${pad(pollDate.getDate())}`
      + `_${pad(pollDate.getHours())}-${pad(pollDate.getMinutes())}-${pad(pollDate.getSeconds())}`;
    const fileName = `poll-result_${dateStr}.png`;
    // The image shows the whole question even when the message is collapsed, and the
    // chart as before, without the options list under it.
    const wasExpanded = expanded;
    flushSync(() => setExpanded(true));
    toPng(chartNode, {
      backgroundColor: '#fff',
      filter: (node) => !(node instanceof HTMLElement && node.dataset.test === 'pollOptionsLegend'),
    }).finally(() => {
      if (!wasExpanded) setExpanded(false);
    }).then((dataUrl) => {
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.setAttribute(
        'download',
        fileName,
      );
      anchor.click();
    });
  }, [pollData, expanded]);

  useImperativeHandle(ref, () => ({
    copy: handleCopy,
    download: handleDownload,
  }), [handleCopy, handleDownload]);

  const useHeight = height || translatedAnswers.length * 50;

  return (
    <Styled.PollResult>
      <Styled.PollWrapper aria-hidden data-test="chatPollMessageText" ref={chartRef}>
        <Styled.PollText ref={questionRef} $collapsed={!expanded}>
          {pollData.questionText}
        </Styled.PollText>
        <div>
          <ResponsiveContainer width="100%" height={useHeight}>
            <BarChart
              data={translatedAnswers}
              layout="vertical"
            >
              <XAxis
                type="number"
                allowDecimals={false}
              />
              <YAxis
                width={sidebarContent.width / 3}
                fontSize={fontSize}
                type="category"
                dataKey="pollAnswerWithNumVotes"
                tick={CustomizedAxisTick}
              />
              <Bar dataKey="numVotes" fill="#0C57A7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {expanded && hasCutLabels && (
          <PollOptionsLegend
            options={translatedAnswers.map(
              ({ pollAnswer, isCorrectAnswer }: Answers & { pollAnswer: string }) => (
                `${isCorrectAnswer ? '✅ ' : ''}${pollAnswer}`
              ),
            )}
          />
        )}
      </Styled.PollWrapper>
      {canExpand && (
        <Styled.ExpandButton
          type="button"
          data-test="pollResultExpand"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {intl.formatMessage(expanded ? intlMessages.showLess : intlMessages.showMore)}
        </Styled.ExpandButton>
      )}
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
    </Styled.PollResult>
  );
});

export default ChatPollContent;
