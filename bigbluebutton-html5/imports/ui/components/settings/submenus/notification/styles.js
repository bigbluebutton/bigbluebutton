import styled from 'styled-components';
import Styled from '/imports/ui/components/settings/submenus/styles';

const ToggleCol = styled(Styled.Col)`
  justify-content: flex-end;
`;

const ColHeading = styled(ToggleCol)`
  font-size: 0.9rem;
  font-weight: bold;
`;

export default {
  ToggleCol,
  ColHeading,
};
