import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from '../styles';

const intlMessages = defineMessages({
  pollInfo: {
    id: 'app.poll.info',
    description: 'Information about the poll',
  },
  quizInfo: {
    id: 'app.poll.quiz.info',
    description: 'Information about the quiz',
  },
});

interface InfoBoxContainerProps {
  isQuiz: boolean;
}

const InfoBox: React.FC<InfoBoxContainerProps> = ({
  isQuiz,
}) => {
  const intl = useIntl();
  return (
    <Styled.InfoBoxContainer isQuiz={isQuiz}>
      {
        isQuiz ? (
          <p>{intl.formatMessage(intlMessages.quizInfo)}</p>
        ) : (
          <p>{intl.formatMessage(intlMessages.pollInfo)}</p>
        )
      }
    </Styled.InfoBoxContainer>
  );
};

export default InfoBox;
