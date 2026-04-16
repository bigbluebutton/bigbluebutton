import styled from 'styled-components';
import { colorNeutral2 } from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

const EmptySearchMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: ${fontSizeSmall};
  color: ${colorNeutral2};
`;

export default {
  EmptySearchMessage,
};
