import styled from 'styled-components';
import { borderSize, smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';
import { Tabs } from 'react-tabs';

import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const KeyCell = styled.td`
  border: ${borderSize} solid ${colorGrayLighter};
  text-align: center;
  padding: ${smPaddingX};
  margin: auto;
  width: 6rem;
  min-width: 6rem;
`;

const DescCell = styled.td`
  border: ${borderSize} solid ${colorGrayLighter};
  padding: ${smPaddingX};
  margin: auto;
`;

const ShortcutTable = styled.table`
  border: ${borderSize} solid ${colorGrayLighter};
  border-collapse: collapse;
  margin: 0;
  width: 100%;
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

export default {
  KeyCell,
  DescCell,
  ShortcutTable,
  SettingsTabs,
};
