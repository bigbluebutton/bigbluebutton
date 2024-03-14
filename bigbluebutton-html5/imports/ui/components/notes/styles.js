import styled from 'styled-components';
import {
  smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import CommonHeader from '/imports/ui/components/common/control-header/component';

const Notes = styled.div`
  background-color: ${colorWhite};
  padding: ${smPaddingX};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
  height: 100%;

  ${({ isChrome }) => isChrome && `
    transform: translateZ(0);
  `}

  @media ${smallOnly} {
    transform: none !important;
    &.no-padding {
      padding: 0;
    }
  }
`;

const Header = styled(CommonHeader)`
  padding-bottom: .2rem;
`;

export default {
  Notes,
  Header,
};
