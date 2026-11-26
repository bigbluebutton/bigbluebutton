import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import MenuItem from '@mui/material/MenuItem';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import BBBMenu from '/imports/ui/components/common/menu/component';
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
  renameRoom: {
    id: 'app.createBreakoutRoom.renameRoom',
    description: 'Accessible label for the room name edit button',
  },
  roomNameLabel: {
    id: 'app.createBreakoutRoom.roomNameLabel',
    description: 'Accessible label for the room name input',
  },
  moveUserMenu: {
    id: 'app.createBreakoutRoom.moveUserMenu',
    description: 'Accessible label for the move participant menu',
  },
  moveToRoom: {
    id: 'app.createBreakoutRoom.moveToRoom',
    description: 'Move participant to breakout room menu item',
  },
  moveToUnassignedUsers: {
    id: 'app.createBreakoutRoom.moveToUnassignedUsers',
    description: 'Move participant to the unassigned users list menu item',
  },
  keyboardInstructions: {
    id: 'app.createBreakoutRoom.keyboardInstructions',
    description: 'Keyboard instructions for assigning participants before breakout rooms start',
  },
});

const KEYBOARD_INSTRUCTIONS_ID = 'breakout-room-assignment-keyboard-instructions';

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
  const [openMoveMenu, setOpenMoveMenu] = useState<string | null>(null);
  const roomNameRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const pendingFocusId = useRef<string | null>(null);
  const restoreRoomNameFocus = useRef(false);
  const editedRoomNumber = useRef<number | null>(null);

  useEffect(() => {
    if (editingRoom === null && restoreRoomNameFocus.current) {
      restoreRoomNameFocus.current = false;
      if (editedRoomNumber.current !== null) roomNameRefs.current[editedRoomNumber.current]?.focus();
      editedRoomNumber.current = null;
    }
  }, [editingRoom]);

  useEffect(() => {
    if (!pendingFocusId.current) return;
    const element = document.getElementById(pendingFocusId.current);
    if (element) {
      element.focus();
      pendingFocusId.current = null;
    }
  }, [rooms]);

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

  const rememberMoveFocus = useCallback((userId: string, _from: number, to: number) => {
    pendingFocusId.current = `${userId}-${to}`;
  }, []);

  const moveUserAndKeepFocus = useCallback((userId: string, from: number, to: number) => {
    pendingFocusId.current = `${userId}-${to}`;
    moveUser(userId, from, to);
  }, [moveUser]);

  const rover = useRoverNavigation(
    'draggableUser',
    moveUser,
    numberOfRooms,
    rememberMoveFocus,
  );

  const openMenuFromRow = (event: React.KeyboardEvent, rowId: string) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      setOpenMoveMenu(rowId);
    } else if (event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const openMenuFromRowKeyUp = (event: React.KeyboardEvent, rowId: string) => {
    if (event.key === ' ' && event.target === event.currentTarget) {
      event.preventDefault();
      event.stopPropagation();
      setOpenMoveMenu(rowId);
    }
  };

  const closeMoveMenu = (rowId: string) => {
    setOpenMoveMenu(null);
    requestAnimationFrame(() => {
      const focusId = pendingFocusId.current || rowId;
      document.getElementById(focusId)?.focus();
    });
  };

  const moveMenuActions = (userId: string, from: number) => Array.from(
    { length: numberOfRooms + 1 },
    (_, roomNum) => roomNum,
  ).filter((roomNum) => roomNum !== from).map((roomNum) => ({
    key: `${userId}-${roomNum}`,
    label: roomNum === 0
      ? intl.formatMessage(intlMessages.moveToUnassignedUsers)
      : intl.formatMessage(intlMessages.moveToRoom, {
        roomName: rooms[roomNum]?.name || '',
      }),
    dataTest: roomNum === 0 ? 'moveUserToUnassigned' : `moveUserToRoom${roomNum}`,
    onClick: () => moveUserAndKeepFocus(userId, from, roomNum),
  }));

  const participantLabel = (name: string, userId: string, roomName: string) => (
    `${name}${isMe(userId) ? ` (${intl.formatMessage(intlMessages.you)})` : ''}, ${roomName}`
  );

  const unassignedRoom = rooms[0];
  const unassignedUsers = unassignedRoom?.users || [];

  return (
    <>
      <span id={KEYBOARD_INSTRUCTIONS_ID} className="sr-only">
        {intl.formatMessage(intlMessages.keyboardInstructions)}
      </span>
      <Styled.UsersSection
        id="breakoutBox-0"
        onDrop={drop(0)}
        onDragOver={allowDrop}
        tabIndex={0}
        onKeyDown={rover}
        aria-describedby={KEYBOARD_INSTRUCTIONS_ID}
      >
        <Styled.UsersSectionHeader>
          <span>{intl.formatMessage(intlMessages.unassignedUsers)}</span>
          <Styled.UserCount>{roomPadNum(unassignedUsers.length)}</Styled.UserCount>
        </Styled.UsersSectionHeader>
        {unassignedUsers.length > 0 && (
          <Styled.UsersList>
            {unassignedUsers.map((user) => {
              const rowId = `${user.userId}-0`;
              return (
                <Styled.UserItem
                  key={user.userId}
                  id={rowId}
                  data-test="draggableUser"
                  draggable
                  tabIndex={-1}
                  aria-label={participantLabel(
                    user.name,
                    user.userId,
                    intl.formatMessage(intlMessages.unassignedUsers),
                  )}
                  onKeyDown={(event) => {
                    rover(event);
                    openMenuFromRow(event, rowId);
                  }}
                  onKeyUp={(event) => openMenuFromRowKeyUp(event, rowId)}
                  onDragStart={dragStart}
                  onDragEnd={dragEnd}
                >
                  <span>
                    {user.name}
                    {isMe(user.userId) ? ` (${intl.formatMessage(intlMessages.you)})` : ''}
                  </span>
                  <BBBMenu
                    open={openMoveMenu === rowId}
                    onCloseCallback={() => closeMoveMenu(rowId)}
                    trigger={(
                      <Styled.MoveUserBtn
                        type="button"
                        tabIndex={-1}
                        aria-label={intl.formatMessage(intlMessages.moveUserMenu, { userName: user.name })}
                        aria-haspopup="menu"
                        aria-expanded={openMoveMenu === rowId}
                        data-test="moveUserMenuButton"
                        onClick={() => setOpenMoveMenu(rowId)}
                      />
                  )}
                    actions={moveMenuActions(user.userId, 0)}
                    opts={{ autoFocus: true, transitionDuration: 0 }}
                  />
                </Styled.UserItem>
              );
            })}
          </Styled.UsersList>
        )}
      </Styled.UsersSection>

      <Styled.RoomCardsContainer data-test="breakoutRoomList">
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
              aria-describedby={KEYBOARD_INSTRUCTIONS_ID}
            >
              <Styled.RoomCardHeader>
                {editingRoom === roomNum ? (
                  <Styled.RoomNameInput
                    aria-label={intl.formatMessage(intlMessages.roomNameLabel)}
                    data-room-number={roomNum}
                    value={roomName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      changeRoomName(roomNum, e.target.value);
                    }}
                    onBlur={() => setEditingRoom(null)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        editedRoomNumber.current = roomNum;
                        restoreRoomNameFocus.current = true;
                        setEditingRoom(null);
                      }
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    data-test={`roomName-${roomNum}`}
                  />
                ) : (
                  <Styled.RoomCardName
                    type="button"
                    ref={(element) => { roomNameRefs.current[roomNum] = element; }}
                    onClick={() => setEditingRoom(roomNum)}
                    aria-label={intl.formatMessage(intlMessages.renameRoom, { roomName })}
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
                  {usersInRoom.map((user) => {
                    const rowId = `${user.userId}-${roomNum}`;
                    return (
                      <Styled.RoomCardUserItem
                        key={user.userId}
                        id={rowId}
                        data-test="draggableUser"
                        draggable
                        tabIndex={-1}
                        aria-label={participantLabel(user.name, user.userId, roomName)}
                        onKeyDown={(event) => {
                          rover(event);
                          openMenuFromRow(event, rowId);
                        }}
                        onKeyUp={(event) => openMenuFromRowKeyUp(event, rowId)}
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
                          data-test="unassignUserFromBreakoutRoom"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveUser(user.userId, roomNum, 0);
                          }}
                        >
                          ✕
                        </Styled.UserRemoveBtn>
                        <BBBMenu
                          open={openMoveMenu === rowId}
                          onCloseCallback={() => closeMoveMenu(rowId)}
                          trigger={(
                            <Styled.MoveUserBtn
                              type="button"
                              tabIndex={-1}
                              aria-label={intl.formatMessage(intlMessages.moveUserMenu, { userName: user.name })}
                              aria-haspopup="menu"
                              aria-expanded={openMoveMenu === rowId}
                              data-test="moveUserMenuButton"
                              onClick={() => setOpenMoveMenu(rowId)}
                            />
                        )}
                          actions={moveMenuActions(user.userId, roomNum)}
                          opts={{ autoFocus: true, transitionDuration: 0 }}
                        />
                      </Styled.RoomCardUserItem>
                    );
                  })}
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
