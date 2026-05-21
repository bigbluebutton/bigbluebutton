import React, {
  useState, useMemo, useCallback, useRef, useEffect,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Styled from './styles';
import {
  Rooms,
  RoomToWithSettings,
  BreakoutUser,
  moveUserRegistery,
  Presentation,
  RoomPresentations,
} from '../room-managment-state/types';
import RoomManagmentState from '../room-managment-state/component';
import SidebarRoomAssignment from './sidebar-room-assignment';
import { BREAKOUT_ROOM_CREATE } from '../../mutations';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import logger from '/imports/startup/client/logger';
import { getRemainingMeetingTime, isNewTimeValid } from '/imports/ui/core/utils/calculateRemaingTime';
import {
  useIsImportPresentationWithAnnotationsFromBreakoutRoomsEnabled,
  useIsImportSharedNotesFromBreakoutRoomsEnabled,
} from '/imports/ui/services/features';
import PanelHeader from '/imports/ui/components/common/panel-header/component';

const MIN_BREAKOUT_TIME = 300;
const DEFAULT_SIDEBAR_BREAKOUT_TIME = 15;
const CURRENT_SLIDE_PREFIX = 'current-';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  dismissLabel: {
    id: 'app.presentationUploder.dismissLabel',
    description: 'used in the button that close modal',
  },
  durationLabel: {
    id: 'app.createBreakoutRoom.duration',
    description: 'duration label',
  },
  confirmButton: {
    id: 'app.createBreakoutRoom.confirm',
    description: 'confirm button label',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  randomlyAssignDesc: {
    id: 'app.createBreakoutRoom.randomlyAssignDesc',
    description: 'randomly assign label description',
  },
  assignModeratorsRandomlyDesc: {
    id: 'app.createBreakoutRoom.assignModeratorsRandomlyDesc',
    description: 'assign moderators randomly label description',
  },
  resetAssignmentsDesc: {
    id: 'app.createBreakoutRoom.resetAssignmentsDesc',
    description: 'Reset all user room assignments',
  },
  freeJoinLabel: {
    id: 'app.createBreakoutRoom.freeJoin',
    description: 'free join label',
  },
  captureSlidesLabel: {
    id: 'app.createBreakoutRoom.captureSlides',
    description: 'capture slides label',
  },
  captureNotesLabel: {
    id: 'app.createBreakoutRoom.captureNotes',
    description: 'capture shared notes label',
  },
  sendInvitationToMods: {
    id: 'app.createBreakoutRoom.sendInvitationToMods',
    description: 'label for checkbox send invitation to moderators',
  },
  record: {
    id: 'app.createBreakoutRoom.record',
    description: 'label for checkbox to allow record',
  },
  captureSlidesType: {
    id: 'app.shortcut-help.whiteboard',
    description: 'indicates the whiteboard has been captured',
  },
  captureNotesType: {
    id: 'app.notes.label',
    description: 'indicates notes have been captured',
  },
  notAssigned: {
    id: 'app.createBreakoutRoom.notAssigned',
    description: 'Not assigned label',
  },
  moreOptions: {
    id: 'app.createBreakoutRoom.moreOptions',
    description: 'More options label',
  },
  infoBannerTitle: {
    id: 'app.createBreakoutRoom.infoBannerTitle',
    description: 'Info banner title',
  },
  infoBannerText: {
    id: 'app.createBreakoutRoom.infoBannerText',
    description: 'Info banner description text',
  },
  infoBannerGotIt: {
    id: 'app.createBreakoutRoom.infoBannerGotIt',
    description: 'Info banner got it button',
  },
  startLabel: {
    id: 'app.createBreakoutRoom.start',
    description: 'Start button label',
  },
  durationOfBreakout: {
    id: 'app.createBreakoutRoom.durationOfBreakout',
    description: 'Duration of Breakout Rooms label',
  },
  unassignedUsers: {
    id: 'app.createBreakoutRoom.unassignedUsers',
    description: 'Unassigned users label',
  },
  leastOneWarnBreakout: {
    id: 'app.createBreakoutRoom.leastOneWarnBreakout',
    description: 'Warning: at least one user must be assigned',
  },
  minimumDurationWarnBreakout: {
    id: 'app.createBreakoutRoom.minimumDurationWarnBreakout',
    description: 'Warning: minimum breakout duration',
  },
  timerHours: {
    id: 'app.createBreakoutRoom.timerHours',
    description: 'Timer hours field label',
  },
  timerMinutes: {
    id: 'app.createBreakoutRoom.timerMinutes',
    description: 'Timer minutes field label',
  },
  timerSeconds: {
    id: 'app.createBreakoutRoom.timerSeconds',
    description: 'Timer seconds field label',
  },
  decreaseBreakoutTime: {
    id: 'app.createBreakoutRoom.decreaseBreakoutTime',
    description: 'Decrease breakout time button label',
  },
  increaseBreakoutTime: {
    id: 'app.createBreakoutRoom.increaseBreakoutTime',
    description: 'Increase breakout time button label',
  },
  decreaseRooms: {
    id: 'app.createBreakoutRoom.decreaseRooms',
    description: 'Decrease number of rooms button label',
  },
  increaseRooms: {
    id: 'app.createBreakoutRoom.increaseRooms',
    description: 'Increase number of rooms button label',
  },
});

