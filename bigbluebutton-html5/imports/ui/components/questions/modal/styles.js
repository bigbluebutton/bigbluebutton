import styled from 'styled-components';

import { lgPaddingX, jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';

import ModalSimple from '/imports/ui/components/common/modal/simple/component';

const Question = styled.h2`
  color: ${colorGrayDark};
  font-weight: bold;
  font-size: ${fontSizeLarge};
  text-align: center;
  padding-bottom: 2rem;
`;


const Container = styled.div`
  margin: 0 var(--modal-margin) ${lgPaddingX};
  padding: 0;
  border: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const QuestionsModal = styled(ModalSimple)`
  padding: ${jumboPaddingY};
  margin: 3rem;
`;

export default {
  QuestionsModal,
  Container,
  Question,
}
