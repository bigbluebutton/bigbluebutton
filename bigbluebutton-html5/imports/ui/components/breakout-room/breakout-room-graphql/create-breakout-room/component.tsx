import React, { useMemo } from 'react';
import ModalFullscreen from '/imports/ui/components/common/modal/fullscreen/component';
import { defineMessages, useIntl } from 'react-intl';
import { range } from 'ramda';
import { uniqueId } from '/imports/utils/string-utils';
import { isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled, isImportSharedNotesFromBreakoutRoomsEnabled } from '/imports/ui/services/features';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { useLazyQuery, useQuery, useMutation } from '@apollo/client';
import Styled from './styles';
import {
  getBreakouts,
  getBreakoutsResponse,
  getUser,
  getUserResponse,
} from './queries';
import logger from '/imports/startup/client/logger';
import BreakoutRoomUserAssignment from './breakout-room-user-assignment/component';
import deviceInfo from '/imports/utils/deviceInfo';
import BreakoutRoomUserAssignmentMobile from './breakout-room-user-assignment-mobile/component';
import RoomManagmentState from './room-managment-state/component';
import {
  Rooms,
  RoomToWithSettings,
  BreakoutUser,
  moveUserRegistery,
} from './room-managment-state/types';
import { BREAKOUT_ROOM_CREATE, BREAKOUT_ROOM_MOVE_USER } from '../../mutations';

const BREAKOUT_LIM = window.meetingClientSettings.public.app.breakouts.breakoutRoomLimit;
const MIN_BREAKOUT_ROOMS = 2;
const MAX_BREAKOUT_ROOMS = BREAKOUT_LIM > MIN_BREAKOUT_ROOMS ? BREAKOUT_LIM : MIN_BREAKOUT_ROOMS;
const MIN_BREAKOUT_TIME = 5;
const DEFAULT_BREAKOUT_TIME = 15;

interface CreateBreakoutRoomContainerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  priority: string,
  isUpdate?: boolean,
}

interface CreateBreakoutRoomProps extends CreateBreakoutRoomContainerProps {
  isBreakoutRecordable: boolean,
  users: Array<BreakoutUser>,
  runningRooms: getBreakoutsResponse['breakoutRoom'],
}

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

