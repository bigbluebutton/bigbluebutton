import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  BreakoutUser,
  Rooms,
  ChildComponentProps,
  Room,
  moveUserRegistery,
} from './types';
import { breakoutRoom, getBreakoutsResponse } from '../queries';

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
}

const RoomManagmentState: React.FC<RoomManagmentStateProps> = ({
  numberOfRooms,
  users,
  RendererComponent,
  setFormIsValid,
  runningRooms,
  setRoomsRef,
  setMoveRegisterRef,
}) => {
  const intl = useIntl();
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<number>(0);
  const [rooms, setRooms] = useState<Rooms>({});
  const [init, setInit] = useState<boolean>(false);
  const [movementRegistered, setMovementRegistered] = useState<moveUserRegistery>({});

  const moveUser = (userId: string, from: number, to: number) => {
    const room = rooms[to];
    const roomFrom = rooms[Number(from)];

    if (from === to) return null;
    setMovementRegistered({
      ...movementRegistered,
      [userId]: {
        fromSequence: from,
        toSequence: to,
        toRoomId: runningRooms?.find((r) => r.sequence === to)?.breakoutRoomId,
        fromRoomId: runningRooms?.find((r) => r.sequence === from)?.breakoutRoomId,
      },
    });

    if (!rooms[to]) {
      const oldStateRooms = { ...rooms };
      oldStateRooms[from].users = (oldStateRooms[from].users.filter((user) => user.userId !== userId) || []);
      return setRooms({
        ...oldStateRooms,
        [to]: {
          id: to,
          name: intl.formatMessage(intlMessages.breakoutRoom, {
            0: to,
          }),
          users: [users.find((user) => user.userId === userId)],
        } as Room,
      });
    }

    return setRooms({
      ...rooms,
      [to]: {
        ...room,
        users: [
          ...(room?.users ?? []),
          roomFrom?.users?.find((user) => user.userId === userId),
        ],
      } as Room,
      [Number(from)]: {
        ...roomFrom,
        users: roomFrom?.users.filter((user) => user.userId !== userId),
      } as Room,
    });
  };

  const roomName = (room: number) => {
    const defaultName = intl.formatMessage(intlMessages.breakoutRoom, {
      0: room,
    });
    if (rooms[room]) {
      return rooms[room].name || defaultName;
    }
    return defaultName;
  };

  const changeRoomName = (room: number, name: string) => {
    setRooms((prevRooms) => {
      const rooms = { ...prevRooms };
      if (!rooms[room]) {
        rooms[room] = {
          id: room,
          name: '',
          users: [],
        };
      }
      rooms[room].name = name;
      return rooms;
    });
  };

  const randomlyAssign = () => {
    const withoutModerators = rooms[0].users.filter((user) => !user.isModerator);
    withoutModerators.forEach((user) => {
      const randomRoom = Math.floor(Math.random() * numberOfRooms) + 1;
      moveUser(user.userId, 0, randomRoom);
    });
  };

  const resetRooms = (cap: number) => {
    const greterThanRooms = Object.keys(rooms).filter((room) => Number(room) > cap);
    greterThanRooms.forEach((room) => {
      if (rooms && rooms[Number(room)]) {
        setRooms((prevRooms) => ({
          ...prevRooms,
          0: {
            ...prevRooms[0],
            users: [
              ...prevRooms[0].users,
              ...rooms[Number(room)].users,
            ],
          },
          [Number(room)]: {
            ...prevRooms[Number(room)],
            users: [],
          },
        }));
      }
    });
  };

  useEffect(() => {
    if (users && users.length > 0) {
      // set users to room 0
      setInit(true);
      setRooms((prevRooms: Rooms) => ({
        ...(prevRooms ?? {}),
        0: {
          id: 0,
          name: intl.formatMessage(intlMessages.notAssigned, { 0: 0 }),
          users,
        },
      }));
    }
  }, [users]);

  useEffect(() => {
    if (runningRooms && init) {
      runningRooms.forEach((r: breakoutRoom) => {
        r.participants.forEach((u) => {
          if (!rooms[r.sequence]?.users?.find((user) => user.userId === u.user.userId)) {
            moveUser(u.user.userId, 0, r.sequence);
          }
        });
      });
    }
  }, [runningRooms, init]);

  useEffect(() => {
    if (rooms) {
      setRoomsRef(rooms);
      if (!(rooms[0]?.users?.length === users.length)) {
        setFormIsValid(true);
      } else {
        setFormIsValid(false);
      }
    }
  }, [rooms]);

  useEffect(() => {
    if (movementRegistered) {
      setMoveRegisterRef(movementRegistered);
    }
  }, [movementRegistered]);

  return (
    <>
      {
        init ? (
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
            randomlyAssign={randomlyAssign}
            resetRooms={resetRooms}
            users={users}
          />
        ) : null
      }
    </>
  );
};

export default RoomManagmentState;
