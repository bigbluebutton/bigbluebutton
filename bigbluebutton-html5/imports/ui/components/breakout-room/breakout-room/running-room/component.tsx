import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Trigger from '/imports/ui/components/common/control-header/right/component';
import {
  BREAKOUT_ROOM_END_ALL,
  BREAKOUT_ROOM_MOVE_USER,
  BREAKOUT_ROOM_UNASSIGN_USER,
  BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL,
  BREAKOUT_ROOM_REQUEST_JOIN_URL,
  USER_TRANSFER_VOICE_TO_MEETING,
} from '../../mutations';
import { BreakoutRoom as BreakoutRoomType } from '../queries';
import { getUserSubscription, type getUserResponse } from '../../create-breakout-room/queries';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import BreakoutTimerEditor from '../breakout-timer-editor/component';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { PANELS } from '/imports/ui/components/layout/enums';
import PanelHeader from '/imports/ui/components/common/panel-header/component';
import { setBreakoutWindowRef } from '../service';
import { useRoverNavigation, useStopMediaOnMainRoom } from '/imports/ui/components/breakout-room/hooks';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import { useUserLiveKitMemberships } from '/imports/ui/components/livekit/memberships-manager/hooks';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  dismissLabel: {
    id: 'app.presentationUploder.dismissLabel',
    description: 'dismiss label',
  },
  unassignedUsers: {
    id: 'app.createBreakoutRoom.unassignedUsers',
    description: 'Unassigned users label',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  megaphoneLabel: {
    id: 'app.createBreakoutRoom.megaphone',
    description: 'Megaphone button label',
  },
  megaphoneTooltip: {
    id: 'app.createBreakoutRoom.megaphoneTooltip',
    description: 'Megaphone button tooltip',
  },
  finishLabel: {
    id: 'app.createBreakoutRoom.finish',
    description: 'Finish button label',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  chatTitleMsgAllRooms: {
    id: 'app.createBreakoutRoom.chatTitleMsgAllRooms',
    description: 'chat title for send message to all rooms',
  },
  inputPlaceholder: {
    id: 'app.chat.inputPlaceholder',
    description: 'Chat message input placeholder',
  },
  joinRoom: {
    id: 'app.createBreakoutRoom.join',
    description: 'Enter breakout room button label',
  },
  alreadyConnected: {
    id: 'app.createBreakoutRoom.alreadyConnected',
    description: 'Already in room label',
  },
  inviteSentToast: {
    id: 'app.createBreakoutRoom.inviteSentToast',
    description: 'Toast notification when invite is sent after moving user',
  },
  unassignUser: {
    id: 'app.update.resetRoom',
    description: 'Remove user from room',
  },
  listenToRoom: {
    id: 'app.createBreakoutRoom.listenToRoom',
    description: 'Listen to breakout room audio',
  },
  stopListeningToRoom: {
    id: 'app.createBreakoutRoom.stopListeningToRoom',
    description: 'Stop listening to breakout room audio',
  },
  listenAlreadyInRoom: {
    id: 'app.createBreakoutRoom.listenAlreadyInRoom',
    description: 'Listen option label while the user is joined in that breakout room',
  },
  sendMessage: {
    id: 'app.chat.submitLabel',
    description: 'Send message button label',
  },
  roomOptions: {
    id: 'app.createBreakoutRoom.roomOptions',
    description: 'Room options button label',
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
  moveToMainRoom: {
    id: 'app.createBreakoutRoom.moveToMainRoom',
    description: 'Move participant to main room menu item',
  },
  runningKeyboardInstructions: {
    id: 'app.createBreakoutRoom.runningKeyboardInstructions',
    description: 'Keyboard instructions for managing participants in running breakout rooms',
  },
});

const RUNNING_KEYBOARD_INSTRUCTIONS_ID = 'running-breakout-room-keyboard-instructions';

interface RunningBreakoutRoomProps {
  breakouts: BreakoutRoomType[];
  userId: string;
  meetingId: string;
  closePanel: () => void;
}

const RunningBreakoutRoom: React.FC<RunningBreakoutRoomProps> = ({
  breakouts,
  userId,
  meetingId,
  closePanel,
}) => {
  const intl = useIntl();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [megaphoneOpen, setMegaphoneOpen] = useState(false);
  const [megaphoneMessage, setMegaphoneMessage] = useState('');

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [openMoveMenu, setOpenMoveMenu] = useState<string | null>(null);
  const roomNameRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const focusRoomNameId = useRef<string | null>(null);
  const moveFocusTarget = useRef('breakoutBox-0');

  const [localRoomNames, setLocalRoomNames] = useState<Record<string, string>>({});
  const [requestingJoinForRoomId, setRequestingJoinForRoomId] = useState<string | null>(null);
  const [localListeningToRoomId, setLocalListeningToRoomId] = useState<string | null>(null);

  const [breakoutRoomEndAll] = useMutation(BREAKOUT_ROOM_END_ALL);
  const [breakoutRoomMoveUser] = useMutation(BREAKOUT_ROOM_MOVE_USER);
  const [breakoutRoomUnassignUser] = useMutation(BREAKOUT_ROOM_UNASSIGN_USER);
  const [sendMessageToAll] = useMutation(BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL);
  const [requestJoinUrl] = useMutation(BREAKOUT_ROOM_REQUEST_JOIN_URL);
  const [breakoutRoomTransfer] = useMutation(USER_TRANSFER_VOICE_TO_MEETING);
  const stopMediaOnMainRoom = useStopMediaOnMainRoom();
  const { data: currentUserData } = useCurrentUser((u) => ({ presenter: u.presenter }));
  const isPresenter = currentUserData?.presenter ?? false;

  const { data: usersData } = useDeduplicatedSubscription<getUserResponse>(getUserSubscription);
  const allUsers = usersData?.user ?? [];

  const {
    data: meetingData,
  } = useMeeting((m) => ({
    breakoutRoomsCommonProperties: m.breakoutRoomsCommonProperties,
    audioBridge: m.audioBridge,
  }));

  const breakoutProps = meetingData?.breakoutRoomsCommonProperties;
  const sendInvitationToModerators = breakoutProps?.sendInvitationToModerators ?? false;
  const breakoutDurationInSeconds = breakoutProps?.durationInSeconds ?? 0;
  const parsedStartedAt = new Date(breakoutProps?.startedAt ?? '').getTime();
  const breakoutStartedAt = Number.isFinite(parsedStartedAt) ? parsedStartedAt : 0;

  const isUsingLiveKit = meetingData?.audioBridge === 'livekit';
  const memberships = useUserLiveKitMemberships();
  // FreeSWITCH listen-in has no actual gql info to guide it, so its target room is tracked
  // optimistically here.
  // On LiveKit the membership data is the source of truth: the breakout-listen
  // membership's roomName is the breakout meeting id being listened to.
  const listeningToRoomId = isUsingLiveKit
    ? (memberships.find((m) => m.purpose === 'breakout-listen')?.roomName ?? null)
    : localListeningToRoomId;

  const assignedUserIds = useMemo(() => {
    const ids = new Set<string>();
    breakouts.forEach((b) => {
      b.participants
        .filter((p) => !p.isAudioOnly)
        .forEach((p) => {
          ids.add(p.userId);
        });
    });
    return ids;
  }, [breakouts]);

  const unassignedUsers = useMemo(
    () => allUsers.filter((u:
      { userId: string; isModerator?: boolean }) => (
      !u.isModerator || sendInvitationToModerators) && !assignedUserIds.has(u.userId)),
    [allUsers, assignedUserIds, sendInvitationToModerators],
  );

  useEffect(() => {
    if (!requestingJoinForRoomId) return;

    const breakout = breakouts.find((b) => b.breakoutRoomMeetingId === requestingJoinForRoomId);
    if (breakout?.joinURL) {
      const win = window.open(breakout.joinURL, '_blank');
      if (win) {
        setBreakoutWindowRef(win);
        stopMediaOnMainRoom(isPresenter);
      }
      setRequestingJoinForRoomId(null);
    }
  }, [breakouts, requestingJoinForRoomId, stopMediaOnMainRoom, isPresenter]);

  // The FS/mediasoup path tracks listen state locally (LK derives it from
  // memberships); keep it in sync or the menu keeps a stale "Stop listening".
  const setLocalListenTarget = useCallback((roomId: string | null) => {
    if (!isUsingLiveKit) setLocalListeningToRoomId(roomId);
  }, [isUsingLiveKit]);

  const handleEnterRoom = useCallback((breakout: BreakoutRoomType) => {
    // If listening-in to a breakout, return audio to main before _fully joining_
    // a breakout.
    if (listeningToRoomId) {
      breakoutRoomTransfer({
        variables: { fromMeetingId: listeningToRoomId, toMeetingId: meetingId },
      });
      setLocalListenTarget(null);
    }
    if (breakout.joinURL) {
      const win = window.open(breakout.joinURL, '_blank');
      if (win) {
        setBreakoutWindowRef(win);
        stopMediaOnMainRoom(isPresenter);
      }
    } else {
      requestJoinUrl({ variables: { breakoutRoomMeetingId: breakout.breakoutRoomMeetingId } });
      setRequestingJoinForRoomId(breakout.breakoutRoomMeetingId);
    }
  }, [
    requestJoinUrl, stopMediaOnMainRoom, isPresenter,
    listeningToRoomId,
    breakoutRoomTransfer,
    meetingId,
    setLocalListenTarget,
  ]);

  const handleListenToRoom = useCallback((breakout: BreakoutRoomType) => {
    if (breakout.isUserCurrentlyInRoom) return;

    if (listeningToRoomId === breakout.breakoutRoomMeetingId) {
      breakoutRoomTransfer({
        variables: {
          fromMeetingId: breakout.breakoutRoomMeetingId,
          toMeetingId: meetingId,
        },
      });
      setLocalListenTarget(null);
    } else {
      breakoutRoomTransfer({
        variables: {
          fromMeetingId: meetingId,
          toMeetingId: breakout.breakoutRoomMeetingId,
        },
      });
      setLocalListenTarget(breakout.breakoutRoomMeetingId);
    }
  }, [listeningToRoomId, setLocalListenTarget, breakoutRoomTransfer, meetingId]);

  const padNum = (n: number) => n.toString().padStart(2, '0');

  const handleFinish = useCallback(() => {
    closePanel();
    breakoutRoomEndAll();
  }, [closePanel, breakoutRoomEndAll]);

  const handleMegaphoneSend = useCallback(() => {
    if (megaphoneMessage.trim()) {
      sendMessageToAll({ variables: { message: megaphoneMessage.trim() } });
      setMegaphoneMessage('');
      setMegaphoneOpen(false);
    }
  }, [megaphoneMessage, sendMessageToAll]);

  const dragStart = (
    ev: React.DragEvent<HTMLDivElement>,
    visUserId: string,
    fromRoomId: string,
    userName: string,
  ) => {
    ev.dataTransfer.setData('text', JSON.stringify({ userId: visUserId, fromRoomId, userName }));
    const ghost = document.createElement('div');
    ghost.textContent = userName;
    // eslint-disable-next-line max-len
    ghost.style.cssText = 'position:absolute;top:-9999px;padding:4px 8px;background:#fff;border:1px solid #ccc;border-radius:4px;font-size:0.85rem;white-space:nowrap;';
    document.body.appendChild(ghost);
    ev.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => ghost.remove());
  };

  const handleUnassignUser = useCallback((unassignedUserId: string, breakoutRoomMeetingId: string) => {
    breakoutRoomUnassignUser({
      variables: {
        userId: unassignedUserId,
        breakoutRoomMeetingId,
      },
    }).catch((err: unknown) => {
      logger.error(
        { logCode: 'breakout_unassign_user_failed', extraInfo: { error: err } },
        'Failed to unassign user from breakout room',
      );
    });
  }, [breakoutRoomUnassignUser]);

  const roomDisplayName = useCallback((room: BreakoutRoomType) => (
    room.isDefaultName
      ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: room.sequence })
      : room.shortName
  ), [intl]);

  const moveUserBetweenRooms = useCallback((
    movedUserId: string,
    fromRoomMeetingId: string,
    toRoomMeetingId: string,
    userName: string,
  ) => {
    if (fromRoomMeetingId === toRoomMeetingId) return;
    if (toRoomMeetingId === meetingId) {
      handleUnassignUser(movedUserId, fromRoomMeetingId);
      return;
    }
    breakoutRoomMoveUser({
      variables: {
        userId: movedUserId,
        fromBreakoutRoomMeetingId: fromRoomMeetingId,
        toBreakoutRoomMeetingId: toRoomMeetingId,
      },
    }).then(() => {
      const targetRoom = breakouts.find((b) => b.breakoutRoomMeetingId === toRoomMeetingId);
      const targetRoomName = targetRoom ? roomDisplayName(targetRoom) : '';
      notify(intl.formatMessage(intlMessages.inviteSentToast, {
        userName: userName || movedUserId,
        roomName: targetRoomName,
      }), 'success', 'user');
    }).catch((err: unknown) => logger.error(
      { logCode: 'breakout_move_user_failed', extraInfo: { error: err } },
      'Failed to move user between breakout rooms',
    ));
  }, [breakoutRoomMoveUser, handleUnassignUser, breakouts, intl, meetingId, roomDisplayName]);

  const handleDrop = useCallback((toRoomId: string) => (ev: React.DragEvent) => {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    const data = ev.dataTransfer.getData('text');
    let droppedUserId: string;
    let fromRoomMeetingId: string;
    let userName: string;
    try {
      const parsed = JSON.parse(data);
      droppedUserId = parsed.userId;
      fromRoomMeetingId = parsed.fromRoomId;
      userName = parsed.userName || '';
    } catch {
      return;
    }
    moveUserBetweenRooms(droppedUserId, fromRoomMeetingId, toRoomId, userName);
  }, [moveUserBetweenRooms]);

  const rover = useRoverNavigation('draggableUser', () => {}, breakouts.length, undefined, false);
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
      (document.getElementById(rowId) || document.getElementById(moveFocusTarget.current))?.focus();
    });
  };

  useEffect(() => {
    if (!editingRoomId && focusRoomNameId.current) {
      roomNameRefs.current[focusRoomNameId.current]?.focus();
      focusRoomNameId.current = null;
    }
  }, [editingRoomId]);

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

  const title = intl.formatMessage(intlMessages.breakoutTitle);

  const chatTitle = intl.formatMessage(intlMessages.chatTitleMsgAllRooms);

  return (
    <Styled.PanelContent>
      <PanelHeader
        panelId={PANELS.BREAKOUT}
        title={title}
        dataTest="breakoutRoomManagerHeader"
      />
      <Styled.Separator />

      <BreakoutTimerEditor
        breakoutDurationInSeconds={breakoutDurationInSeconds}
        breakoutStartedAt={breakoutStartedAt}
      />

      <Styled.Separator />

      <Styled.ScrollContent ref={scrollContainerRef} onDragOver={handleScrollDragOver}>
        <span id={RUNNING_KEYBOARD_INSTRUCTIONS_ID} className="sr-only">
          {intl.formatMessage(intlMessages.runningKeyboardInstructions)}
        </span>
        <Styled.UsersSection
          onDragOver={(ev) => {
            ev.preventDefault();
            ev.currentTarget.classList.add('drag-over');
          }}
          onDragEnter={(ev) => {
            ev.preventDefault();
            ev.currentTarget.classList.add('drag-over');
          }}
          onDragLeave={(ev) => {
            ev.currentTarget.classList.remove('drag-over');
          }}
          onDrop={handleDrop(meetingId)}
          id="breakoutBox-0"
          tabIndex={0}
          onKeyDown={rover}
          aria-describedby={RUNNING_KEYBOARD_INSTRUCTIONS_ID}
        >
          <Styled.UsersSectionHeader>
            <span>{intl.formatMessage(intlMessages.unassignedUsers)}</span>
            <Styled.UserCount>{padNum(unassignedUsers.length)}</Styled.UserCount>
          </Styled.UsersSectionHeader>
          <Styled.UsersList>
            {unassignedUsers
              .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))
              .map((user: { userId: string; name: string }) => (
                <Styled.UserItem
                  key={user.userId}
                  id={`running-${user.userId}-main`}
                  data-test="draggableUser"
                  draggable
                  tabIndex={-1}
                  onKeyDown={(e) => openMenuFromRow(e, `running-${user.userId}-main`)}
                  onKeyUp={(e) => openMenuFromRowKeyUp(e, `running-${user.userId}-main`)}
                  onDragStart={(ev) => dragStart(ev, user.userId, meetingId, user.name)}
                >
                  <span>
                    {user.name}
                    {user.userId === userId ? ` (${intl.formatMessage(intlMessages.you)})` : ''}
                  </span>
                  <BBBMenu
                    open={openMoveMenu === `running-${user.userId}-main`}
                    onCloseCallback={() => closeMoveMenu(`running-${user.userId}-main`)}
                    trigger={(
                      <Styled.MoveUserBtn
                        type="button"
                        tabIndex={-1}
                        aria-label={intl.formatMessage(
                          intlMessages.moveUserMenu,
                          { userName: user.name },
                        )}
                        aria-haspopup="menu"
                        aria-expanded={openMoveMenu === `running-${user.userId}-main`}
                        data-test="moveUserMenuButton"
                        onClick={() => setOpenMoveMenu(`running-${user.userId}-main`)}
                      />
                    )}
                    actions={breakouts.map((room) => ({
                      key: room.breakoutRoomMeetingId,
                      label: intl.formatMessage(
                        intlMessages.moveToRoom,
                        { roomName: roomDisplayName(room) },
                      ),
                      dataTest: `moveUserToRoom${room.sequence}`,
                      onClick: () => {
                        moveFocusTarget.current = `breakoutBox-${room.sequence}`;
                        moveUserBetweenRooms(
                          user.userId,
                          meetingId,
                          room.breakoutRoomMeetingId,
                          user.name,
                        );
                      },
                    }))}
                    opts={{ autoFocus: true, transitionDuration: 0 }}
                  />
                </Styled.UserItem>
              ))}
          </Styled.UsersList>
        </Styled.UsersSection>

        <Styled.RoomCardsContainer data-test="breakoutRoomList">
          {breakouts.map((breakout) => {
            const roomParticipants = breakout.participants.filter((p) => !p.isAudioOnly);
            const totalRoomUsers = roomParticipants.length;
            const roomName = roomDisplayName(breakout);

            const displayName = localRoomNames[breakout.breakoutRoomMeetingId] ?? roomName;
            const isEditing = editingRoomId === breakout.breakoutRoomMeetingId;
            const isListening = listeningToRoomId === breakout.breakoutRoomMeetingId;

            return (
              <Styled.RoomCard
                id={`breakoutBox-${breakout.sequence}`}
                key={breakout.breakoutRoomMeetingId}
                // eslint-disable-next-line max-len
                data-test={breakout.isUserCurrentlyInRoom ? 'alreadyConnected' : undefined}
                onDrop={handleDrop(breakout.breakoutRoomMeetingId)}
                onDragOver={(ev) => {
                  ev.preventDefault();
                  ev.currentTarget.classList.add('drag-over');
                }}
                onDragEnter={(ev) => {
                  ev.preventDefault();
                  ev.currentTarget.classList.add('drag-over');
                }}
                onDragLeave={(ev) => {
                  ev.currentTarget.classList.remove('drag-over');
                }}
                tabIndex={0}
                onKeyDown={rover}
                aria-describedby={RUNNING_KEYBOARD_INSTRUCTIONS_ID}
              >
                <Styled.RoomCardHeader>
                  <Styled.RoomCardLeft>
                    {isEditing ? (
                      <Styled.RoomNameInput
                        aria-label={intl.formatMessage(intlMessages.roomNameLabel)}
                        value={displayName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setLocalRoomNames((prev) => ({
                            ...prev,
                            [breakout.breakoutRoomMeetingId]: e.target.value,
                          }));
                        }}
                        onBlur={() => setEditingRoomId(null)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            focusRoomNameId.current = breakout.breakoutRoomMeetingId;
                            setEditingRoomId(null);
                          }
                        }}
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <Styled.RoomCardName
                        type="button"
                        ref={(element) => { roomNameRefs.current[breakout.breakoutRoomMeetingId] = element; }}
                        title={displayName}
                        onClick={() => setEditingRoomId(breakout.breakoutRoomMeetingId)}
                        aria-label={intl.formatMessage(intlMessages.renameRoom, { roomName: displayName })}
                        data-test={`${roomName}`}
                      >
                        {displayName}
                      </Styled.RoomCardName>
                    )}
                    <Styled.RoomCardCountLeft>
                      {padNum(totalRoomUsers)}
                      <Icon iconName="user_list" />
                    </Styled.RoomCardCountLeft>
                  </Styled.RoomCardLeft>
                  <Styled.RoomCardMenuWrapper>
                    <BBBMenu
                      trigger={(
                        <Trigger
                          label={intl.formatMessage(intlMessages.roomOptions)}
                          aria-label={intl.formatMessage(intlMessages.roomOptions)}
                          hideLabel
                          icon="more"
                          data-test={`roomOptions${breakout.sequence}`}
                          onClick={() => {}}
                        />
                      )}
                      actions={[
                        {
                          key: `join-${breakout.breakoutRoomMeetingId}`,
                          label: breakout.isUserCurrentlyInRoom
                            ? intl.formatMessage(intlMessages.alreadyConnected)
                            : intl.formatMessage(intlMessages.joinRoom),
                          disabled: breakout.isUserCurrentlyInRoom,
                          dataTest: breakout.isUserCurrentlyInRoom ? 'alreadyConnected' : `askToJoinRoom${breakout.sequence}`,
                          onClick: () => handleEnterRoom(breakout),
                        },
                        {
                          key: `listen-${breakout.breakoutRoomMeetingId}`,
                          // A live full join in this room (another tab) would play the
                          // listen-in mic back to the user through that session.
                          label: breakout.isUserCurrentlyInRoom
                            ? intl.formatMessage(intlMessages.listenAlreadyInRoom)
                            : intl.formatMessage(
                              isListening ? intlMessages.stopListeningToRoom : intlMessages.listenToRoom,
                            ),
                          disabled: breakout.isUserCurrentlyInRoom,
                          dataTest: `listenToBreakoutRoomButton${breakout.sequence}`,
                          onClick: () => handleListenToRoom(breakout),
                        },
                      ]}
                      opts={{
                        id: `breakout-room-options-${breakout.breakoutRoomMeetingId}`,
                        keepMounted: true,
                        transitionDuration: 0,
                        elevation: 3,
                        getcontentanchorel: null,
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        transformOrigin: { vertical: 'top', horizontal: 'left' },
                      }}
                    />
                  </Styled.RoomCardMenuWrapper>
                </Styled.RoomCardHeader>
                {totalRoomUsers > 0 && (
                  <Styled.RoomCardUserList>
                    {roomParticipants
                      .sort((a, b) => a.user.nameSortable.localeCompare(b.user.nameSortable))
                      .map((participant) => (
                        <Styled.RoomCardUserItem
                          key={participant.userId}
                          id={`running-${participant.userId}-${breakout.breakoutRoomMeetingId}`}
                          data-test="draggableUser"
                          draggable
                          tabIndex={-1}
                          onKeyDown={(e) => openMenuFromRow(
                            e,
                            `running-${participant.userId}-${breakout.breakoutRoomMeetingId}`,
                          )}
                          onKeyUp={(e) => openMenuFromRowKeyUp(
                            e,
                            `running-${participant.userId}-${breakout.breakoutRoomMeetingId}`,
                          )}
                          onDragStart={(ev) => dragStart(
                            ev,
                            participant.userId,
                            breakout.breakoutRoomMeetingId,
                            participant.user.name,
                          )}
                        >
                          <span data-test={`userNameBreakoutRoom-${roomName}`}>
                            {participant.user.name}
                            {participant.userId === userId
                              ? ` (${intl.formatMessage(intlMessages.you)})`
                              : ''}
                          </span>
                          <BBBMenu
                            open={openMoveMenu === (
                              `running-${participant.userId}-${breakout.breakoutRoomMeetingId}`
                            )}
                            onCloseCallback={() => closeMoveMenu(
                              `running-${participant.userId}-${breakout.breakoutRoomMeetingId}`,
                            )}
                            trigger={(
                              <Styled.MoveUserBtn
                                type="button"
                                tabIndex={-1}
                                aria-label={intl.formatMessage(
                                  intlMessages.moveUserMenu,
                                  { userName: participant.user.name },
                                )}
                                aria-haspopup="menu"
                                aria-expanded={openMoveMenu === (
                                  `running-${participant.userId}-${breakout.breakoutRoomMeetingId}`
                                )}
                                data-test="moveUserMenuButton"
                                onClick={() => setOpenMoveMenu(
                                  `running-${participant.userId}-${breakout.breakoutRoomMeetingId}`,
                                )}
                              />
                            )}
                            actions={[
                              ...breakouts
                                .filter((room) => (
                                  room.breakoutRoomMeetingId !== breakout.breakoutRoomMeetingId
                                ))
                                .map((room) => ({
                                  key: room.breakoutRoomMeetingId,
                                  label: intl.formatMessage(
                                    intlMessages.moveToRoom,
                                    { roomName: roomDisplayName(room) },
                                  ),
                                  dataTest: `moveUserToRoom${room.sequence}`,
                                  onClick: () => {
                                    moveFocusTarget.current = `breakoutBox-${room.sequence}`;
                                    moveUserBetweenRooms(
                                      participant.userId,
                                      breakout.breakoutRoomMeetingId,
                                      room.breakoutRoomMeetingId,
                                      participant.user.name,
                                    );
                                  },
                                })),
                              {
                                key: 'main',
                                label: intl.formatMessage(intlMessages.moveToMainRoom),
                                dataTest: 'moveUserToMainRoom',
                                onClick: () => {
                                  moveFocusTarget.current = 'breakoutBox-0';
                                  moveUserBetweenRooms(
                                    participant.userId,
                                    breakout.breakoutRoomMeetingId,
                                    meetingId,
                                    participant.user.name,
                                  );
                                },
                              },
                            ]}
                            opts={{ autoFocus: true, transitionDuration: 0 }}
                          />
                          <Styled.UserRemoveBtn
                            type="button"
                            aria-label={intl.formatMessage(intlMessages.unassignUser)}
                            data-test="unassignUserFromBreakoutRoom"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleUnassignUser(participant.userId, breakout.breakoutRoomMeetingId);
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
      </Styled.ScrollContent>

      {megaphoneOpen && (
        <Styled.MegaphoneChatArea>
          <Styled.MegaphoneChatRow>
            <Styled.MegaphoneChatInput
              type="text"
              value={megaphoneMessage}
              onChange={(e) => setMegaphoneMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMegaphoneSend();
              }}
              placeholder={intl.formatMessage(intlMessages.inputPlaceholder, { chatName: chatTitle })}
              data-test="messageInput"
            />
            <Styled.MegaphoneSendBtn
              type="button"
              onClick={handleMegaphoneSend}
              disabled={!megaphoneMessage.trim()}
              aria-label={intl.formatMessage(intlMessages.sendMessage)}
              data-test="sendMessageButton"
            >
              <Icon iconName="send" />
            </Styled.MegaphoneSendBtn>
          </Styled.MegaphoneChatRow>
        </Styled.MegaphoneChatArea>
      )}
      <Styled.BottomBar>
        <Styled.BottomBarButton
          labelOverflow="ellipsis"
          variant="secondary"
          label={intl.formatMessage(intlMessages.megaphoneLabel)}
          tooltipLabel={intl.formatMessage(intlMessages.megaphoneTooltip)}
          onClick={() => setMegaphoneOpen(!megaphoneOpen)}
          dataTest="megaphoneButton"
        />
        <Styled.BottomBarButton
          labelOverflow="ellipsis"
          variant="primary"
          color="danger"
          label={intl.formatMessage(intlMessages.finishLabel)}
          onClick={handleFinish}
          dataTest="finishBreakoutButton"
        />
      </Styled.BottomBar>
    </Styled.PanelContent>
  );
};

export default RunningBreakoutRoom;
