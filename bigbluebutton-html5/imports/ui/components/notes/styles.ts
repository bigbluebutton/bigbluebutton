import styled from 'styled-components';
import {
  mdPaddingX, lgBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import CommonHeader from '/imports/ui/components/common/control-header/component';
import {
  PanelContent as BasePanelContent,
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';

const PanelContent = styled(BasePanelContent)<{isOnMediaArea: boolean, isHidden: boolean}>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  ${({ isOnMediaArea, isHidden }) => {
    if (isOnMediaArea) return 'position: absolute;';
    if (isHidden) return 'padding: 0; display: none;';
    return '';
  }}
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
  padding-left: ${mdPaddingX};
  border-radius: ${lgBorderRadius} ${lgBorderRadius} 0 0;
`;

export default {
  PanelContent,
  Separator,
  Notes,
  Header,
};
