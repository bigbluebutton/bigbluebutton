import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import { BreakoutUser } from '../../room-managment-state/types';

const intlMessages = defineMessages({
  breakoutRoomLabel: {
    id: 'app.createBreakoutRoom.breakoutRoomLabel',
    description: 'breakout room label',
  },
  doneLabel: {
    id: 'app.createBreakoutRoom.doneLabel',
    description: 'done label',
  },
});

interface RoomUserListProps {
  confirm: () => void;
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
  confirm,
}) => {
  const intl = useIntl();

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

  return (
    <Styled.SelectUserScreen>
      <Styled.Header>
        <Styled.Title>
          {intl.formatMessage(intlMessages.breakoutRoomLabel, { roomNumber: selectedRoom })}
        </Styled.Title>
        <Styled.ButtonAdd
          size="md"
          label={intl.formatMessage(intlMessages.doneLabel)}
          color="primary"
          onClick={confirm}
        />
      </Styled.Header>
      {users}
    </Styled.SelectUserScreen>
  );
};

export default RoomUserList;
