import styled from 'styled-components';
import {
  colorWhiteSurface,
  colorWhite,
  colorPrimary,
  colorText,
  itemFocusBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderRadiusRounded,
  mdPaddingX,
  smPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, textFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

// $flat: out of the layout, the panels lay out as the page's own children.
const Tabs = styled.div<{ $flat: boolean }>`
  display: ${({ $flat }) => ($flat ? 'contents' : 'flex')};
  flex-direction: column;
  width: 100%;
`;

const TabList = styled.div`
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: ${smPadding};
  padding: ${mdPaddingX};
  background-color: ${colorWhiteSurface};
`;

const Tab = styled.button.attrs({ type: 'button' })<{ $selected: boolean }>`
  padding: ${mdPaddingX};
  border: 0;
  border-radius: ${borderRadiusRounded};
  /* As the settings modal's tabs on a phone: the brand ground carries the
     selection, white text keeps the label readable in both themes. */
  background-color: ${({ $selected }) => ($selected ? colorPrimary : 'transparent')};
  color: ${({ $selected }) => ($selected ? colorWhite : colorText)};
  font: inherit;
  font-size: ${fontSizeBase};
  font-weight: ${textFontWeight};
  text-align: center;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${itemFocusBorder};
    outline-offset: 2px;
  }
`;

const TabPanel = styled.div<{ $flat: boolean }>`
  ${({ $flat }) => $flat && 'display: contents;'}

  &[hidden] {
    display: none;
  }
`;

export default {
  Tabs,
  TabList,
  Tab,
  TabPanel,
};
