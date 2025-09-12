import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from '../styles';

interface QuizAndPollTabSelectorProps {
  isQuiz: boolean;
  onTabChange: (isQuiz: boolean) => void;
}

const intlMessages = defineMessages({
  tabPollLabel: {
    id: 'app.learningDashboard.userDetails.poll',
    description: 'Tab label for Poll',
  },
  tabQuizLabel: {
    id: 'app.poll.quiz',
    description: 'Tab label for Quiz',
  },
  tabSelectorAriaLabel: {
    id: 'app.poll.tabSelector.ariaLabel',
    description: 'ARIA label for the Quiz and Poll tab selector',
  },
});

const QuizAndPollTabSelector: React.FC<QuizAndPollTabSelectorProps> = ({ isQuiz, onTabChange }) => {
  const intl = useIntl();
  return (
    <Styled.SegmentedButtonWrapper>
      <Styled.SegmentedButtonContainer>
        <Styled.SegmentedButton id="poll" active={!isQuiz} onClick={() => onTabChange(false)}>
          {intl.formatMessage(intlMessages.tabPollLabel)}
        </Styled.SegmentedButton>
        <Styled.SegmentedButton id="quiz" active={isQuiz} onClick={() => onTabChange(true)}>
          {intl.formatMessage(intlMessages.tabQuizLabel)}
        </Styled.SegmentedButton>
      </Styled.SegmentedButtonContainer>
    </Styled.SegmentedButtonWrapper>
  );
};

export default QuizAndPollTabSelector;
