import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { range } from '/imports/utils/array-utils';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import Styled from '../styles';
import Auth from '/imports/ui/services/auth';
import ManageRoomLabel from '../manage-room-label/component';
import { ChildComponentProps } from '../room-managment-state/types';

const intlMessages = defineMessages({
  breakoutRoomTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'modal title',
  },
  breakoutRoomDesc: {
    id: 'app.createBreakoutRoom.modalDesc',
    description: 'modal description',
  },
  breakoutRoomUpdateDesc: {
    id: 'app.updateBreakoutRoom.modalDesc',
    description: 'update modal description',
  },
  cancelLabel: {
    id: 'app.updateBreakoutRoom.cancelLabel',
    description: 'used in the button that close update modal',
  },
  updateTitle: {
    id: 'app.updateBreakoutRoom.title',
    description: 'update breakout title',
  },
  updateConfirm: {
    id: 'app.updateBreakoutRoom.confirm',
    description: 'Update to breakout confirm button label',
  },
  resetUserRoom: {
    id: 'app.update.resetRoom',
    description: 'Reset user room button label',
  },
  confirmButton: {
    id: 'app.createBreakoutRoom.confirm',
    description: 'confirm button label',
  },
  dismissLabel: {
    id: 'app.presentationUploder.dismissLabel',
    description: 'used in the button that close modal',
  },
  numberOfRooms: {
    id: 'app.createBreakoutRoom.numberOfRooms',
    description: 'number of rooms label',
  },
  duration: {
    id: 'app.createBreakoutRoom.durationInMinutes',
    description: 'duration time label',
  },
  resetAssignments: {
    id: 'app.createBreakoutRoom.resetAssignments',
    description: 'reset assignments label',
  },
  resetAssignmentsDesc: {
    id: 'app.createBreakoutRoom.resetAssignmentsDesc',
    description: 'reset assignments label description',
  },
  randomlyAssign: {
    id: 'app.createBreakoutRoom.randomlyAssign',
    description: 'randomly assign label',
  },
  randomlyAssignDesc: {
    id: 'app.createBreakoutRoom.randomlyAssignDesc',
    description: 'randomly assign label description',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  freeJoinLabel: {
    id: 'app.createBreakoutRoom.freeJoin',
    description: 'free join label',
  },
  captureNotesLabel: {
    id: 'app.createBreakoutRoom.captureNotes',
    description: 'capture shared notes label',
  },
  captureSlidesLabel: {
    id: 'app.createBreakoutRoom.captureSlides',
    description: 'capture slides label',
  },
  captureNotesType: {
    id: 'app.notes.label',
    description: 'indicates notes have been captured',
  },
  captureSlidesType: {
    id: 'app.shortcut-help.whiteboard',
    description: 'indicates the whiteboard has been captured',
  },
  roomLabel: {
    id: 'app.createBreakoutRoom.room',
    description: 'Room label',
  },
  leastOneWarnBreakout: {
    id: 'app.createBreakoutRoom.leastOneWarnBreakout',
    description: 'warn message label',
  },
  notAssigned: {
    id: 'app.createBreakoutRoom.notAssigned',
    description: 'Not assigned label',
  },
  breakoutRoomLabel: {
    id: 'app.createBreakoutRoom.breakoutRoomLabel',
    description: 'breakout room label',
  },
  addParticipantLabel: {
    id: 'app.createBreakoutRoom.addParticipantLabel',
    description: 'add Participant label',
  },
  nextLabel: {
    id: 'app.createBreakoutRoom.nextLabel',
    description: 'Next label',
  },
  backLabel: {
    id: 'app.audio.backLabel',
    description: 'Back label',
  },
  minusRoomTime: {
    id: 'app.createBreakoutRoom.minusRoomTime',
    description: 'aria label for btn to decrease room time',
  },
  addRoomTime: {
    id: 'app.createBreakoutRoom.addRoomTime',
    description: 'aria label for btn to increase room time',
  },
  record: {
    id: 'app.createBreakoutRoom.record',
    description: 'label for checkbox to allow record',
  },
  roomTime: {
    id: 'app.createBreakoutRoom.roomTime',
    description: 'used to provide current room time for aria label',
  },
  numberOfRoomsIsValid: {
    id: 'app.createBreakoutRoom.numberOfRoomsError',
    description: 'Label an error message',
  },
  roomNameEmptyIsValid: {
    id: 'app.createBreakoutRoom.emptyRoomNameError',
    description: 'Label an error message',
  },
  roomNameDuplicatedIsValid: {
    id: 'app.createBreakoutRoom.duplicatedRoomNameError',
    description: 'Label an error message',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  minimumDurationWarnBreakout: {
    id: 'app.createBreakoutRoom.minimumDurationWarnBreakout',
    description: 'minimum duration warning message label',
  },
  roomNameInputDesc: {
    id: 'app.createBreakoutRoom.roomNameInputDesc',
    description: 'aria description for room name change',
  },
  movedUserLabel: {
    id: 'app.createBreakoutRoom.movedUserLabel',
    description: 'screen reader alert when users are moved to rooms',
  },
  manageRooms: {
    id: 'app.createBreakoutRoom.manageRoomsLabel',
    description: 'Label for manage rooms',
  },
  sendInvitationToMods: {
    id: 'app.createBreakoutRoom.sendInvitationToMods',
    description: 'label for checkbox send invitation to moderators',
  },
});

const isMe = (intId: string) => intId === Auth.userID;

const BreakoutRoomUserAssignment: React.FC<ChildComponentProps> = ({
  moveUser,
  rooms,
  getRoomName,
  changeRoomName,
  numberOfRooms,
  setSelectedId,
  randomlyAssign,
  resetRooms,
  users,
}) => {
  const intl = useIntl();

  const dragStart = (ev: React.DragEvent<HTMLParagraphElement>) => {
    const paragraphElement = ev.target as HTMLParagraphElement;
    ev.dataTransfer.setData('text', paragraphElement.id);
    setSelectedId(paragraphElement.id);
  };

  const dragEnd = () => {
    setSelectedId('');
  };

  const allowDrop = (ev: React.DragEvent) => {
    ev.preventDefault();
  };

  const drop = (roomNumber: number) => (ev: React.DragEvent) => {
    if (ev.preventDefault) {
      ev.preventDefault();
    }

    const data = ev.dataTransfer.getData('text');
    const [userId, from] = data.split('-');
    moveUser(userId, Number(from), roomNumber);
    setSelectedId('');
  };

  const hasNameDuplicated = (room: number) => {
    const roomName = rooms[room]?.name || '';
    return Object.values(rooms).filter((r) => r.name === roomName).length > 1;
  };

  useEffect(() => {
    if (numberOfRooms) {
      resetRooms(numberOfRooms);
    }
  }, [numberOfRooms]);

  const roomUserList = (room: number) => {
    if (rooms[room]) {
      return rooms[room].users.map((user) => {
        return (
          <Styled.RoomUserItem
            tabIndex={-1}
            id={`${user.userId}-${room}`}
            key={user.userId}
            draggable
            onDragStart={dragStart}
            onDragEnd={dragEnd}
          >
            <span>
              <span>{user.name}</span>
              <i>{(isMe(user.userId)) ? ` (${intl.formatMessage(intlMessages.you)})` : ''}</i>
            </span>
            {room !== 0
              ? (
                <span
                  key={`${user.userId}-${room}`}
                  tabIndex={0}
                  className="close"
                  role="button"
                  aria-label={intl.formatMessage(intlMessages.resetUserRoom)}
                  onKeyDown={() => {
                    moveUser(user.userId, room, 0);
                  }}
                  onClick={() => {
                    moveUser(user.userId, room, 0);
                  }}
                >
                  <Icon iconName="close" />
                </span>
              ) : null}
          </Styled.RoomUserItem>
        );
      });
    }
    return '';
  };

  return (
    <>
      <ManageRoomLabel
        onAssignReset={() => { resetRooms(0); }}
        onAssignRandomly={randomlyAssign}
        numberOfRoomsIsValid={numberOfRooms > 0}
        leastOneUserIsValid={rooms[0]?.users?.length < users.length}
      />
      <Styled.ContentContainer>
        <Styled.Alert valid role="alert">
          <Styled.FreeJoinLabel>
            <Styled.BreakoutNameInput
              type="text"
              readOnly
              value={
                intl.formatMessage(intlMessages.notAssigned, { 0: 0 })
              }
            />
          </Styled.FreeJoinLabel>
          <Styled.BreakoutBox
            hundred
            id="breakoutBox-0"
            onDrop={drop(0)}
            onDragOver={allowDrop}
            tabIndex={0}
          >
            {roomUserList(0)}
          </Styled.BreakoutBox>
          <Styled.SpanWarn data-test="warningNoUserAssigned" valid={rooms[0]?.users?.length < users.length}>
            {intl.formatMessage(intlMessages.leastOneWarnBreakout)}
          </Styled.SpanWarn>
        </Styled.Alert>
        <Styled.BoxContainer key="rooms-grid-" data-test="roomGrid">
          {
            range(1, numberOfRooms + 1).map((value) => (
              <div key={`room-${value}`}>
                <Styled.FreeJoinLabel>
                  <Styled.RoomName
                    type="text"
                    maxLength={255}
                    duplicated={hasNameDuplicated(value)}
                    value={getRoomName(value)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      changeRoomName(value, e.target.value);
                    }}
                    onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                      changeRoomName(value, e.target.value);
                    }}
                    data-test={getRoomName(value).length === 0 ? `room-error-${value}` : `roomName-${value}`}
                  />
                  <div aria-hidden id={`room-input-${value}`} className="sr-only">
                    {intl.formatMessage(intlMessages.roomNameInputDesc)}
                  </div>
                </Styled.FreeJoinLabel>
                <Styled.BreakoutBox
                  id={`breakoutBox-${value}`}
                  onDrop={drop(value)}
                  onDragOver={allowDrop}
                  hundred={false}
                  tabIndex={0}
                >
                  {roomUserList(value)}
                </Styled.BreakoutBox>
                {hasNameDuplicated(value) ? (
                  <Styled.SpanWarn valid>
                    {intl.formatMessage(intlMessages.roomNameDuplicatedIsValid)}
                  </Styled.SpanWarn>
                ) : null}
                {getRoomName(value).length === 0 ? (
                  <Styled.SpanWarn valid aria-hidden id={`room-error-${value}`}>
                    {intl.formatMessage(intlMessages.roomNameEmptyIsValid)}
                  </Styled.SpanWarn>
                ) : null}
              </div>
            ))
          }
        </Styled.BoxContainer>
      </Styled.ContentContainer>
    </>
  );
};

export default BreakoutRoomUserAssignment;
