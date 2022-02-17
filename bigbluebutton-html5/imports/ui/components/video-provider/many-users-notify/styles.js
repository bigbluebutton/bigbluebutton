import styled from 'styled-components';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import Styled from '/imports/ui/components/breakout-room/styles';
import Button from '/imports/ui/components/common/button/component';

const Info = styled.p`
  margin: 0;
`;

const ButtonWrapper = styled(Styled.BreakoutActions)`
  background-color: inherit;

  &:focus,&:hover {
    background-color: inherit;
  }
`;

const ManyUsersButton = styled(Button)`
  flex: 0 1 48%;
  color: ${colorPrimary};
  margin: 0;
  font-weight: inherit;

  background-color: inherit;

  &:focus,&:hover {
    background-color: inherit;
  }
`;

export default {
  Info,
  ButtonWrapper,
  ManyUsersButton,
};
