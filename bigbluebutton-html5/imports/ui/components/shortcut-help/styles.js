import styled from 'styled-components';
import { borderSize, smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';

const KeyCell = styled.td`
  border: ${borderSize} solid ${colorGrayLighter};
  text-align: center;
  padding: ${smPaddingX};
  margin: auto;
`;

const DescCell = styled.td`
  border: ${borderSize} solid ${colorGrayLighter};
  padding: ${smPaddingX};
  margin: auto;
`;

const ShortcutTable = styled.table`
  border: ${borderSize} solid ${colorGrayLighter};
  border-collapse: collapse;
  margin: auto;
`;

export default {
  KeyCell,
  DescCell,
  ShortcutTable,
};
