import styled from 'styled-components';
import { colorText } from '/imports/ui/stylesheets/styled-components/palette';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${({ bottomless }) => (!bottomless && `
    padding-bottom: ${jumboPaddingY};
  `)}
`;

const RightWrapper = styled.div`
  display: flex;
  align-items: center;
  
  & > div {
    display: flex;
    align-items: center;
  }
`;

export const Title = styled.h2`
  flex-grow: 1;
  text-align: flex-start;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: normal;
  color: ${colorText};
  text-transform: uppercase;
`;

export default {
  Header,
  RightWrapper,
  Title,
};
