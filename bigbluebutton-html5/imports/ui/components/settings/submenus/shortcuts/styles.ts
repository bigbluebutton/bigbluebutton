import styled from 'styled-components';
import {
  Tab,
  Tabs,
  TabPanel,
  TabList,
} from 'react-tabs';
import Icon from '/imports/ui/components/common/icon/component';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import {
  colorGrayDark,
  colorOffWhite,
  colorPrimary,
  colorText,
  colorWhite,
  settingsModalTabSelected,
} from '/imports/ui/stylesheets/styled-components/palette';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';

const KeyCell = styled.td`
  text-align: center;
  padding: ${smPaddingX};
  margin: auto;
  min-width: 6rem;
`;

const DescCell = styled.td`
  padding: ${smPaddingX};
  margin: auto;
`;

const ShortcutTable = styled.table`
  border-collapse: collapse;
  margin: 0;
  width: 100%;
  font-size: 1.125rem;

  > tbody > tr:nth-child(even) {
    background-color: ${colorOffWhite};
    color: ${colorPrimary};
  }
`;

const ShortcutsTabs = styled(Tabs)`
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  flex: 1;
  min-height: 0;

  @media ${smallOnly} {
    width: 100%;
    flex-flow: column;
  }
`;

const ShortcutsTabList = styled(TabList)`
  display: flex;
  flex-flow: column;
  margin-top: 1rem;
  padding: 0;
  width: calc(100% / 3);
  height: 100%;
  overflow-y: auto;

  @media ${smallOnly} {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    height: auto;
    border: none;
    padding: 0;
    margin: 0 0 0.5rem 0;
    background: transparent;
    overflow-y: hidden;
  }
`;

const ShortcutsTabSelector = styled(Tab)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 1.125rem;
  flex: none;
  padding: 1rem;
  color: ${colorGrayDark};
  cursor: pointer;
  border-radius: 10px;
  margin: 1rem 1.5rem;
  transition: background-color 0.3s, color 0.3s;

  & > span {
    min-width: 0;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media ${smallOnly} {
    margin: 0;
    padding: 0.5rem;
    font-size: 0.85rem;
    min-height: 3rem;
    border-radius: 8px;
    background: ${colorWhite};
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
    margin: 0 2px;
    text-overflow: ellipsis;

    &:first-child {
      border-radius: 8px 0 0 8px;
      margin-left: 0.5rem;
    }

    &:last-child {
      border-radius: 0 8px 8px 0;
      margin-right: 0.5rem;
    }

    &.is-selected {
      background: ${colorPrimary};
      color: ${colorWhite};
      z-index: 2;
      transform: scale(1.02);
    }

    & > span {
      -webkit-line-clamp: 2;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &.is-selected {
    color: ${colorText};
    background-color: ${settingsModalTabSelected};
    font-weight: bold;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ShortcutsTabIcon = styled(Icon)`
  margin: 0 .5rem 0 0;
  font-size: ${fontSizeLarge};

  [dir="rtl"] & {
     margin: 0 0 0 .5rem;
  }
`;

const TableWrapper = styled(ScrollboxVertical)`
  flex-grow: 1;
  min-height: 0;
  width: 100%;
`;

const ShortcutsTabPanel = styled(TabPanel)`
  display: none;
  flex-grow: 1;
  width: calc(100% / 3 * 2);
  height: 100%;
  padding: 1.5rem;

  [dir="rtl"] & {
    margin: 0 1rem 0 0;
  }

  &.is-selected {
    display: flex;
    flex-direction: column;
  }

  @media ${smallOnly} {
    width: 100%;
    margin: 0;
    padding: 0.5rem 1rem;
    border: none;
    height: auto;
    flex-grow: 1;
    flex-basis: 0;
    overflow-x: hidden;
  }
  @media ${smallOnly} {
    padding: 0;
  }
`;

const ColumnTitle = styled.th<{alignStart?: boolean}>`
  ${({ alignStart }) => (alignStart ? 'text-align: left;' : 'text-align: center;')}
`;

export default {
  KeyCell,
  DescCell,
  ShortcutTable,
  Tabs: ShortcutsTabs,
  TabList: ShortcutsTabList,
  TabSelector: ShortcutsTabSelector,
  TabIcon: ShortcutsTabIcon,
  TableWrapper,
  TabPanel: ShortcutsTabPanel,
  ColumnTitle,
};
