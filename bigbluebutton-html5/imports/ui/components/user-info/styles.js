import styled from 'styled-components';
import { mdPaddingX, borderSize } from '/imports/ui/stylesheets/styled-components/general';
import { colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';

const KeyCell = styled.td`
  padding: ${mdPaddingX};
  border: ${borderSize} solid ${colorGrayLighter};
`;

const ValueCell = styled.td`
  padding: ${mdPaddingX};
  border: ${borderSize} solid ${colorGrayLighter};
`;

const UserInfoTable = styled.table`
  border: ${borderSize} solid ${colorGrayLighter};
  border-collapse: collapse;
  border: none;

  width: 90%;
  margin: auto;

  table-layout: fixed;

  & > td {
    word-wrap: break-word;
  }`;

export default {
  KeyCell,
  ValueCell,
  UserInfoTable,
};
