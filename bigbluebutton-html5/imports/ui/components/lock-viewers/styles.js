import styled from 'styled-components';
import { styled as materialStyled } from '@mui/material/styles';
import {
  Checkbox,
  Select,
  Switch,
} from '@mui/material';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';
import {
  colorGray,
  colorGrayDark,
  colorGrayLabel,
  colorPrimary,
  colorText,
  colorWhite,
  colorBorder,
  settingsModalTabSelected,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase, fontSizeLarger } from '/imports/ui/stylesheets/styled-components/typography';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Icon from '/imports/ui/components/common/icon/component';

const LockViewersModal = styled(ModalSimple)`
  padding: 0;
  border-radius: 1rem;
  min-width: 55rem;

  @media ${smallOnly} {
    min-width: auto;
    width: 100%;
  }

  & > div {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  & > div > div:last-child {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
`;

const SettingsTabs = styled(Tabs)`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: hidden;

  @media ${smallOnly} {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    overflow-x: hidden;
  }
`;

const SettingsTabList = styled(TabList)`
  display: flex;
  flex-flow: column;
  margin: 0;
  border-top: 1px solid ${colorBorder};
  padding: 0;
  width: calc(100% / 3);
  min-height: 28rem;

  @media ${smallOnly} {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    height: auto;
    min-height: auto;
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
  font-size: 1.125rem;
  flex: none;
  padding: 0.85rem;
  color: ${colorGrayDark};
  cursor: pointer;
  border-radius: 10px;
  margin: 0.75rem 1.25rem;
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
    font-size: 0.8rem;
    min-height: 3rem;
    border-radius: 8px;
    background: ${colorWhite};
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    &.is-selected {
      background: ${colorPrimary};
      color: ${colorWhite};
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
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const TabIcon = styled(Icon)`
  margin: 0 0.5rem 0 0;
  font-size: ${fontSizeLarger};

  [dir="rtl"] & {
    margin: 0 0 0 0.5rem;
  }
`;

const SettingsTabPanel = styled(TabPanel)`
  display: none;
  flex-grow: 1;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${colorBorder};
  border-left: 1px solid ${colorBorder};
  border-bottom: 1px solid ${colorBorder};
  width: calc(100% / 3 * 2);
  min-height: 35rem;
  overflow-y: auto;

  [dir="rtl"] & {
    border-left: none;
    border-right: 1px solid ${colorBorder};
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
`;

const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  color: ${colorGrayDark};
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const SectionDescription = styled.p`
  color: ${colorGrayLabel};
  font-size: ${fontSizeBase};
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
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
  }
`;

const ActionButton = styled.button`
  width: 10rem;
  height: 3rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 1rem;
  background-color: transparent;
  color: ${colorGrayLabel};

  &:hover {
    opacity: 0.8;
  }
`;

const ActionButtonPrimary = styled(ActionButton)`
  width: 10.75rem;
  background-color: ${colorPrimary};
  color: ${colorWhite};

  &:hover {
    opacity: 0.9;
  }
`;

const GuestPolicySelector = styled(Select)`
  height: 2.75rem;
  border-radius: 0.5rem !important;
  width: 100%;
  margin-top: 0.25rem;

  fieldset {
    border-color: ${colorBorder} !important;
  }
`;

const LobbyMessageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const SwitchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SwitchLabel = styled.span`
  color: ${colorText};
  font-size: ${fontSizeBase};
  cursor: pointer;
  user-select: none;
`;

const MaterialSwitch = materialStyled(Switch)(({ theme }) => ({
  width: '2.3rem',
  height: '1.2rem',
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(1.2rem)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: '0.2rem',
    '&.Mui-checked': {
      transform: 'translateX(1.2rem)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: colorPrimary,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: '0.6rem',
    height: '0.6rem',
    borderRadius: '0.5rem',
    transition: theme.transitions.create(['width'], { duration: 200 }),
    transform: 'translateY(1px)',
  },
  '& .MuiSwitch-track': {
    borderRadius: '0.6rem',
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
  },
}));

const LobbyInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid ${colorBorder};
`;

const LobbyInput = styled.input`
  flex: 1;
  border: none;
  padding: 0.75rem 1rem;
  font-size: ${fontSizeBase};
  outline: none;
  background: ${colorWhite};
  color: ${colorText};

  &::placeholder {
    color: ${colorGrayLabel};
  }
`;

const LobbyInputSendButton = styled.button`
  background: ${colorPrimary};
  color: ${colorWhite};
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.9;
  }
`;

const CheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CheckboxLabel = styled.span`
  color: ${colorText};
  font-size: ${fontSizeBase};
  cursor: pointer;
  user-select: none;
`;

const MaterialCheckbox = materialStyled(Checkbox)({
  padding: '0.3rem',
  color: colorGray,
  '&.Mui-checked': {
    color: colorPrimary,
  },
});

const PresentationPolicySelector = styled(Select)`
  height: 2.75rem;
  border-radius: 0.5rem !important;
  width: 100%;
  margin-top: 0.25rem;

  fieldset {
    border-color: ${colorBorder} !important;
  }
`;

const PresentationMenuItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const TooltipIcon = styled.span`
  color: ${colorGrayLabel};
  cursor: help;
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 0.5rem;

  &:hover {
    color: ${colorPrimary};
  }
`;

export default {
  LockViewersModal,
  SettingsTabs,
  SettingsTabList,
  SettingsTabSelector,
  TabIcon,
  SettingsTabPanel,
  TabContent,
  SectionTitle,
  SectionDescription,
  ActionsContainer,
  ActionButton,
  ActionButtonPrimary,
  GuestPolicySelector,
  LobbyMessageSection,
  SwitchRow,
  SwitchLabel,
  MaterialSwitch,
  LobbyInputWrapper,
  LobbyInput,
  LobbyInputSendButton,
  CheckboxList,
  CheckboxRow,
  CheckboxLabel,
  MaterialCheckbox,
  PresentationPolicySelector,
  PresentationMenuItem,
  TooltipIcon,
};
