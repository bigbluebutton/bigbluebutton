import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useQuery } from '@apollo/client';
import {
  BreakoutUser,
  Rooms,
  ChildComponentProps,
  Room,
  moveUserRegistery,
  Presentation,
  RoomPresentations,
} from './types';
import {
  getBreakoutsResponse, getLastBreakouts, getMeetingGroupResponse, LastBreakoutData,
} from '../queries';

const intlMessages = defineMessages({
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  notAssigned: {
    id: 'app.createBreakoutRoom.notAssigned',
    description: 'Not assigned label',
  },
});

interface RoomManagmentStateProps {
  numberOfRooms: number;
  users: BreakoutUser[];
  RendererComponent: React.FC<ChildComponentProps>;
  runningRooms: getBreakoutsResponse['breakoutRoom'] | null;
  setFormIsValid: (isValid: boolean) => void;
  setRoomsRef: (rooms: Rooms) => void;
  setMoveRegisterRef: (moveRegister: moveUserRegistery) => void;
  presentations: Presentation[];
  roomPresentations: RoomPresentations;
  setRoomPresentations: React.Dispatch<React.SetStateAction<RoomPresentations>>;
  currentPresentation: string;
  currentSlidePrefix: string;
  getRoomPresentation: (roomId: number) => string;
  isUpdate: boolean;
  setNumberOfRooms: React.Dispatch<React.SetStateAction<number>>;
  groups: getMeetingGroupResponse['meeting_group'];
  freeJoin: boolean;
  randomlyAssignFunction: (fn: () => void) => void;
  resetAssignmentsFunction: (fn: () => void) => void;
  isMobile: boolean;
}

