import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import Auth from '/imports/ui/services/auth';
import { ChildComponentProps } from '../room-managment-state/types';

const intlMessages = defineMessages({
  unassignedUsers: {
    id: 'app.createBreakoutRoom.unassignedUsers',
    description: 'Unassigned users label',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
});

const isMe = (intId: string) => intId === Auth.userID;

const SidebarRoomAssignment: React.FC<ChildComponentProps> = ({
  moveUser,
  rooms,
  numberOfRooms,
  setSelectedId,
  resetRooms,
}) => {
  const intl = useIntl();
  const roomPadNum = (n: number) => n.toString().padStart(2, '0');

  useEffect(() => {
    if (numberOfRooms) {
      resetRooms(numberOfRooms);
    }
  }, [numberOfRooms]);

  const dragStart = (ev: React.DragEvent<HTMLDivElement>) => {
    const el = ev.target as HTMLDivElement;
    ev.dataTransfer.setData('text', el.id);
    setSelectedId(el.id);
    const ghost = document.createElement('div');
    ghost.textContent = el.textContent || '';
    ghost.style.cssText = 'position:absolute;top:-9999px;padding:4px 8px;background:#fff;border:1px solid #ccc;border-radius:4px;font-size:0.85rem;white-space:nowrap;';
    document.body.appendChild(ghost);
    ev.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => ghost.remove());
  };

  const dragEnd = () => {
    setSelectedId('');
  };

  const allowDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
  };

  const drop = (roomNumber: number) => (ev: React.DragEvent) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text');
    const separatorIndex = data.lastIndexOf('-');
    const userId = data.substring(0, separatorIndex);
    const from = data.substring(separatorIndex + 1);
    moveUser(userId, Number(from), roomNumber);
    setSelectedId('');
  };

  const unassignedRoom = rooms[0];
  const unassignedUsers = unassignedRoom?.users || [];

  return (
    <>
      <Styled.UsersSection
        onDrop={drop(0)}
        onDragOver={allowDrop}
      >
        <Styled.UsersSectionHeader>
          <span>{intl.formatMessage(intlMessages.unassignedUsers)}</span>
          <Styled.UserCount>{roomPadNum(unassignedUsers.length)}</Styled.UserCount>
        </Styled.UsersSectionHeader>
        {unassignedUsers.length > 0 && (
          <Styled.UsersList>
            {unassignedUsers.map((user) => (
              <Styled.UserItem
                key={user.userId}
                id={`${user.userId}-0`}
                draggable
                onDragStart={dragStart}
                onDragEnd={dragEnd}
              >
                {user.name}
                {isMe(user.userId) ? ` (${intl.formatMessage(intlMessages.you)})` : ''}
              </Styled.UserItem>
            ))}
          </Styled.UsersList>
        )}
      </Styled.UsersSection>

      <Styled.RoomCardsContainer>
        {Array.from({ length: numberOfRooms }, (_, i) => i + 1).map((roomNum) => {
          const roomData = rooms[roomNum];
          const usersInRoom = roomData?.users || [];
          const roomName = roomData?.name || '';

          return (
            <Styled.RoomCard
              key={`room-card-${roomNum}`}
              onDrop={drop(roomNum)}
              onDragOver={allowDrop}
            >
              <Styled.RoomCardHeader>
                <Styled.RoomCardName>{roomName}</Styled.RoomCardName>
                <Styled.RoomCardRight>
                  <Styled.RoomCardCount>
                    {roomPadNum(usersInRoom.length)}
                  </Styled.RoomCardCount>
                  <Styled.RoomCardIcon>
                    <Icon iconName="user_list" />
                  </Styled.RoomCardIcon>
                </Styled.RoomCardRight>
              </Styled.RoomCardHeader>
              {usersInRoom.length > 0 && (
                <Styled.RoomCardUserList>
                  {usersInRoom.map((user) => (
                    <Styled.RoomCardUserItem
                      key={user.userId}
                      id={`${user.userId}-${roomNum}`}
                      draggable
                      onDragStart={dragStart}
                      onDragEnd={dragEnd}
                    >
                      {user.name}
                      {isMe(user.userId) ? ` (${intl.formatMessage(intlMessages.you)})` : ''}
                    </Styled.RoomCardUserItem>
                  ))}
                </Styled.RoomCardUserList>
              )}
            </Styled.RoomCard>
          );
        })}
      </Styled.RoomCardsContainer>
    </>
  );
};

export default SidebarRoomAssignment;
