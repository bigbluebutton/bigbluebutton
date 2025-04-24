import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const IconWrapper = styled.div`
  width: 1.025rem;
  height: 1.025rem;
`;

const ButtonWrapper = styled.div`
  @media ${smallOnly} {
  margin: 0 0 0 .3rem;
}
  margin: 0 .5rem;
`;

export default {
  IconWrapper,
  ButtonWrapper,
};
