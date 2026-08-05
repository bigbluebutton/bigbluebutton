import styled from 'styled-components';
import {
  colorBorder,
  colorGrayLight,
  colorGrayLightest,
  colorOffWhite,
  colorPrimary,
  colorText,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderRadius } from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  fontSizeSmaller,
} from '/imports/ui/stylesheets/styled-components/typography';

export const PickerContainer = styled.div`
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: ${colorWhite};
  border: 1px solid ${colorBorder};
  border-radius: ${borderRadius};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
  max-height: 13.75rem;
  display: flex;
  flex-direction: column;
`;

export const PickerHeader = styled.div`
  padding: .3rem .75rem;
  font-size: ${fontSizeSmaller};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${colorGrayLight};
  border-bottom: 1px solid ${colorGrayLightest};
  background: ${colorOffWhite};
  flex-shrink: 0;
`;

export const UserList = styled.ul`
  list-style: none;
  margin: 0;
  padding: .25rem 0;
  overflow-y: auto;
  max-height: 9.5rem;
`;

interface UserItemProps {
  $active: boolean;
}

export const UserItem = styled.li<UserItemProps>`
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .3rem .75rem;
  cursor: pointer;
  font-size: ${fontSizeSmall};
  color: ${colorText};
  background: ${({ $active }) => ($active ? colorGrayLightest : 'transparent')};
  transition: background 0.1s ease;

  &:hover {
    background: ${colorGrayLightest};
  }
`;

export const UserAvatar = styled.span`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: ${colorPrimary};
  color: ${colorWhite};
  font-size: ${fontSizeSmaller};
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
`;

export const UserName = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PickerHint = styled.div`
  padding: .3rem .75rem;
  font-size: ${fontSizeSmaller};
  color: ${colorGrayLight};
  border-top: 1px solid ${colorGrayLightest};
  background: ${colorOffWhite};
  flex-shrink: 0;
`;

export const ScreenReaderStatus = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const EmptyState = styled.div`
  padding: .75rem;
  font-size: ${fontSizeSmall};
  color: ${colorGrayLight};
  text-align: center;
`;

export default {
  PickerContainer,
  PickerHeader,
  UserList,
  UserItem,
  UserAvatar,
  UserName,
  PickerHint,
  ScreenReaderStatus,
  EmptyState,
};
