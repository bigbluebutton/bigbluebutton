import React, { useMemo } from 'react';
import Styled from './styles';
import { BreakoutUser } from '../../room-managment-state/types';

interface RoomUserListProps {
  selectedRoom: number;
  rooms: {
    [key: number]: {
      id: number;
      name: string;
      users: BreakoutUser[];
    }
  }
  moveUser: (userId: string, fromRoomId: number, toRoomId: number) => void;
}

const RoomUserList: React.FC<RoomUserListProps> = ({
  selectedRoom,
  rooms,
  moveUser,
}) => {
  const users = useMemo(() => {
    return Object.values(rooms).map((room) => {
      return room.users.map((user) => (
        <Styled.SelectUserContainer id={user.userId} key={`breakout-user-${user.userId}`}>
          <Styled.Round>
            <input
              type="checkbox"
              id={`user-${user.userId}-room-${room.id}`}
              checked={selectedRoom === room.id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.checked) {
                  moveUser(user.userId, room.id, selectedRoom);
                } else {
                  moveUser(user.userId, room.id, 0);
                }
              }}
            />
            {/* eslint-disable-next-line */}
            <label htmlFor={`user-${user.userId}-room-${room.id}`} />
          </Styled.Round>
          <Styled.TextName>
            {user.name}
            {room.id !== 0 && room.id !== selectedRoom ? `\t[${room.id}]` : ''}
          </Styled.TextName>
        </Styled.SelectUserContainer>
      ));
    }).flat();
  }, [rooms, selectedRoom, moveUser]);

  return (users);
};

export default RoomUserList;
