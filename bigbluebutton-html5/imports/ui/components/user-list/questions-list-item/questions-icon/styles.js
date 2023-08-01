import styled from 'styled-components';
import { colorGrayLight } from '/imports/ui/stylesheets/styled-components/palette';

const QuestionsThumbnail = styled.div`
  display: flex;
  flex-flow: column;
  color: ${colorGrayLight};
  justify-content: center;
  font-size: 175%;
`;

const QuestionsIcon = styled.div`
  outline-style: solid;
  flex: 0 0 2.2rem;
`;

export default {
  QuestionsThumbnail,
  QuestionsIcon,
};