interface CreateTimerPickerProps {
  minBreakoutTime: number;
  onDurationChange: (s: number) => void;
}

const CreateTimerPicker = React.memo(({ minBreakoutTime, onDurationChange }: CreateTimerPickerProps) => {
  const intl = useIntl();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(DEFAULT_SIDEBAR_BREAKOUT_TIME);
  const [seconds, setSeconds] = useState(0);
  const padNum = (n: number) => n.toString().padStart(2, '0');
  const duration = (hours * 3600) + (minutes * 60) + seconds;

  useEffect(() => {
    onDurationChange(duration);
  }, [duration, onDurationChange]);

  return (
    <Styled.TimerSection>
      <Styled.TimerLabel>
        {intl.formatMessage(intlMessages.durationOfBreakout)}
      </Styled.TimerLabel>
      <Styled.TimeInputGroup>
        <Styled.TimeUnitContainer>
          <Styled.TimerInput
            type="number"
            min={0}
            max={23}
            value={padNum(hours)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setHours(Math.max(0, Math.min(23, Number(e.target.value))));
            }}
            aria-label={intl.formatMessage(intlMessages.timerHours)}
          />
          <Styled.InputArrows>
            <Styled.InputArrowButton
              type="button"
              onClick={() => setHours((h) => Math.min(23, h + 1))}
              aria-label={intl.formatMessage(intlMessages.increaseBreakoutTime)}
            />
            <Styled.InputArrowButtonDown
              type="button"
              onClick={() => setHours((h) => Math.max(0, h - 1))}
              aria-label={intl.formatMessage(intlMessages.decreaseBreakoutTime)}
            />
          </Styled.InputArrows>
          <Styled.TimeUnitLabel>
            {intl.formatMessage(intlMessages.timerHours)}
          </Styled.TimeUnitLabel>
        </Styled.TimeUnitContainer>
        <Styled.TimeUnitContainer>
          <Styled.TimerInput
            type="number"
            min={0}
            max={59}
            value={padNum(minutes)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setMinutes(Math.max(0, Math.min(59, Number(e.target.value))));
            }}
            aria-label={intl.formatMessage(intlMessages.timerMinutes)}
            data-test="durationTime"
          />
          <Styled.InputArrows>
            <Styled.InputArrowButton
              type="button"
              onClick={() => setMinutes((m) => Math.min(59, m + 1))}
              aria-label={intl.formatMessage(intlMessages.increaseBreakoutTime)}
            />
            <Styled.InputArrowButtonDown
              type="button"
              onClick={() => setMinutes((m) => Math.max(0, m - 1))}
              aria-label={intl.formatMessage(intlMessages.decreaseBreakoutTime)}
            />
          </Styled.InputArrows>
          <Styled.TimeUnitLabel>
            {intl.formatMessage(intlMessages.timerMinutes)}
          </Styled.TimeUnitLabel>
        </Styled.TimeUnitContainer>
        <Styled.TimeUnitContainer>
          <Styled.TimerInput
            type="number"
            min={0}
            max={59}
            value={padNum(seconds)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSeconds(Math.max(0, Math.min(59, Number(e.target.value))));
            }}
            aria-label={intl.formatMessage(intlMessages.timerSeconds)}
          />
          <Styled.InputArrows>
            <Styled.InputArrowButton
              type="button"
              onClick={() => setSeconds((s) => Math.min(59, s + 1))}
              aria-label={intl.formatMessage(intlMessages.increaseBreakoutTime)}
            />
            <Styled.InputArrowButtonDown
              type="button"
              onClick={() => setSeconds((s) => Math.max(0, s - 1))}
              aria-label={intl.formatMessage(intlMessages.decreaseBreakoutTime)}
            />
          </Styled.InputArrows>
          <Styled.TimeUnitLabel>
            {intl.formatMessage(intlMessages.timerSeconds)}
          </Styled.TimeUnitLabel>
        </Styled.TimeUnitContainer>
      </Styled.TimeInputGroup>
      {duration < minBreakoutTime && (
        <Styled.TimerWarning data-test="minimumDurationWarnBreakout">
          {intl.formatMessage(
            intlMessages.minimumDurationWarnBreakout,
            { timeInMinutes: minBreakoutTime / 60 },
          )}
        </Styled.TimerWarning>
      )}
    </Styled.TimerSection>
  );
});

