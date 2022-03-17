import styled from 'styled-components';
import {
  colorWhite,
  colorBackground,
  colorGrayLighter,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import Button from '/imports/ui/components/common/button/component';

const Background = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: ${colorBackground};
  color: ${colorWhite};
  text-align: center;
`;

const CodeError = styled.h1`
  margin: 0;
  font-size: 3rem;
  color: ${colorWhite};
`;

const Message = styled.h1`
  margin: 0;
  color: ${colorWhite};
  font-size: 1.25rem;
  font-weight: 400;
`;

const Separator = styled.div`
  height: 0;
  width: 5rem;
  border: 1px solid ${colorGrayLighter};
  margin: 1.5rem 0 1.5rem 0;
  align-self: center;
  opacity: .75;
`;

const SessionMessage = styled.div`
  margin: 0;
  color: ${colorWhite};
  font-size: ${fontSizeBase};
  font-weight: 400;
  margin-bottom: 1.5rem;
`;

const ReloadButton = styled(Button)`
  min-width: 9rem;
  height: 2rem;
`;

export default {
  Background,
  CodeError,
  Message,
  Separator,
  SessionMessage,
  ReloadButton,
};
