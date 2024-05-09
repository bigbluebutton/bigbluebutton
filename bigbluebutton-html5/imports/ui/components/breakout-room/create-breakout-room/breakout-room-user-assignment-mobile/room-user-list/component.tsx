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
    [key:number]: {
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
    const userElements = Object.values(rooms).sort((a, b) => {
      if (a.id === selectedRoom) {
        return -1; // Move itemToMove to the front
      }
      if (b.id === selectedRoom) {
        return 1; // Move itemToMove to the front
      }
      return 0;
    }).map((room) => {
      return room.users.map((user) => {
        return (
          <Styled.SelectUserContainer id={user.userId} key={`breakout-user-${user.userId}`}>
            <Styled.Round>
              <input
                type="checkbox"
                id={`itemId${room.id}`}
                defaultChecked={selectedRoom === room.id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.checked) {
                    moveUser(user.userId, room.id, selectedRoom);
                  } else {
                    moveUser(user.userId, room.id, 0);
                  }
                }}
              />
              <label htmlFor={`itemId${room.id}`}>
                <input type="hidden" id={`itemId${room.id}`} />
              </label>
            </Styled.Round>
            <Styled.TextName>
              {user.name}
              {((room.id !== selectedRoom) && room.id !== 0) ? `\t[${room.id}]` : ''}
            </Styled.TextName>
          </Styled.SelectUserContainer>
        );
      });
    }).flat();
    return userElements;
  }, [rooms, selectedRoom]);
  return (
    <Styled.SelectUserScreen>
      <Styled.Header>
        <Styled.Title>
          {intl.formatMessage(intlMessages.breakoutRoomLabel, { 0: selectedRoom })}
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
