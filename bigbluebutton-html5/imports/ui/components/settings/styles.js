import styled from 'styled-components';
import {
  smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  colorBorder,
  colorGrayDark,
  colorPrimary,
  colorText,
  colorWhite,
  colorWhiteSurface,
  settingsModalTabSelected,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeLarge,
  fontSizeMedium,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';
import Icon from '/imports/ui/components/common/icon/component';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const SettingsTabs = styled(Tabs)`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;
  min-height: 0;

  /* The modal body grows with its content; held to the modal's height
     instead, the selected panel scrolls on its own and the tab list stays. */
  div:has(> &) {
    min-height: 0;
  }

  @media ${smallOnly} {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    overflow-x: hidden;
  }
`;

// The tab list and the selected panel scroll on their own, with the app's
// scrollbar; withComponent keeps react-tabs' role on them.
const SettingsTabList = styled(ScrollboxVertical.withComponent(TabList))`
  display: flex;
  flex-flow: column;
  margin: 0;
  padding: 0;
  width: calc(100% / 3);

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

const SettingsTabSelector = styled(Tab)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: ${fontSizeMedium};
  flex: none;
  padding: 1rem;
  color: ${colorGrayDark};
  cursor: pointer;
  border-radius: 10px;
  margin-block: 0.75rem;
  margin-inline: 0 1.5rem;
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
    background: ${colorWhiteSurface};
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.2s ease;
    margin: 0 2px;
    text-overflow: ellipsis;

    &:first-child {
      border-radius: 8px 0 0 8px;
    }

    &:last-child {
      border-radius: 0 8px 8px 0;
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

const SettingsIcon = styled(Icon)`
  margin: 0 .5rem 0 0;
  font-size: ${fontSizeLarge};

  [dir="rtl"] & {
     margin: 0 0 0 .5rem;
  }
`;

const SettingsTabPanel = styled(ScrollboxVertical.withComponent(TabPanel))`
  display: none;
  flex-grow: 1;
  // BBBModal already pads the outer edge, so only the side next to the tab list gets 3rem.
  ${({ $noPadding }) => !$noPadding && 'padding-block: 1.5rem; padding-inline: 3rem 1.5rem'};
  border-left: 1px solid ${colorBorder};
  width: calc(100% / 3 * 2);

  [dir="rtl"] & {
    margin: 0 1rem 0 0;
  }

  &.is-selected {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  @media ${smallOnly} {
    width: 100%;
    margin: 0;
    padding: 0.5rem 0;
    border: none;
    height: auto;
    flex-grow: 1;
    flex-basis: 0;
    overflow-x: hidden;
  }
`;

export default {
  ToggleLabel,
  SettingsTabs,
  SettingsTabList,
  SettingsTabSelector,
  SettingsIcon,
  SettingsTabPanel,
};
