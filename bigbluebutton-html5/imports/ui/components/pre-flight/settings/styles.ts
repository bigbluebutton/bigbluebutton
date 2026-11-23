import styled from 'styled-components';
import { colorBorder } from '/imports/ui/stylesheets/styled-components/palette';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Footer = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: ${jumboPaddingY};
  padding: ${jumboPaddingY};
  border-top: 1px solid ${colorBorder};
`;

export default {
  Footer,
};
