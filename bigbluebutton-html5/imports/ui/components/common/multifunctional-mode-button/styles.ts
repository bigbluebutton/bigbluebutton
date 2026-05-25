import styled from 'styled-components';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';

const TriggerStyled = styled(Trigger)<{ $active?: boolean }>`
  ${({ $active }) => $active && `
    > span {
    color: ${colorPrimary};
    }
  `}
`;

export default {
  TriggerStyled,
};
