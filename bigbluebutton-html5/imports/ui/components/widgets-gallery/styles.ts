import styled from 'styled-components';
import {
  colorGrayLighter,
  colorPrimary,
  colorBlueAux,
  widgetsGalleryOutlineColor,
  unpinnedWidgetIconColor,
  colorWhite,
  widgetsPanelTextColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';
import { titlesFontWeight, textFontWeight, headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';
import {
  $2xlPadding,
  lgPadding,
  widgetsButtonsBorderRadius,
  widgetsPanelItemsSpacing,
  widgetsPanelGroupItemsSpacing,
} from '/imports/ui/stylesheets/styled-components/general';

const Content = styled.div`
  height: 100%;
  color: ${widgetsPanelTextColor};
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
  gap: ${widgetsPanelGroupItemsSpacing};
  flex-shrink: 0;
`;

const PinnedWidgetsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${widgetsPanelItemsSpacing};
  width: 100%;
  font-weight: ${headingsFontWeight};
`;

const UnpinnedWidgetsWrapper = PinnedWidgetsWrapper;

const RegisteredWidgetWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0px;
  flex-grow:1;
  cursor: pointer;
`;

const WidgetTitle = styled.div`
  flex-grow: 1;
`;

const RegisteredWidgetContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  border-radius: 0px ${widgetsButtonsBorderRadius} ${widgetsButtonsBorderRadius} 0px;
  border-top: 1px solid ${widgetsGalleryOutlineColor};
  border-right: 1px solid ${widgetsGalleryOutlineColor};
  border-bottom: 1px solid ${widgetsGalleryOutlineColor};
  align-items: center;
  gap: 4px;
  padding: ${lgPadding} ${$2xlPadding};
`;

// @ts-expect-error -> Untyped component.
const OpenButton = styled(Button)<{pinned: boolean}>`
  padding: ${$2xlPadding};
  border-radius: ${widgetsButtonsBorderRadius} 0px 0px ${widgetsButtonsBorderRadius};
  
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

const PinWidget = styled.div<{pinned: boolean}>`
  color: ${colorPrimary};
  cursor: pointer;
  > i {
    font-size: 120%;
    color: ${({ pinned }) => (pinned ? colorPrimary : unpinnedWidgetIconColor)};
  }
`;

const BoldText = styled.span`
  font-weight: ${titlesFontWeight};
`;

export default {
  Content,
  Separator,
  Wrapper,
  PinnedWidgetsWrapper,
  UnpinnedWidgetsWrapper,
  RegisteredWidgetWrapper,
  WidgetTitle,
  RegisteredWidgetContent,
  OpenButton,
  PinWidget,
  BoldText,
};
