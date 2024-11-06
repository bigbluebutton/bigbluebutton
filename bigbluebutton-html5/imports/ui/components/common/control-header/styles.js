import styled from 'styled-components';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { colorText } from '/imports/ui/stylesheets/styled-components/palette';

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RightWrapper = styled.div`
  & > div {
    display: flex;
  }
`;

export const Title = styled.h2`
  flex-grow: 1;
  text-align: flex-start;
  margin: 0;
  font-size: 1rem;
  color: ${colorText};
`;

export default {
  Header,
  RightWrapper,
  Title,
};
