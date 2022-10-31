import styled from 'styled-components';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { colorOffWhite, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import { Tabs } from 'react-tabs';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import StyledSettings from '../settings/styles';

import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const KeyCell = styled.td`
  text-align: center;
  padding: ${smPaddingX};
  margin: auto;
  width: 6rem;
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

  > tbody > tr:nth-child(even) {
    background-color: ${colorOffWhite};
    color: ${colorPrimary};
  }
`;

const SettingsTabs = styled(Tabs)`
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  margin-top: 1rem;

  @media ${smallOnly} {
    width: 100%;
    flex-flow: column;
  }
`;

const TableWrapper = styled(ScrollboxVertical)`
  height: 50vh;
  width: 100%;
`;

const TabPanel = styled(StyledSettings.SettingsTabPanel)`
  margin-top: ${smPaddingX};

  @media ${smallOnly} {
    padding: 0;
  }
`;

export default {
  KeyCell,
  DescCell,
  ShortcutTable,
  SettingsTabs,
  TableWrapper,
  TabPanel,
};