const RoomManagmentState: React.FC<RoomManagmentStateProps> = ({
  numberOfRooms,
  users,
  RendererComponent,
  setFormIsValid,
  runningRooms,
  setRoomsRef,
  setMoveRegisterRef,
  presentations,
  roomPresentations,
  setRoomPresentations,
  currentPresentation,
  currentSlidePrefix,
  getRoomPresentation,
  isUpdate,
  setNumberOfRooms,
  groups,
  freeJoin,
  randomlyAssignFunction,
  resetAssignmentsFunction,
  isMobile,
}) => {
  const intl = useIntl();
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<number>(0);
  const [movementRegistered, setMovementRegistered] = useState<moveUserRegistery>({});

  const [userAssignedRooms, setUserAssignedRooms] = useState<{
    [key: string]: number[];
  }>({});

  const [roomNames, setRoomNames] = useState<{
    [key: number]: string;
  }>({});

  const recordUserMovement = (userId: string, fromRoom: number, toRoom: number) => {
    // Use the actual running room as fromRoomId source of truth.
    // If the user was dragged through the unassigned box (fromRoom=0),
    // the previous movementRegistered entry still holds the real fromRoomId.
    const runningRoom = runningRooms?.find((r) => r.participants.some((p) => p.user.userId === userId));
    const fromRoomId = runningRoom?.breakoutRoomMeetingId
      ?? movementRegistered[userId]?.fromRoomId;
    let updatedMovementRegistered = { ...movementRegistered };
    updatedMovementRegistered = {
      ...updatedMovementRegistered,
      [userId]: {
        fromSequence: runningRoom?.sequence ?? fromRoom,
        toSequence: toRoom,
        toRoomId: runningRooms?.find((r) => r.sequence === toRoom)?.breakoutRoomMeetingId,
        fromRoomId,
      },
    };
    setMovementRegistered(updatedMovementRegistered);
    setMoveRegisterRef(updatedMovementRegistered);
  };

  const moveUser = (userId: string, from: number, to: number) => {
    if (from === to) return;
    const current = new Set(userAssignedRooms[userId] ?? []);
    current.delete(from); // no-op if not present
    current.add(to);

    setUserAssignedRooms((prev) => ({
      ...prev,
      [userId]: Array.from(current),
    }));

    recordUserMovement(userId, from, to);
  };

  const roomName = (room: number) => {
    const defaultName = intl.formatMessage(intlMessages.breakoutRoom, {
      roomNumber: room,
    });
    if (roomNames[room]) {
      return roomNames[room];
    }
    return defaultName;
  };

  const changeRoomName = useCallback((room: number, name: string) => {
    setRoomNames((prev) => ({
      ...prev,
      [room]: name,
    }));
  }, []);

  const resetRooms = useCallback((cap: number) => {
    setUserAssignedRooms((prev) => {
      const newUserAssignedRooms = { ...prev };
      Object.keys(newUserAssignedRooms).forEach((userId) => {
        newUserAssignedRooms[userId] = newUserAssignedRooms[userId].filter((room) => room <= cap);
      });
      return newUserAssignedRooms;
    });
  }, []);

  const randomlyAssign = () => {
    const updatedUserAssignedRooms = { ...userAssignedRooms };
    const noModerators = users.filter((user) => !user.isModerator);
    const userIds = noModerators.sort(() => Math.random() - 0.5).map((user) => user.userId);
    const numberOfUsers = noModerators.length;
    const assignments = new Array(numberOfUsers);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < numberOfUsers; i++) {
      assignments[i] = (i % numberOfRooms) + 1;
    }

    const updatedMovementRegistered = { ...movementRegistered };
    userIds.forEach((userId, index) => {
      const roomNumber = assignments[index];
      // Find where the user actually is in the running rooms (ground truth),
      // regardless of any UI reassignments or unassigns done in the modal.
      const runningRoom = runningRooms?.find((r) => r.participants.some((p) => p.user.userId === userId));
      updatedUserAssignedRooms[userId] = [roomNumber];
      updatedMovementRegistered[userId] = {
        fromSequence: runningRoom?.sequence ?? 0,
        toSequence: roomNumber,
        fromRoomId: runningRoom?.breakoutRoomMeetingId,
        toRoomId: runningRooms?.find((r) => r.sequence === roomNumber)?.breakoutRoomMeetingId,
      };
    });
    setMovementRegistered(updatedMovementRegistered);
    setMoveRegisterRef(updatedMovementRegistered);
    setUserAssignedRooms(updatedUserAssignedRooms);
  };

  const getUserIdsByNumber = (n: number) => {
    if (n === 0) {
      // Return keys with empty arrays
      return Object.keys(userAssignedRooms).filter((key) => {
        return userAssignedRooms[key].length === 0
          || userAssignedRooms[key].includes(0);
      });
    }
    // Return keys whose array includes the given number
    return Object.keys(userAssignedRooms).filter((key) => userAssignedRooms[key].includes(n));
  };

  const getUsers = (n: number): BreakoutUser[] => {
    const userIds = getUserIdsByNumber(n);
    return userIds
      .map((userId) => users.find((user) => user.userId === userId))
      .filter((u) => !(u === undefined))
      ?? [];
  };

  const {
    data: lastBreakoutData,
  } = useQuery<LastBreakoutData>(getLastBreakouts, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (users.length > 0) {
      setUserAssignedRooms((prev) => {
        const updated = { ...prev };

        // Add new users that don't exist in the state
        users.forEach((user) => {
          if (!updated[user.userId]) {
            updated[user.userId] = [];
          }
        });

        // Remove users that are no longer in the users list
        const currentUserIds = new Set(users.map((u) => u.userId));
        Object.keys(updated).forEach((userId) => {
          if (!currentUserIds.has(userId)) {
            delete updated[userId];
          }
        });

        return updated;
      });
    }
  }, [users]);

  randomlyAssignFunction(randomlyAssign);
  resetAssignmentsFunction(() => { resetRooms(0); });

  // Manage a running room
  useEffect(() => {
    if (runningRooms && runningRooms.length > 0) {
      const assignUsers = runningRooms
        .reduce((
          acc: { [key: string]: number[] },
          room,
        ) => {
          room.participants.forEach((user) => {
            const { userId } = user.user;
            if (!acc[userId]) {
              acc[userId] = [room.sequence];
            } else {
              acc[userId].push(room.sequence);
            }
          });

          return acc;
        }, {});

      const roomNames = runningRooms.reduce((acc: { [key: number]: string }, room) => {
        acc[room.sequence] = room.name;
        return acc;
      }, {});

      setNumberOfRooms(runningRooms.length);
      setUserAssignedRooms((prev) => {
        const updated = { ...prev };
        users.forEach((user) => {
          if (!updated[user.userId]) {
            updated[user.userId] = [];
          }
        });
        Object.assign(updated, assignUsers);
        return updated;
      });

      setRoomNames((prev) => ({
        ...prev,
        ...roomNames,
      }));
    }
  }, [runningRooms, users.length]);

  useEffect(() => {
    if (getUserIdsByNumber(0).length === users.length) {
      setFormIsValid(false);
    } else {
      setFormIsValid(true);
    }
  }, [userAssignedRooms]);

  useEffect(() => {
    if (
      (lastBreakoutData
        && lastBreakoutData.breakoutRoom_createdLatest.length > 0)
      && (runningRooms
        && runningRooms.length === 0)
    ) {
      const assignUsers = lastBreakoutData.user.reduce((acc: { [key: string]: number[] }, user) => {
        //  means user wasn't either not assigned or not joined a breakout room
        if (!user.lastBreakoutRoom) return acc;
        const { userId, sequence } = user.lastBreakoutRoom;
        if (!acc[userId]) {
          acc[userId] = [sequence];
        } else {
          acc[userId].push(sequence);
        }
        return acc;
      }, {});
      const roomNames = lastBreakoutData.breakoutRoom_createdLatest.reduce((acc: {[key: number]: string}, room) => {
        acc[room.sequence] = room.shortName;
        return acc;
      }, {});

      setNumberOfRooms(lastBreakoutData.breakoutRoom_createdLatest.length);
      setUserAssignedRooms((prev) => ({
        ...prev,
        ...assignUsers,
      }));
      setRoomNames((prev) => ({
        ...prev,
        ...roomNames,
      }));
    }
  }, [lastBreakoutData]);

  useEffect(() => {
    if (
      groups.length
      && users.length > 0
      && lastBreakoutData
      && !(lastBreakoutData.breakoutRoom_createdLatest.length > 0)
    ) {
      const roomNamesToSet: { [key: number]: string } = {};
      const groupUserAssignments: { [key: string]: number[] } = {};

      Array.from(groups).forEach((group, index) => {
        const idx = index + 1;
        const userIds = group.usersExtId
          .map((id) => users.find((user) => user.extId === id))
          .filter((user) => user !== undefined)
          .map((user) => user.userId);
        userIds.forEach((userId) => {
          if (!groupUserAssignments[userId]) {
            groupUserAssignments[userId] = [idx];
          } else {
            groupUserAssignments[userId].push(idx);
          }
        });
        roomNamesToSet[idx] = group.name;
      });

      setUserAssignedRooms((prev) => {
        const updated = { ...prev };
        users.forEach((user) => {
          if (!updated[user.userId]) {
            updated[user.userId] = [];
          }
        });
        Object.entries(groupUserAssignments).forEach(([userId, rooms]) => {
          updated[userId] = rooms;
        });
        return updated;
      });

      setRoomNames(roomNamesToSet);
    }
  }, [lastBreakoutData, groups, users]);

  const rooms = useMemo(() => {
    const roomList: {
      [key: number]: Room;
    } = {};

    for (let i = 0; i <= numberOfRooms; i += 1) {
      if (!roomList[i]) {
        if (i === 0) {
          roomList[i] = {
            id: i,
            name: intl.formatMessage(intlMessages.notAssigned),
            users: getUsers(i),
          };
        } else {
          roomList[i] = {
            id: i,
            name: roomName(i),
            users: getUsers(i),
          };
        }
      }
    }

    return roomList;
  }, [
    userAssignedRooms,
    numberOfRooms,
    roomNames,
    users,
  ]);

  useEffect(() => {
    setRoomsRef(rooms);
  }, [rooms, setRoomsRef]);

  return (
    <>
      <RendererComponent
        moveUser={moveUser}
        rooms={rooms}
        getRoomName={roomName}
        changeRoomName={changeRoomName}
        numberOfRooms={numberOfRooms}
        selectedId={selectedId ?? ''}
        setSelectedId={setSelectedId}
        selectedRoom={selectedRoom}
        setSelectedRoom={setSelectedRoom}
        resetRooms={resetRooms}
        users={users}
        currentSlidePrefix={currentSlidePrefix}
        presentations={presentations}
        roomPresentations={roomPresentations}
        setRoomPresentations={setRoomPresentations}
        getRoomPresentation={getRoomPresentation}
        currentPresentation={currentPresentation}
        isUpdate={isUpdate}
        freeJoin={freeJoin}
        isMobile={isMobile}
      />
    </>
  );
};

export default RoomManagmentState;
