import styled from 'styled-components';

import { lgPaddingY, smPaddingY, borderSize } from '/imports/ui/stylesheets/styled-components/general';
import { listItemBgHover, itemFocusBorder } from '/imports/ui/stylesheets/styled-components/palette';

const UserItemContents = styled.div`
  position: static;
  padding: .45rem;
  width: 100%;
  margin-left: .5rem;

  ${({ selected }) => selected && `
    background-color: ${listItemBgHover};
    border-top-left-radius: ${smPaddingY};
    border-bottom-left-radius: ${smPaddingY};

    &:focus {
      box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
    }
  `}

  ${({ isActionsOpen }) => !isActionsOpen && `
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
    flex-flow: column;
    flex-shrink: 0;
  `}

  ${({ isActionsOpen }) => isActionsOpen && `
    outline: transparent;
    outline-width: ${borderSize};
    outline-style: solid;
    background-color: ${listItemBgHover};
    box-shadow: inset 0 0 0 ${borderSize} ${itemFocusBorder}, inset 1px 0 0 1px ${itemFocusBorder};
    border-top-left-radius: ${smPaddingY};
    border-bottom-left-radius: ${smPaddingY};

    &:focus {
      outline-style: solid;
      outline-color: transparent !important;
    }
  `}
`;

const UserItemInnerContents = styled.div`
  flex-grow: 0;
  display: flex;
  flex-flow: row;
  padding: 3px;

  [dir="rtl"] & {
    padding: ${lgPaddingY} ${lgPaddingY} ${lgPaddingY} 0;
  }
`;

const UserAvatar = styled.div`
  flex: 0 0 2.25rem;
`;

const NoActionsListItem = styled.div`
  margin-left: 0.5rem;
  padding: .45rem;
  width: 100%;
`;

export default {
  UserItemContents,
  UserItemInnerContents,
  UserAvatar,
  NoActionsListItem,
};
