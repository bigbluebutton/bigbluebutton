import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import MenuItem from '@mui/material/MenuItem';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import Auth from '/imports/ui/services/auth';
import { ChildComponentProps } from '../room-managment-state/types';
import { useDragAndDrop, useRoverNavigation } from '../../hooks';

const intlMessages = defineMessages({
  unassignedUsers: {
    id: 'app.createBreakoutRoom.unassignedUsers',
    description: 'Unassigned users label',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  unassignUser: {
    id: 'app.update.resetRoom',
    description: 'Remove user from room',
  },
  currentSlide: {
    id: 'app.createBreakoutRoom.currentSlideLabel',
    description: 'Current slide label for presentation selector',
  },
});

const isMe = (intId: string) => intId === Auth.userID;

const SidebarRoomAssignment: React.FC<ChildComponentProps> = ({
  moveUser,
  rooms,
  numberOfRooms,
  setSelectedId,
  resetRooms,
  changeRoomName,
  presentations,
  getRoomPresentation,
  setRoomPresentations,
  currentSlidePrefix,
  currentPresentation,
}) => {
  const intl = useIntl();
  const roomPadNum = (n: number) => n.toString().padStart(2, '0');
  const [editingRoom, setEditingRoom] = useState<number | null>(null);

  const changeRoomPresentation = (roomNum: number) => (ev: { target: { value: unknown } }) => {
    setRoomPresentations((prev) => ({
      ...prev,
      [roomNum]: ev.target.value as string,
    }));
  };

  useEffect(() => {
    if (numberOfRooms) {
      resetRooms(numberOfRooms);
    }
  }, [numberOfRooms, resetRooms]);

  const {
    dragStart, dragEnd, allowDrop, drop,
  } = useDragAndDrop(moveUser, setSelectedId);

  const rover = useRoverNavigation('draggableUser', moveUser, numberOfRooms);

  const unassignedRoom = rooms[0];
  const unassignedUsers = unassignedRoom?.users || [];

  return (
    <>
      <Styled.UsersSection
        id="breakoutBox-0"
        onDrop={drop(0)}
        onDragOver={allowDrop}
        tabIndex={0}
        onKeyDown={rover}
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
                data-test="draggableUser"
                draggable
                tabIndex={-1}
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
              id={`breakoutBox-${roomNum}`}
              key={`room-card-${roomNum}`}
              onDrop={drop(roomNum)}
              onDragOver={allowDrop}
              tabIndex={0}
              onKeyDown={rover}
            >
              <Styled.RoomCardHeader>
                {editingRoom === roomNum ? (
                  <Styled.RoomNameInput
                    value={roomName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      changeRoomName(roomNum, e.target.value);
                    }}
                    onBlur={() => setEditingRoom(null)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === 'Escape') setEditingRoom(null);
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    data-test={`roomName-${roomNum}`}
                  />
                ) : (
                  <Styled.RoomCardName
                    onClick={() => setEditingRoom(roomNum)}
                    style={{ cursor: 'pointer' }}
                    data-test={`${roomName}`}
                  >
                    {roomName}
                  </Styled.RoomCardName>
                )}
                <Styled.RoomCardRight>
                  <Styled.RoomCardCount>
                    {roomPadNum(usersInRoom.length)}
                  </Styled.RoomCardCount>
                  <Styled.RoomCardIcon>
                    <Icon iconName="user_list" />
                  </Styled.RoomCardIcon>
                </Styled.RoomCardRight>
              </Styled.RoomCardHeader>
              {presentations.length > 1 && (
                <Styled.PresentationSelect
                  value={getRoomPresentation(roomNum)}
                  onChange={changeRoomPresentation(roomNum)}
                  data-test={`changeSlideBreakoutRoom${roomNum}`}
                  size="small"
                  displayEmpty
                >
                  {currentPresentation && (
                    <MenuItem
                      key="current-slide"
                      value={`${currentSlidePrefix}${currentPresentation}`}
                    >
                      {intl.formatMessage(intlMessages.currentSlide)}
                    </MenuItem>
                  )}
                  {presentations.map((presentation) => (
                    <MenuItem
                      key={presentation.presentationId}
                      value={presentation.presentationId}
                    >
                      {presentation.name}
                    </MenuItem>
                  ))}
                </Styled.PresentationSelect>
              )}
              {usersInRoom.length > 0 && (
                <Styled.RoomCardUserList>
                  {usersInRoom.map((user) => (
                    <Styled.RoomCardUserItem
                      key={user.userId}
                      id={`${user.userId}-${roomNum}`}
                      data-test="draggableUser"
                      draggable
                      tabIndex={-1}
                      onDragStart={dragStart}
                      onDragEnd={dragEnd}
                    >
                      <span>
                        {user.name}
                        {isMe(user.userId) ? ` (${intl.formatMessage(intlMessages.you)})` : ''}
                      </span>
                      <Styled.UserRemoveBtn
                        type="button"
                        aria-label={intl.formatMessage(intlMessages.unassignUser)}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveUser(user.userId, roomNum, 0);
                        }}
                      >
                        ✕
                      </Styled.UserRemoveBtn>
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
