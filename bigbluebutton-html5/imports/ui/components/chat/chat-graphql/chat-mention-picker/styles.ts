import styled from 'styled-components';
import {
  colorGrayLighter,
  colorGrayLightest,
  colorOffWhite,
  colorPrimary,
  colorText,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';

export const PickerContainer = styled.div`
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  background: ${colorWhite};
  border: 1px solid ${colorGrayLighter};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
  max-height: 220px;
  display: flex;
  flex-direction: column;
`;

export const PickerHeader = styled.div`
  padding: 6px 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${colorGrayLighter};
  border-bottom: 1px solid ${colorGrayLightest};
  background: ${colorOffWhite};
  flex-shrink: 0;
`;

export const UserList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 4px 0;
  overflow-y: auto;
  flex: 1;
`;

interface UserItemProps {
  $active: boolean;
}

export const UserItem = styled.li<UserItemProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${colorText};
  background: ${({ $active }) => ($active ? colorGrayLightest : 'transparent')};
  transition: background 0.1s ease;

  &:hover {
    background: ${colorGrayLightest};
  }
`;

export const UserAvatar = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${colorPrimary};
  color: ${colorWhite};
  font-size: 0.7rem;
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

export const EmptyState = styled.div`
  padding: 12px;
  font-size: 0.875rem;
  color: ${colorGrayLighter};
  text-align: center;
`;

export default {
  PickerContainer,
  PickerHeader,
  UserList,
  UserItem,
  UserAvatar,
  UserName,
  EmptyState,
};
