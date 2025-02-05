import styled from 'styled-components';
import {
  lgPaddingY,
  smPaddingY,
  borderSize,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  listItemBgHover,
  itemFocusBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import UserAvatar from '/imports/ui/components/user-avatar/component';

interface AvatarProps {
  moderator?: boolean;
  presenter?: boolean;
  talking?: boolean;
  color?: string;
  animations?: boolean;
  emoji?: boolean;
  avatar?: string;
  isSkeleton?: boolean;
}

interface UserItemContentsProps {
  selected?: boolean;
  isActionsOpen?: boolean;
}

const UserItemContents = styled.div<UserItemContentsProps>`
  position: static;
  padding-right: 0.5rem;
  width: 100%;
  overflow: hidden;

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

    [dir="rtl"] & {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }

    &:first-child {
      margin-top: 0;
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

  flex-grow: 0;
  display: flex;
  flex-flow: row;
  border: 3px solid transparent;

  [dir="rtl"] & {
    padding: ${lgPaddingY} ${lgPaddingY} ${lgPaddingY} 0;
  }
`;

// ===== avatar =====

const Avatar = styled(UserAvatar)<AvatarProps>`
  position: relative;
  text-align: center;
  font-size: .85rem;
  border: 2px solid transparent;
  user-select: none;
  width: 3.5rem;
  min-width: 3.5rem;
  height: 3.5rem;
  min-height: 3.5rem;
`;

// ======================== Icon Right Container ========================

const IconRightContainer = styled.div`
  margin: .25rem;  
`;

export default {
  Avatar,
  UserItemContents,
  IconRightContainer,
};
