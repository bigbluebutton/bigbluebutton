import styled from 'styled-components';
import OriginalIcon from '/imports/ui/components/common/icon/icon-ts/component';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const Separator = styled.div<{ actionsBar?: boolean }>`
  width: 10px; 
  height: 100%;
  ${({ actionsBar }) => actionsBar && `
    height: 2.5rem;
    width: 0;
    border: 1px solid ${colorWhite};
    align-self: center;
    opacity: .75;
  `}
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  width: 3rem;
`;

const Icon = styled(OriginalIcon)`
  width: 1em;
  height: 1em;
  text-align: center;
  font-size: 125%;
  color: ${colorWhite};

  &:before {
    width: 1em;
    height: 1em;
  }
`;

export default {
  Separator,
  IconContainer,
  Icon,
};
