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
import { useStopMediaOnMainRoom } from '/imports/ui/components/breakout-room/hooks';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';

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
  sendMessage: {
    id: 'app.chat.submitLabel',
    description: 'Send message button label',
  },
  roomOptions: {
    id: 'app.createBreakoutRoom.roomOptions',
    description: 'Room options button label',
  },
});

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

  const [localRoomNames, setLocalRoomNames] = useState<Record<string, string>>({});
  const [requestingJoinForRoomId, setRequestingJoinForRoomId] = useState<string | null>(null);
  const [listeningToRoomId, setListeningToRoomId] = useState<string | null>(null);

  const [breakoutRoomEndAll] = useMutation(BREAKOUT_ROOM_END_ALL);
  const [breakoutRoomMoveUser] = useMutation(BREAKOUT_ROOM_MOVE_USER);
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
  const isUsingLiveKit = meetingData?.audioBridge === 'livekit';
  const sendInvitationToModerators = breakoutProps?.sendInvitationToModerators ?? false;
  const breakoutDurationInSeconds = breakoutProps?.durationInSeconds ?? 0;
  const parsedStartedAt = new Date(breakoutProps?.startedAt ?? '').getTime();
  const breakoutStartedAt = Number.isFinite(parsedStartedAt) ? parsedStartedAt : 0;

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

  const handleEnterRoom = useCallback((breakout: BreakoutRoomType) => {
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
  }, [requestJoinUrl, stopMediaOnMainRoom, isPresenter]);

  const handleListenToRoom = useCallback((breakout: BreakoutRoomType) => {
    if (listeningToRoomId === breakout.breakoutRoomMeetingId) {
      breakoutRoomTransfer({
        variables: {
          fromMeetingId: breakout.breakoutRoomMeetingId,
          toMeetingId: meetingId,
        },
      });
      setListeningToRoomId(null);
    } else {
      breakoutRoomTransfer({
        variables: {
          fromMeetingId: meetingId,
          toMeetingId: breakout.breakoutRoomMeetingId,
        },
      });
      setListeningToRoomId(breakout.breakoutRoomMeetingId);
    }
  }, [listeningToRoomId, breakoutRoomTransfer, meetingId]);

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

  const dragStart = (ev: React.DragEvent<HTMLDivElement>, visUserId: string, fromRoomId: string, userName: string) => {
    ev.dataTransfer.setData('text', JSON.stringify({ userId: visUserId, fromRoomId, userName }));
    const ghost = document.createElement('div');
    ghost.textContent = userName;
    ghost.style.cssText = 'position:absolute;top:-9999px;padding:4px 8px;background:#fff;border:1px solid #ccc;border-radius:4px;font-size:0.85rem;white-space:nowrap;';
    document.body.appendChild(ghost);
    ev.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => ghost.remove());
  };

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
    if (fromRoomMeetingId === toRoomId) return;

    breakoutRoomMoveUser({
      variables: {
        userId: droppedUserId,
        fromBreakoutRoomMeetingId: fromRoomMeetingId,
        toBreakoutRoomMeetingId: toRoomId,
      },
    }).then(() => {
      const targetRoom = breakouts.find((b) => b.breakoutRoomMeetingId === toRoomId);
      let targetRoomName = '';
      if (targetRoom) {
        targetRoomName = targetRoom.isDefaultName
          ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: targetRoom.sequence })
          : targetRoom.shortName;
      }
      notify(
        intl.formatMessage(intlMessages.inviteSentToast, {
          userName: userName || droppedUserId,
          roomName: targetRoomName,
        }),
        'success',
        'user',
      );
    }).catch((err: unknown) => {
      logger.error(
        { logCode: 'breakout_move_user_failed', extraInfo: { error: err } },
        'Failed to move user between breakout rooms',
      );
    });
  }, [breakoutRoomMoveUser, breakouts, intl]);

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
        {unassignedUsers.length > 0 && (
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
                    data-test="draggableUser"
                    draggable
                    onDragStart={(ev) => dragStart(ev, user.userId, meetingId, user.name)}
                  >
                    {user.name}
                    {user.userId === userId
                      ? ` (${intl.formatMessage(intlMessages.you)})`
                      : ''}
                  </Styled.UserItem>
                ))}
            </Styled.UsersList>
          </Styled.UsersSection>
        )}

        <Styled.RoomCardsContainer>
          {breakouts.map((breakout) => {
            const roomParticipants = breakout.participants.filter((p) => !p.isAudioOnly);
            const totalRoomUsers = roomParticipants.length;
            const roomName = breakout.isDefaultName
              ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: breakout.sequence })
              : breakout.shortName;

            const displayName = localRoomNames[breakout.breakoutRoomMeetingId] ?? roomName;
            const isEditing = editingRoomId === breakout.breakoutRoomMeetingId;
            const isListening = listeningToRoomId === breakout.breakoutRoomMeetingId;

            return (
              <Styled.RoomCard
                id={`breakoutBox-${breakout.sequence}`}
                key={breakout.breakoutRoomMeetingId}
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
              >
                <Styled.RoomCardHeader>
                  <Styled.RoomCardLeft>
                    {isEditing ? (
                      <Styled.RoomNameInput
                        value={displayName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setLocalRoomNames((prev) => ({
                            ...prev,
                            [breakout.breakoutRoomMeetingId]: e.target.value,
                          }));
                        }}
                        onBlur={() => setEditingRoomId(null)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === 'Escape') setEditingRoomId(null);
                        }}
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <Styled.RoomCardName
                        title={displayName}
                        onClick={() => setEditingRoomId(breakout.breakoutRoomMeetingId)}
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
                        ...(!isUsingLiveKit ? [{
                          key: `listen-${breakout.breakoutRoomMeetingId}`,
                          label: isListening
                            ? intl.formatMessage(intlMessages.stopListeningToRoom)
                            : intl.formatMessage(intlMessages.listenToRoom),
                          dataTest: 'listenToBreakoutRoomButton',
                          onClick: () => handleListenToRoom(breakout),
                        }] : []),
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
                          <Styled.UserRemoveBtn
                            type="button"
                            aria-label={intl.formatMessage(intlMessages.unassignUser)}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              breakoutRoomMoveUser({
                                variables: {
                                  userId: participant.userId,
                                  fromBreakoutRoomMeetingId: breakout.breakoutRoomMeetingId,
                                  toBreakoutRoomMeetingId: meetingId,
                                },
                              });
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
        {/* @ts-ignore */}
        <Styled.MegaphoneBtn
          label={intl.formatMessage(intlMessages.megaphoneLabel)}
          onClick={() => setMegaphoneOpen(!megaphoneOpen)}
          title={intl.formatMessage(intlMessages.megaphoneTooltip)}
          data-test="megaphoneButton"
        />
        {/* @ts-ignore */}
        <Styled.FinishBtn
          label={intl.formatMessage(intlMessages.finishLabel)}
          onClick={handleFinish}
          data-test="finishBreakoutButton"
        />
      </Styled.BottomBar>
    </Styled.PanelContent>
  );
};

export default RunningBreakoutRoom;