const CreateBreakoutRoom: React.FC<CreateBreakoutRoomProps> = ({
  isOpen,
  setIsOpen,
  priority,
  isUpdate = false,
  isBreakoutRecordable,
  users,
  runningRooms,
}) => {
  const { isMobile } = deviceInfo;
  const intl = useIntl();

  const [numberOfRoomsIsValid, setNumberOfRoomsIsValid] = React.useState(true);
  const [durationIsValid, setDurationIsValid] = React.useState(true);
  const [freeJoin, setFreeJoin] = React.useState(false);
  const [record, setRecord] = React.useState(false);
  const [captureSlides, setCaptureSlides] = React.useState(false);
  const [leastOneUserIsValid, setLeastOneUserIsValid] = React.useState(false);
  const [captureNotes, setCaptureNotes] = React.useState(false);
  const [inviteMods, setInviteMods] = React.useState(false);
  const [numberOfRooms, setNumberOfRooms] = React.useState(MIN_BREAKOUT_ROOMS);
  const [durationTime, setDurationTime] = React.useState(DEFAULT_BREAKOUT_TIME);

  const [createBreakoutRoom] = useMutation(BREAKOUT_ROOM_CREATE);
  const [moveUser] = useMutation(BREAKOUT_ROOM_MOVE_USER);

  const roomsRef = React.useRef<Rooms>({});
  const moveRegisterRef = React.useRef<moveUserRegistery>({});

  const setRoomsRef = (rooms: Rooms) => {
    roomsRef.current = rooms;
  };

  const setMoveRegisterRef = (moveRegister: moveUserRegistery) => {
    moveRegisterRef.current = moveRegister;
  };

  const checkboxCallbackFactory = (call: (value: boolean) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    call(checked);
  };

  const createRoom = () => {
    const rooms = roomsRef.current;
    const roomsArray: RoomToWithSettings[] = [];
    /* eslint no-restricted-syntax: "off" */
    for (let i = 0; i < numberOfRooms; i += 1) {
      const roomNumber = i + 1;
      if (rooms[roomNumber]) {
        const r = rooms[roomNumber];
        roomsArray.push({
          name: r.name,
          sequence: r.id,
          captureNotesFilename: `${r.name.replace(/\s/g, '_')}_${intl.formatMessage(intlMessages.captureNotesType)}`,
          captureSlidesFilename: `${r.name.replace(/\s/g, '_')}_${intl.formatMessage(intlMessages.captureSlidesType)}`,
          isDefaultName: r.name === intl.formatMessage(intlMessages.breakoutRoom, {
            0: r.id,
          }),
          users: r.users.map((u) => u.userId),
          freeJoin,
          shortName: r.name,
        });
      } else {
        const defaultName = intl.formatMessage(intlMessages.breakoutRoom, {
          0: roomNumber,
        });

        roomsArray.push({
          name: defaultName,
          sequence: roomNumber,
          captureNotesFilename: `${defaultName.replace(/\s/g, '_')}_${intl.formatMessage(intlMessages.captureNotesType)}`,
          captureSlidesFilename: `${defaultName.replace(/\s/g, '_')}_${intl.formatMessage(intlMessages.captureSlidesType)}`,
          isDefaultName: true,
          freeJoin,
          shortName: defaultName,
          users: [],
        });
      }
    }
    createBreakoutRoom(
      {
        variables: {
          record,
          captureNotes,
          captureSlides,
          durationInMinutes: durationTime,
          sendInviteToModerators: inviteMods,
          rooms: roomsArray,
        },
      },
    );
    setIsOpen(false);
  };

  const userUpdate = () => {
    const userIds = Object.keys(moveRegisterRef.current);
    userIds.forEach((userId) => {
      const { fromRoomId, toRoomId } = moveRegisterRef.current[userId];
      if (fromRoomId !== toRoomId) {
        moveUser({
          variables: {
            userId,
            fromBreakoutRoomId: fromRoomId || '',
            toBreakoutRoomId: toRoomId,
          },
        });
      }
    });
    setIsOpen(false);
  };

  const title = useMemo(() => (
    <Styled.SubTitle>
      {isUpdate
        ? intl.formatMessage(intlMessages.breakoutRoomUpdateDesc)
        : intl.formatMessage(intlMessages.breakoutRoomDesc)}
    </Styled.SubTitle>
  ), [isUpdate]);

  const checkboxesInfo = useMemo(() => {
    return [
      {
        allowed: true,
        htmlFor: 'freeJoinCheckbox',
        key: 'free-join-breakouts',
        id: 'freeJoinCheckbox',
        onChange: checkboxCallbackFactory((e: boolean) => {
          setFreeJoin(e);
          setLeastOneUserIsValid(true);
        }),
        label: intl.formatMessage(intlMessages.freeJoinLabel),
      },
      {
        allowed: isBreakoutRecordable,
        htmlFor: 'recordBreakoutCheckbox',
        key: 'record-breakouts',
        id: 'recordBreakoutCheckbox',
        onChange: checkboxCallbackFactory(setRecord),
        label: intl.formatMessage(intlMessages.record),
      },
      {
        allowed: isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled(),
        htmlFor: 'captureSlidesBreakoutCheckbox',
        key: 'capture-slides-breakouts',
        id: 'captureSlidesBreakoutCheckbox',
        onChange: checkboxCallbackFactory(setCaptureSlides),
        label: intl.formatMessage(intlMessages.captureSlidesLabel),
      },
      {
        allowed: isImportSharedNotesFromBreakoutRoomsEnabled(),
        htmlFor: 'captureNotesBreakoutCheckbox',
        key: 'capture-notes-breakouts',
        id: 'captureNotesBreakoutCheckbox',
        onChange: checkboxCallbackFactory(setCaptureNotes),
        label: intl.formatMessage(intlMessages.captureNotesLabel),
      },
      {
        allowed: true,
        htmlFor: 'sendInvitationToAssignedModeratorsCheckbox',
        key: 'send-invitation-to-assigned-moderators-breakouts',
        id: 'sendInvitationToAssignedModeratorsCheckbox',
        onChange: checkboxCallbackFactory(setInviteMods),
        label: intl.formatMessage(intlMessages.sendInvitationToMods),
      },
    ];
  }, [isBreakoutRecordable]);

  const form = useMemo(() => {
    return (
      <React.Fragment key="breakout-form">
        <Styled.BreakoutSettings>
          <div>
            <Styled.FormLabel valid={numberOfRoomsIsValid} aria-hidden>
              {intl.formatMessage(intlMessages.numberOfRooms)}
            </Styled.FormLabel>
            <Styled.InputRooms
              id="numberOfRooms"
              name="numberOfRooms"
              valid={numberOfRoomsIsValid}
              value={numberOfRooms}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const { value } = e.target;
                setNumberOfRooms(Number.parseInt(value, 10));
                setNumberOfRoomsIsValid(true);
              }}
              aria-label={intl.formatMessage(intlMessages.numberOfRooms)}
            >
              {
                range(MIN_BREAKOUT_ROOMS, MAX_BREAKOUT_ROOMS + 1).map((item) => (<option key={uniqueId('value-')}>{item}</option>))
              }
            </Styled.InputRooms>
          </div>
          <Styled.DurationLabel valid={durationIsValid} htmlFor="breakoutRoomTime">
            <Styled.LabelText bold={false} aria-hidden>
              {intl.formatMessage(intlMessages.duration)}
            </Styled.LabelText>
            <Styled.DurationArea>
              <Styled.DurationInput
                type="number"
                min="1"
                value={durationTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const { value } = e.target;
                  const v = Number.parseInt(value, 10);
                  setDurationTime(v);
                  setDurationIsValid(v >= MIN_BREAKOUT_TIME);
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  const { value } = e.target;
                  const v = Number.parseInt(value, 10);
                  setDurationTime((v && !(v <= 0)) ? v : MIN_BREAKOUT_TIME);
                  setDurationIsValid(true);
                }}
                aria-label={intl.formatMessage(intlMessages.duration)}
                data-test="durationTime"
              />
            </Styled.DurationArea>
            <Styled.SpanWarn data-test="minimumDurationWarnBreakout" valid={durationIsValid}>
              {
                intl.formatMessage(
                  intlMessages.minimumDurationWarnBreakout,
                  { 0: MIN_BREAKOUT_TIME },
                )
              }
            </Styled.SpanWarn>
          </Styled.DurationLabel>
          <Styled.CheckBoxesContainer key="breakout-checkboxes">
            {checkboxesInfo
              .filter((item) => item.allowed)
              .map((item) => (
                <Styled.FreeJoinLabel htmlFor={item.htmlFor} key={item.key}>
                  <Styled.FreeJoinCheckbox
                    type="checkbox"
                    id={item.id}
                    onChange={item.onChange}
                    aria-label={item.label}
                  />
                  <span aria-hidden>{item.label}</span>
                </Styled.FreeJoinLabel>
              ))}
          </Styled.CheckBoxesContainer>
        </Styled.BreakoutSettings>
        <Styled.SpanWarn valid={numberOfRoomsIsValid}>
          {intl.formatMessage(intlMessages.numberOfRoomsIsValid)}
        </Styled.SpanWarn>
        <span aria-hidden id="randomlyAssignDesc" className="sr-only">
          {intl.formatMessage(intlMessages.randomlyAssignDesc)}
        </span>
        <Styled.Separator />
      </React.Fragment>
    );
  }, [durationTime, durationIsValid, numberOfRooms, numberOfRoomsIsValid]);

  return (
    <ModalFullscreen
      title={
        isUpdate
          ? intl.formatMessage(intlMessages.updateTitle)
          : intl.formatMessage(intlMessages.breakoutRoomTitle)
      }
      confirm={
        {
          label: isUpdate
            ? intl.formatMessage(intlMessages.updateConfirm)
            : intl.formatMessage(intlMessages.confirmButton),
          callback: isUpdate ? userUpdate : createRoom,
          disabled: !leastOneUserIsValid || !numberOfRoomsIsValid || !durationIsValid,
        }
      }
      dismiss={{
        label: isUpdate
          ? intl.formatMessage(intlMessages.cancelLabel)
          : intl.formatMessage(intlMessages.dismissLabel),
        callback: () => setIsOpen(false),
        disabled: false,
      }}
      isOpen={isOpen}
      priority={priority}
    >
      <Styled.Content>
        {title}
        {form}
        <RoomManagmentState
          numberOfRooms={numberOfRooms}
          users={users}
          RendererComponent={isMobile ? BreakoutRoomUserAssignmentMobile : BreakoutRoomUserAssignment}
          runningRooms={runningRooms}
          setRoomsRef={setRoomsRef}
          setMoveRegisterRef={setMoveRegisterRef}
          setFormIsValid={setLeastOneUserIsValid}
        />
      </Styled.Content>
    </ModalFullscreen>
  );
};

