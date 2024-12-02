import styled from 'styled-components';
import {
  smPaddingX,
  smPaddingY,
  mdPaddingY,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  colorGrayDark,
  colorPrimary,
  colorWhite,
  colorText,
  colorBlueLighter,
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
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 0;
  width: calc(100% / 3);

  @media ${smallOnly} {
    width: 100%;
    flex-flow: row;
    flex-wrap: wrap;
    justify-content: center;
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
    max-width: 100%;
    margin: 0 ${smPaddingX} 0 0;
    & > i {
      display: none;
    }

    [dir="rtl"] & {
       margin: 0 0 0 ${smPaddingX};
    }
  }

  &.is-selected {
    color: ${colorText};
    background-color: ${colorBlueLighter};
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
  border-top: 1px solid #ddd;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
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
    padding-left: 1rem;
    padding-right: 1rem;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #ccc;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: #fff;

  &:first-child {
    background-color: #007bff;
  }

  &:last-child {
    background-color: #dc3545;
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
