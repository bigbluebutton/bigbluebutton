import styled from 'styled-components';
import {
  mdPaddingX, lgBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import CommonHeader from '/imports/ui/components/common/control-header/component';
import {
  HeaderContainer as BaseHeaderContainer,
  PanelContent as BasePanelContent,
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';

const HeaderContainer = styled(BaseHeaderContainer)``;

const PanelContent = styled(BasePanelContent)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Separator = styled(BaseSeparator)``;

const Notes = styled.div<{ isChrome: boolean }>`
  background-color: ${colorWhite};
  padding: ${mdPaddingX};
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
  background-color: ${colorWhite};
  padding-bottom: .2rem;
  border-radius: ${lgBorderRadius} ${lgBorderRadius} 0 0;
`;

export default {
  HeaderContainer,
  PanelContent,
  Separator,
  Notes,
  Header,
};
