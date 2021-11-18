import styled from 'styled-components';
import {
  lgPaddingX,
  smPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorGrayLightest } from '/imports/ui/stylesheets/styled-components/palette';

const Help = styled.span`
  display: flex;
  flex-flow: column;
`;

const Text = styled.div`
  text-align: center;
  margin-bottom: ${lgPaddingX};
`;

const DialText = styled.div`
  text-align: center;
  margin-bottom: ${lgPaddingX};
  font-size: 2rem;
  direction: ltr;
`;

const ConferenceText = styled.div`
  text-align: center;
  margin-bottom: ${smPaddingY};
`;

const Telvoice = styled.div`
  text-align: center;
  font-size: 2rem;
  direction: ltr;
  margin-bottom: 0;
`;

const TipBox = styled.div`
  background-color: ${colorGrayLightest};
  padding: 1.2rem;
  margin-top: 2rem;
`;

const TipIndicator = styled.span`
  font-weight: bold;
`;

export default {
  Help,
  Text,
  DialText,
  ConferenceText,
  Telvoice,
  TipBox,
  TipIndicator,
};
