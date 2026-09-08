import styled from 'styled-components';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import { lgPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${lgPaddingY};
`;

const Description = styled.span`
  font-size: ${fontSizeSmall};
`;

export default {
  Body,
  Description,
};
