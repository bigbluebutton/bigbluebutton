import styled from 'styled-components';
import {
  colorPrimary,
  colorBlueAux,
  appsGalleryOutlineColor,
  unpinnedAppIconColor,
  colorWhite,
  colorBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import { titlesFontWeight, headingsFontWeight, fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import {
  $2xlPadding,
  lgPadding,
  appsButtonsBorderRadius,
  borderRadiusRounded,
  appsPanelItemsSpacing,
  appsPanelGroupItemsSpacing,
  contentSidebarPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  PanelContent as BasePanelContent,
  Separator as BaseSeparator,
} from '/imports/ui/components/sidebar-content/styles';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const PanelContent = styled(BasePanelContent)``;

const Separator = styled(BaseSeparator)``;

const Wrapper = styled(ScrollboxVertical)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${appsPanelGroupItemsSpacing};
  padding: ${contentSidebarPadding};
  flex-grow: 1;
  margin: 0px 0.25rem;
`;

const PinnedAppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${appsPanelItemsSpacing};
  width: 100%;
  font-weight: ${headingsFontWeight};
`;

const UnpinnedAppsWrapper = PinnedAppsWrapper;

const AppTitle = styled.div`
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RegisteredAppContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  border-radius: ${appsButtonsBorderRadius};
  border-top: 1px solid ${colorBorder};
  border-right: 1px solid ${colorBorder};
  border-bottom: 1px solid ${colorBorder};
  align-items: center;
`;

const OpenButton = styled.span<{$pinned: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${$2xlPadding};
  border-radius: ${appsButtonsBorderRadius} 0px 0px ${appsButtonsBorderRadius};

  ${({ $pinned }) => ($pinned ? `
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

const ClickableArea = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  justify-content: flex-start;
  align-items: center;
  gap: ${lgPadding};
  cursor: pointer;
  overflow: hidden;

  &:hover > ${OpenButton} {
    filter: brightness(90%);
    background-color: ${colorPrimary};
    color: ${colorWhite};
  }
`;

const PinApp = styled.div<{pinned: boolean}>`
  color: ${colorPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: ${lgPadding};
  padding: 0.5rem;
  cursor: pointer;

  > i {
    font-size: 120%;
    color: ${({ pinned }) => (pinned ? colorPrimary : unpinnedAppIconColor)};
  }

  &:hover {
    background-color: ${appsGalleryOutlineColor};
  }
`;

const DescWrapper = styled.div`
  padding: 0 ${contentSidebarPadding} 0;
`;

const BoldText = styled.span`
  font-weight: ${titlesFontWeight};
`;

const NewLabel = styled.span`
  background-color: ${colorPrimary};
  color: ${colorWhite};
  padding: 0.1rem 0.75rem;
  border-radius: 10px;
  font-size: ${fontSizeBase};
  text-transform: uppercase;
  flex-shrink: 1;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem ${contentSidebarPadding};
  padding: 0.4rem 0.75rem;
  border: 1px solid ${colorBorder};
  border-radius: ${borderRadiusRounded};
  background-color: ${colorWhite};

  > i {
    color: ${unpinnedAppIconColor};
    font-size: 115%;
    flex-shrink: 0;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: ${fontSizeBase};
  color: inherit;

  &::placeholder {
    color: ${unpinnedAppIconColor};
  }
`;

const SectionSeparator = styled.hr`
  width: calc(100% - 2 * ${contentSidebarPadding});
  border: none;
  border-top: 1px solid ${colorBorder};
  margin: 0;
  align-self: center;
`;

export default {
  PanelContent,
  Separator,
  Wrapper,
  PinnedAppsWrapper,
  UnpinnedAppsWrapper,
  AppTitle,
  RegisteredAppContent,
  OpenButton,
  PinApp,
  ClickableArea,
  DescWrapper,
  BoldText,
  NewLabel,
  SearchWrapper,
  SearchInput,
  SectionSeparator,
};