interface SidebarCreateBreakoutProps {
  users: BreakoutUser[];
  presentations: Presentation[];
  currentPresentation: string;
  isBreakoutRecordable: boolean;
  groups: Array<{ groupId: string; name: string; usersExtId: string[] }>;
  durationInSeconds: number;
  createdTime: number;
  timeSync: number;
}

const SidebarCreateBreakout: React.FC<SidebarCreateBreakoutProps> = ({
  users,
  presentations,
  currentPresentation,
  isBreakoutRecordable,
  groups,
  durationInSeconds,
  createdTime,
  timeSync,
}) => {
  const intl = useIntl();
  const layoutContextDispatch = layoutDispatch();

  // @ts-ignore
  const BREAKOUT_SETTINGS = window.meetingClientSettings.public.app.breakouts;
  const {
    allowUserChooseRoomByDefault,
    recordRoomByDefault,
    offerRecordingForBreakouts,
    breakoutRoomLimit: BREAKOUT_LIM,
    breakoutRoomMinimum: MIN_BREAKOUT_ROOMS,
    sendInvitationToAssignedModeratorsByDefault: inviteModsByDefault,
  } = BREAKOUT_SETTINGS;

  const MAX_BREAKOUT_ROOMS = BREAKOUT_LIM > MIN_BREAKOUT_ROOMS ? BREAKOUT_LIM : MIN_BREAKOUT_ROOMS;

  const isImportPresentationWithAnnotationsEnabled = useIsImportPresentationWithAnnotationsFromBreakoutRoomsEnabled();
  const isImportSharedNotesEnabled = useIsImportSharedNotesFromBreakoutRoomsEnabled();

  const captureWhiteboardByDefault = BREAKOUT_SETTINGS.captureWhiteboardByDefault
    && isImportPresentationWithAnnotationsEnabled;
  const captureSharedNotesByDefault = BREAKOUT_SETTINGS.captureSharedNotesByDefault
    && isImportSharedNotesEnabled;

  const [numberOfRooms, setNumberOfRooms] = useState(MIN_BREAKOUT_ROOMS);
  const [isDurationValid, setIsDurationValid] = useState(true);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [infoBannerVisible, setInfoBannerVisible] = useState(true);

  const [freeJoin, setFreeJoin] = useState(allowUserChooseRoomByDefault);
  const [captureSlides, setCaptureSlides] = useState(captureWhiteboardByDefault);
  const [captureNotes, setCaptureNotes] = useState(captureSharedNotesByDefault);
  const [record, setRecord] = useState(recordRoomByDefault || false);
  const [inviteMods, setInviteMods] = useState(inviteModsByDefault);
  const [leastOneUserIsValid, setLeastOneUserIsValid] = useState(false);
  const [roomPresentations, setRoomPresentations] = useState<RoomPresentations>([]);
  const [assignmentState, setAssignmentState] = useState<'hasViewers' | 'onlyModerators' | 'allAssigned'>('hasViewers');

  const [createBreakoutRoom] = useMutation(BREAKOUT_ROOM_CREATE);

  const roomsRef = useRef<Rooms>({});
  const moveRegisterRef = useRef<moveUserRegistery>({});
  const randomlyAssignFunction = useRef<() => void>(() => {});
  const randomlyAssignModeratorsFunction = useRef<() => void>(() => {});
  const resetAssignmentsFunction = useRef<() => void>(() => {});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const breakoutDurationRef = useRef<number>(DEFAULT_SIDEBAR_BREAKOUT_TIME * 60);

  const handleDurationChange = useCallback((secs: number) => {
    breakoutDurationRef.current = secs;
    setIsDurationValid(secs >= MIN_BREAKOUT_TIME);
  }, []);

  const setRoomsRef = useCallback((rooms: Rooms) => { roomsRef.current = rooms; }, []);
  const setMoveRegisterRef = useCallback((moveRegister: moveUserRegistery) => {
    moveRegisterRef.current = moveRegister;
  }, []);

  const SCROLL_ZONE = 60;
  const SCROLL_SPEED = 8;

  const handleScrollDragOver = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const y = ev.clientY;

    if (y - rect.top < SCROLL_ZONE) {
      container.scrollTop -= SCROLL_SPEED;
    } else if (rect.bottom - y < SCROLL_ZONE) {
      container.scrollTop += SCROLL_SPEED;
    }
  }, []);

  const getRoomPresentation = (position: number) => {
    if (roomPresentations[position]) return roomPresentations[position];
    const presentationToUse = currentPresentation || presentations[0]?.presentationId || '';
    return `${CURRENT_SLIDE_PREFIX}${presentationToUse}`;
  };

  const getCaptureFilename = (roomName: string, slides: boolean = true) => {
    const captureType = slides
      ? intl.formatMessage(intlMessages.captureSlidesType)
      : intl.formatMessage(intlMessages.captureNotesType);
    const fileName = `${roomName.replace(/\s/g, '_')}_${captureType}`.replace(/ /g, '_');
    const fileNameDuplicatedCount = presentations.filter(
      (pres) => pres.name?.startsWith(fileName),
    ).length;
    return fileNameDuplicatedCount === 0 ? fileName : `${fileName}(${fileNameDuplicatedCount + 1})`;
  };

  const decreaseRooms = () => {
    if (numberOfRooms > MIN_BREAKOUT_ROOMS) setNumberOfRooms(numberOfRooms - 1);
  };

  const increaseRooms = () => {
    if (numberOfRooms < MAX_BREAKOUT_ROOMS) setNumberOfRooms(numberOfRooms + 1);
  };

  const handleCreateRoom = useCallback(() => {
    const breakoutDuration = breakoutDurationRef.current;
    if (breakoutDuration < MIN_BREAKOUT_TIME) return;

    const remainingTime = getRemainingMeetingTime(durationInSeconds, createdTime, timeSync);
    if (!isNewTimeValid(remainingTime, breakoutDuration)) return;

    const rooms = roomsRef.current;
    const roomsArray: RoomToWithSettings[] = [];

    for (let i = 0; i < numberOfRooms; i += 1) {
      const roomNumber = i + 1;
      if (rooms[roomNumber]) {
        const r = rooms[roomNumber];
        roomsArray.push({
          name: r.name,
          sequence: r.id,
          captureNotesFilename: getCaptureFilename(r.name, false),
          captureSlidesFilename: getCaptureFilename(r.name, true),
          isDefaultName: r.name === intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: r.id }),
          users: r.users.map((u) => u.userId),
          freeJoin,
          shortName: r.name,
          allPages: !getRoomPresentation(r.id).startsWith(CURRENT_SLIDE_PREFIX),
          presId: getRoomPresentation(r.id).replace(CURRENT_SLIDE_PREFIX, ''),
        });
      } else {
        const defaultName = intl.formatMessage(intlMessages.breakoutRoom, { roomNumber });
        roomsArray.push({
          name: defaultName,
          sequence: roomNumber,
          captureNotesFilename: getCaptureFilename(defaultName, false),
          captureSlidesFilename: getCaptureFilename(defaultName, true),
          isDefaultName: true,
          freeJoin,
          shortName: defaultName,
          users: [],
          allPages: !getRoomPresentation(roomNumber).startsWith(CURRENT_SLIDE_PREFIX),
          presId: getRoomPresentation(roomNumber).replace(CURRENT_SLIDE_PREFIX, ''),
        });
      }
    }

    logger.info({
      logCode: 'breakout_create_rooms',
      extraInfo: { rooms: roomsArray },
    }, 'Creating breakout rooms');

    createBreakoutRoom({
      variables: {
        record,
        captureNotes,
        captureSlides,
        durationInSeconds: breakoutDuration,
        sendInviteToModerators: inviteMods,
        rooms: roomsArray,
      },
    }).then(() => {
      layoutContextDispatch({ type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN, value: true });
      layoutContextDispatch({ type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL, value: PANELS.BREAKOUT });
    });
  }, [
    numberOfRooms, freeJoin, record, captureNotes,
    captureSlides, inviteMods, roomPresentations,
  ]);

  const roomPadNum = (n: number) => n.toString().padStart(2, '0');

  const canStart = isDurationValid && (freeJoin || leastOneUserIsValid);

  const tooltipText = (() => {
    if (!isDurationValid) {
      return intl.formatMessage(
        intlMessages.minimumDurationWarnBreakout,
        { timeInMinutes: MIN_BREAKOUT_TIME / 60 },
      );
    }
    if (!freeJoin && !leastOneUserIsValid) {
      return intl.formatMessage(intlMessages.leastOneWarnBreakout);
    }
    return undefined;
  })();

  const optionsConfig = useMemo(() => [
    {
      key: 'freeJoin',
      label: intl.formatMessage(intlMessages.freeJoinLabel),
      checked: freeJoin,
      onChange: () => setFreeJoin(!freeJoin),
      allowed: true,
    },
    {
      key: 'record',
      label: intl.formatMessage(intlMessages.record),
      checked: record,
      onChange: () => setRecord(!record),
      allowed: isBreakoutRecordable && offerRecordingForBreakouts,
    },
    {
      key: 'captureSlides',
      label: intl.formatMessage(intlMessages.captureSlidesLabel),
      checked: captureSlides,
      onChange: () => setCaptureSlides(!captureSlides),
      allowed: isImportPresentationWithAnnotationsEnabled,
    },
    {
      key: 'captureNotes',
      label: intl.formatMessage(intlMessages.captureNotesLabel),
      checked: captureNotes,
      onChange: () => setCaptureNotes(!captureNotes),
      allowed: isImportSharedNotesEnabled,
    },
    {
      key: 'inviteMods',
      label: intl.formatMessage(intlMessages.sendInvitationToMods),
      checked: inviteMods,
      onChange: () => setInviteMods(!inviteMods),
      allowed: true,
    },
  ], [freeJoin, record, captureSlides, captureNotes, inviteMods,
    isBreakoutRecordable, isImportPresentationWithAnnotationsEnabled,
    isImportSharedNotesEnabled, offerRecordingForBreakouts]);

  return (
    <Styled.PanelContent>
      <PanelHeader
        panelId={PANELS.BREAKOUT}
        title={intl.formatMessage(intlMessages.breakoutTitle)}
        closeButtonLabel={intl.formatMessage(intlMessages.dismissLabel)}
      />
      <Styled.Separator />

      <CreateTimerPicker
        minBreakoutTime={MIN_BREAKOUT_TIME}
        onDurationChange={handleDurationChange}
      />

      <Styled.Separator />

      <Styled.ControlsRow>
        <Styled.RoomCountControl>
          <TooltipContainer title={intl.formatMessage(intlMessages.decreaseRooms)}>
            <Styled.RoomCountArrow
              onClick={decreaseRooms}
              disabled={numberOfRooms <= MIN_BREAKOUT_ROOMS}
              aria-label={intl.formatMessage(intlMessages.decreaseRooms)}
              data-test="decreaseRooms"
            >
              ‹
            </Styled.RoomCountArrow>
          </TooltipContainer>
          <Styled.RoomCountValue>
            {roomPadNum(numberOfRooms)}
          </Styled.RoomCountValue>
          <TooltipContainer title={intl.formatMessage(intlMessages.increaseRooms)}>
            <Styled.RoomCountArrow
              onClick={increaseRooms}
              disabled={numberOfRooms >= MAX_BREAKOUT_ROOMS}
              aria-label={intl.formatMessage(intlMessages.increaseRooms)}
              data-test="increaseRooms"
            >
              ›
            </Styled.RoomCountArrow>
          </TooltipContainer>
        </Styled.RoomCountControl>
        {(() => {
          let assignBtnLabel: string;
          let assignBtnTooltip: string;
          let assignBtnDataTest: string;
          if (assignmentState === 'allAssigned') {
            assignBtnLabel = intl.formatMessage(intlMessages.resetAssignmentsDesc);
            assignBtnTooltip = intl.formatMessage(intlMessages.resetAssignmentsDesc);
            assignBtnDataTest = 'resetAssignments';
          } else if (assignmentState === 'onlyModerators') {
            assignBtnLabel = intl.formatMessage(intlMessages.assignModeratorsRandomlyDesc);
            assignBtnTooltip = intl.formatMessage(intlMessages.assignModeratorsRandomlyDesc);
            assignBtnDataTest = 'assignModeratorsRandomly';
          } else {
            assignBtnLabel = intl.formatMessage(intlMessages.randomlyAssignDesc);
            assignBtnTooltip = intl.formatMessage(intlMessages.randomlyAssignDesc);
            assignBtnDataTest = 'randomlyAssign';
          }
          return (
            // @ts-ignore
            <Styled.RandomAssignBtn
              color="primary"
              icon={assignmentState === 'allAssigned' ? 'undo' : 'random'}
              label={assignBtnLabel}
              hideLabel
              tooltipLabel={assignBtnTooltip}
              onClick={() => {
                if (assignmentState === 'allAssigned') {
                  resetAssignmentsFunction.current();
                } else if (assignmentState === 'onlyModerators') {
                  randomlyAssignModeratorsFunction.current();
                } else {
                  randomlyAssignFunction.current();
                }
              }}
              data-test={assignBtnDataTest}
            />
          );
        })()}
      </Styled.ControlsRow>

      <Styled.MoreOptionsToggle
        data-test="moreOptionsToggle"
        onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
        aria-label={intl.formatMessage(intlMessages.moreOptions)}
        aria-expanded={moreOptionsOpen}
      >
        <Styled.ExpandIcon $expanded={moreOptionsOpen}>
          <ExpandMoreIcon />
        </Styled.ExpandIcon>
        {intl.formatMessage(intlMessages.moreOptions)}
      </Styled.MoreOptionsToggle>
      <Styled.MoreOptionsContent $expanded={moreOptionsOpen}>
        {optionsConfig.filter((o) => o.allowed).map((opt) => (
          <Styled.OptionRow key={opt.key} htmlFor={`opt-${opt.key}`}>
            <Styled.MaterialSwitch
              id={`opt-${opt.key}`}
              checked={opt.checked}
              onChange={opt.onChange}
              size="small"
            />
            {opt.label}
          </Styled.OptionRow>
        ))}
      </Styled.MoreOptionsContent>

      <Styled.ScrollContent ref={scrollContainerRef} onDragOver={handleScrollDragOver}>
        {infoBannerVisible && (
          <Styled.InfoBanner>
            <Styled.InfoIcon>ℹ</Styled.InfoIcon>
            <Styled.InfoText>
              <strong>{intl.formatMessage(intlMessages.infoBannerTitle)}</strong>
              {intl.formatMessage(intlMessages.infoBannerText)}
              {' '}
              <Styled.InfoGotItBtn
                type="button"
                onClick={() => setInfoBannerVisible(false)}
                aria-label={intl.formatMessage(intlMessages.infoBannerGotIt)}
              >
                {intl.formatMessage(intlMessages.infoBannerGotIt)}
              </Styled.InfoGotItBtn>
            </Styled.InfoText>
            <Styled.InfoClose
              onClick={() => setInfoBannerVisible(false)}
              aria-label={intl.formatMessage(intlMessages.dismissLabel)}
            >
              ✕
            </Styled.InfoClose>
          </Styled.InfoBanner>
        )}

        <RoomManagmentState
          numberOfRooms={numberOfRooms}
          users={users}
          RendererComponent={SidebarRoomAssignment}
          runningRooms={[]}
          setRoomsRef={setRoomsRef}
          setMoveRegisterRef={setMoveRegisterRef}
          setFormIsValid={setLeastOneUserIsValid}
          roomPresentations={roomPresentations}
          setRoomPresentations={setRoomPresentations}
          presentations={presentations}
          currentPresentation={currentPresentation}
          currentSlidePrefix={CURRENT_SLIDE_PREFIX}
          getRoomPresentation={getRoomPresentation}
          isUpdate={false}
          setNumberOfRooms={setNumberOfRooms}
          groups={groups}
          freeJoin={freeJoin}
          randomlyAssignFunction={(fn: () => void) => { randomlyAssignFunction.current = fn; }}
          randomlyAssignModeratorsFunction={(fn: () => void) => { randomlyAssignModeratorsFunction.current = fn; }}
          resetAssignmentsFunction={(fn: () => void) => { resetAssignmentsFunction.current = fn; }}
          onAssignmentStateChange={setAssignmentState}
          isMobile={false}
        />
      </Styled.ScrollContent>

      {tooltipText ? (
        <TooltipContainer title={tooltipText}>
          <Styled.StartButtonWrapper>
            <Styled.StartButton
              disabled={!canStart}
              onClick={handleCreateRoom}
              aria-label={intl.formatMessage(intlMessages.startLabel)}
              data-test="createBreakoutRoomsButton"
            >
              {intl.formatMessage(intlMessages.startLabel)}
            </Styled.StartButton>
          </Styled.StartButtonWrapper>
        </TooltipContainer>
      ) : (
        <Styled.StartButtonWrapper>
          <Styled.StartButton
            disabled={!canStart}
            onClick={handleCreateRoom}
            aria-label={intl.formatMessage(intlMessages.startLabel)}
            data-test="createBreakoutRoomsButton"
          >
            {intl.formatMessage(intlMessages.startLabel)}
          </Styled.StartButton>
        </Styled.StartButtonWrapper>
      )}
    </Styled.PanelContent>
  );
};

export default SidebarCreateBreakout;
