import styled from 'styled-components';
import { borderSize } from '/imports/ui/stylesheets/styled-components/general';
import { colorDanger, colorGrayDark } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
`;

const Section = styled.section<{ $sameSender: boolean }>`
  ${({ $sameSender }) => $sameSender && `
    margin-left: 2.6rem;
  `}
`;

const ChatMessageError = styled.div`
  color: ${colorDanger};
  font-size: calc(${fontSizeBase} * .75);
  color: ${colorGrayDark};
  text-align: left;
  padding: ${borderSize} 0;
  word-break: break-word;
  position: relative;
  margin-right: 0.05rem;
  margin-left: 0.05rem;
`;

export default {
  Actions,
  Section,
  ChatMessageError,
};
