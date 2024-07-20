import styled from 'styled-components';

import { FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';
import {
  userListBg,
  userListText,
  colorGray,
  listItemBgHover,
  itemFocusBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingX, borderSize } from '/imports/ui/stylesheets/styled-components/general';

const UserList = styled(FlexColumn)`
  justify-content: flex-start;
  background-color: ${userListBg};
  color: ${userListText};
  height: 100%;
`;

const SmallTitle = styled.h2`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 ${smPaddingX};
  color: ${colorGray};
  flex: 1;
  margin: 0;
`;

const Messages = styled.div`
  flex-grow: 0;
  display: flex;
  flex-flow: column;
  flex-shrink: 0;
  max-height: 30vh;
`;

const ListItem = styled.div`
  display: flex;
  flex-flow: row;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  cursor: pointer;

  [dir="rtl"] & {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  &:first-child {
    margin-top: 0;
  }

  &:hover {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};
    background-color: ${listItemBgHover};
  }

  &:active,
  &:focus {
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
  }
`;

export default {
  UserList,
  SmallTitle,
  ListItem,
  Messages,
};