const CreateBreakoutRoomContainer: React.FC<CreateBreakoutRoomContainerProps> = ({
  isOpen,
  setIsOpen,
  priority,
  isUpdate,
}) => {
  const [fetchedBreakouts, setFetchedBreakouts] = React.useState(false);
  // isBreakoutRecordable - get from meeting breakout policies breakoutPolicies/record
  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    breakoutPolicies: m.breakoutPolicies,
  }));

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery<getUserResponse>(getUser, {
    fetchPolicy: 'network-only',
  });

  const [
    loadBreakouts,
    {
      data: breakoutsData,
      loading: breakoutsLoading,
      error: breakoutsError,
    },
  ] = useLazyQuery<getBreakoutsResponse>(getBreakouts, {
    fetchPolicy: 'network-only',
  });

  if (usersLoading || breakoutsLoading || !currentMeeting) {
    return null;
  }

  if (true && !fetchedBreakouts) {
    loadBreakouts();
    setFetchedBreakouts(true);
  }

  if (true && breakoutsLoading) return null;

  if (usersError || breakoutsError) {
    logger.info('Error loading users', usersError);
    logger.info('Error loading breakouts', breakoutsError);
    return (
      <div>
        {JSON.stringify(usersError) || JSON.stringify(breakoutsError)}
      </div>
    );
  }
  return (
    <CreateBreakoutRoom
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      priority={priority}
      isUpdate={isUpdate}
      isBreakoutRecordable={currentMeeting?.breakoutPolicies?.record ?? true}
      users={usersData?.user ?? []}
      runningRooms={breakoutsData?.breakoutRoom ?? []}
    />
  );
};

CreateBreakoutRoomContainer.defaultProps = {
  isUpdate: false,
};

CreateBreakoutRoom.defaultProps = {
  isUpdate: false,
};

export default CreateBreakoutRoomContainer;
