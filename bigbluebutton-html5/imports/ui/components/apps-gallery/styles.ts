import styled from 'styled-components';
import {
  colorGrayLighter,
  colorPrimary,
  colorBlueAux,
  appsGalleryOutlineColor,
  unpinnedAppIconColor,
  colorWhite,
  appsPanelTextColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';
import { titlesFontWeight, textFontWeight, headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import {
  $2xlPadding,
  lgPadding,
  appsButtonsBorderRadius,
  appsPanelItemsSpacing,
  appsPanelGroupItemsSpacing,
} from '/imports/ui/stylesheets/styled-components/general';

const Content = styled.div`
  height: 100%;
  color: ${appsPanelTextColor};
  font-weight: ${textFontWeight};
  line-height: normal;`;

const Separator = styled.hr`
  margin: 1rem auto;
  width: 100%;
  border: 0;
  border-top: 1px solid ${colorGrayLighter};
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${appsPanelGroupItemsSpacing};
  flex-shrink: 0;
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
  Content,
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
