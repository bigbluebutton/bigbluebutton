import styled from 'styled-components';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${jumboPaddingY};
  padding-right: 1rem;
  padding-top: 1rem;
  padding-left: 1rem;
`;

const RightWrapper = styled.div`
  & > div {
    display: flex;
  }
`;

export default {
  Header,
  RightWrapper,
};
