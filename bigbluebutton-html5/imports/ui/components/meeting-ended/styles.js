import styled from 'styled-components';
import {
  borderRadius,
  lgPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  colorWhite,
  colorText,
  colorBackground,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeLarge,
  headingsFontWeight,
  lineHeightComputed,
  fontSizeSmall,
  fontSizeBase,
} from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Button from '/imports/ui/components/common/button/component';

const Parent = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${colorBackground};
`;

const Modal = styled.div`
  display: flex;
  padding: ${lgPaddingX};
  background-color: ${colorWhite};
  flex-direction: column;
  border-radius: ${borderRadius};
  max-width: 95vw;
  width: 600px;
`;

const Content = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${fontSizeLarge};
  font-weight: ${headingsFontWeight};
`;

const Text = styled.div`
  color: ${colorText};
  font-weight: normal;
  padding: ${lineHeightComputed} 0;

  @media ${smallOnly} {
    font-size: ${fontSizeSmall};
  }
`;

const MeetingEndedButton = styled(Button)`
  @media ${smallOnly} {
    font-size: ${fontSizeBase};
  }
`;

const TextArea = styled.textarea`
  resize: none;
  margin: 1rem auto;
  width: 100%;

  &::placeholder {
    text-align: center;
  }
`;

export default {
  Parent,
  Modal,
  Content,
  Title,
  Text,
  MeetingEndedButton,
  TextArea,
};
