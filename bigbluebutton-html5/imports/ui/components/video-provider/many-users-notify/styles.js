import styled from 'styled-components';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';
import { headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const Info = styled.p`
  margin: 0;
`;

const ButtonWrapper = styled.div`
display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: ${headingsFontWeight};
  color: ${colorPrimary};

  & > button {
    padding: 0 0 0 .5rem;
  }
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
