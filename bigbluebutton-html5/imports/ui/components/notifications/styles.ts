import styled from 'styled-components';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const TitleMessage = styled.div`
  font-weight: bold;
  font-size: ${fontSizeBase};
`;

const ContentMessage = styled.div`
  margin-top: 0.5rem;
`;

export default {
  TitleMessage,
  ContentMessage,
};
