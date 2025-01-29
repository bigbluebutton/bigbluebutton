import styled from 'styled-components';
import {
  colorPrimary,
  colorBlueAux,
  appsGalleryOutlineColor,
  unpinnedAppIconColor,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';
import { titlesFontWeight, headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import {
  $2xlPadding,
  lgPadding,
  appsButtonsBorderRadius,
  appsPanelItemsSpacing,
  appsPanelGroupItemsSpacing,
  contentSidebarPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  HeaderContainer as BaseHeaderContainer,
  PanelContent as BasePanelContent,
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';

const HeaderContainer = styled(BaseHeaderContainer)``;

const PanelContent = styled(BasePanelContent)``;

const Separator = styled(BaseSeparator)``;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${appsPanelGroupItemsSpacing};
  flex-shrink: 0;
  padding: ${contentSidebarPadding};
`;

const PinnedAppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${appsPanelItemsSpacing};
  width: 100%;
  font-weight: ${headingsFontWeight};
`;

const UnpinnedAppsWrapper = PinnedAppsWrapper;

const RegisteredAppWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0px;
  flex-grow:1;
  cursor: pointer;
`;

const AppTitle = styled.div`
  flex-grow: 1;
`;

const RegisteredAppContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  border-radius: 0px ${appsButtonsBorderRadius} ${appsButtonsBorderRadius} 0px;
  border-top: 1px solid ${appsGalleryOutlineColor};
  border-right: 1px solid ${appsGalleryOutlineColor};
  border-bottom: 1px solid ${appsGalleryOutlineColor};
  align-items: center;
  gap: 4px;
  padding: ${lgPadding} ${$2xlPadding};
`;

// @ts-expect-error -> Untyped component.
const OpenButton = styled(Button)<{pinned: boolean}>`
  padding: ${$2xlPadding};
  border-radius: ${appsButtonsBorderRadius} 0px 0px ${appsButtonsBorderRadius};
  
  ${({ pinned }) => (pinned ? `
    background-color: ${colorPrimary};
    color: ${colorWhite};
  ` : `
    background-color: ${colorBlueAux};
    color: ${colorPrimary};
  `)}

  > i {
    font-size: 175%;
  }
`;

const PinApp = styled.div<{pinned: boolean}>`
  color: ${colorPrimary};
  cursor: pointer;
  > i {
    font-size: 120%;
    color: ${({ pinned }) => (pinned ? colorPrimary : unpinnedAppIconColor)};
  }
`;

const BoldText = styled.span`
  font-weight: ${titlesFontWeight};
`;

export default {
  HeaderContainer,
  PanelContent,
  Separator,
  Wrapper,
  PinnedAppsWrapper,
  UnpinnedAppsWrapper,
  RegisteredAppWrapper,
  AppTitle,
  RegisteredAppContent,
  OpenButton,
  PinApp,
  BoldText,
};
