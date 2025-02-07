import styled from 'styled-components';
import {
  smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  colorGrayDark,
  colorPrimary,
  colorText,
  colorWhite,
  settingsModalTabSelected,
  colorBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeLarge } from '/imports/ui/stylesheets/styled-components/typography';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';
import Icon from '/imports/ui/components/common/icon/component';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const SettingsTabs = styled(Tabs)`
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  width: 100%;
  height: 100%;

  @media ${smallOnly} {
    width: 100%;
    flex-flow: column;
  }
`;

const SettingsTabList = styled(TabList)`
  display: flex;
  flex-flow: column;
  margin: 0;
  border-top: 1px solid ${colorBorder};
  border-bottom: 1px solid ${colorBorder};
  padding: 0;
  width: calc(100% / 3);
  height: 39rem;

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
  }
`;

const SettingsTabSelector = styled(Tab)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 1rem;
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

const SettingsIcon = styled(Icon)`
  margin: 0 .5rem 0 0;
  font-size: ${fontSizeLarge};

  [dir="rtl"] & {
     margin: 0 0 0 .5rem;
  }
`;

const SettingsTabPanel = styled(TabPanel)`
  display: none;
  flex-grow: 1;
  padding: 1.5rem 3rem;
  border-top: 1px solid ${colorBorder};
  border-left: 1px solid ${colorBorder};
  border-bottom: 1px solid ${colorBorder};
  width: calc(100% / 3 * 2);

  [dir="rtl"] & {
    margin: 0 1rem 0 0;
  }

  &.is-selected {
    display: block;
  }

  @media ${smallOnly} {
    width: 100%;
    margin: 0;
    padding: 0.5rem 1rem;
    border: none;
    height: auto;
    overflow: visible;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  padding: 1.5rem;
  border-top: 1px solid ${colorBorder};

  @media ${smallOnly} {
    padding: 1rem;
    gap: 1rem;
    position: relative;
    bottom: auto;
    background: transparent;
    box-shadow: none;
  }
`;

const ActionButton = styled.button`
  width: 12.75rem;
  height: 3.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 16px;
  color: #fff;

  &:first-child {
    background-color: transparent; 
    color: #ccc;
  }

  &:last-child {
    background-color: ${colorPrimary};
  }

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
  }
`;

const Modal = styled(ModalSimple)`
  padding: 0;
  border-radius: 1rem;

  @media ${smallOnly} {
    height: auto !important;
    max-height: 90vh;
    margin: 5vh auto;
    display: flex;
    flex-direction: column;
  }
`;

export default {
  ToggleLabel,
  SettingsTabs,
  SettingsTabList,
  SettingsTabSelector,
  SettingsIcon,
  SettingsTabPanel,
  ActionsContainer,
  ActionButton,
  Modal,
};
