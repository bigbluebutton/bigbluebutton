import React, {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import {
  BREAKOUT_ROOM_END_ALL,
  BREAKOUT_ROOM_SET_TIME,
  BREAKOUT_ROOM_MOVE_USER,
  BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL,
} from '../../mutations';
import { BreakoutRoom as BreakoutRoomType } from '../queries';
import { getUserSubscription, getUserResponse } from '../../create-breakout-room/queries';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  dismissLabel: {
    id: 'app.presentationUploder.dismissLabel',
    description: 'dismiss label',
  },
  durationOfBreakout: {
    id: 'app.createBreakoutRoom.durationOfBreakout',
    description: 'Duration of Breakout Rooms label',
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
  genericMinimizePanel: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Generic minimize label for panels',
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
});

interface RunningBreakoutRoomProps {
  breakouts: BreakoutRoomType[];
  userId: string;
  meetingId: string;
  closePanel: () => void;
}

const DEBOUNCE_DELAY = 1500;

const RunningBreakoutRoom: React.FC<RunningBreakoutRoomProps> = ({
  breakouts,
  userId,
  meetingId,
  closePanel,
}) => {
  const intl = useIntl();
  const [timeSync] = useTimeSync();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedTimerField, setSelectedTimerField] = useState<'h' | 'm' | 's'>('m');
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [editingTime, setEditingTime] = useState<number | null>(null);
  const [megaphoneOpen, setMegaphoneOpen] = useState(false);
  const [megaphoneMessage, setMegaphoneMessage] = useState('');

  const [pendingMoves, setPendingMoves] = useState<Map<string, { toRoomId: string; userName: string }>>(new Map());

  const [breakoutRoomEndAll] = useMutation(BREAKOUT_ROOM_END_ALL);
  const [breakoutRoomSetTime] = useMutation(BREAKOUT_ROOM_SET_TIME);
  const [breakoutRoomMoveUser] = useMutation(BREAKOUT_ROOM_MOVE_USER);
  const [sendMessageToAll] = useMutation(BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL);

  const initialAssignmentsLoaded = useRef(false);

  const { data: usersData } = useDeduplicatedSubscription<getUserResponse>(getUserSubscription);
  const allUsers = usersData?.user ?? [];

  const {
    data: meetingData,
  } = useMeeting((m) => ({
    breakoutRoomsCommonProperties: m.breakoutRoomsCommonProperties,
  }));

  const breakoutProps = meetingData?.breakoutRoomsCommonProperties;
  const breakoutDurationInSeconds = breakoutProps?.durationInSeconds ?? 0;
  const parsedStartedAt = new Date(breakoutProps?.startedAt ?? '').getTime();
  const breakoutStartedAt = Number.isFinite(parsedStartedAt) ? parsedStartedAt : 0;

  useEffect(() => {
    if (initialAssignmentsLoaded.current) return;
    if (breakouts.length === 0) return;

    const raw = sessionStorage.getItem('breakoutInitialAssignments');
    if (!raw) return;

    try {
      const assignments: Record<string, { roomSequence: number; userName: string }> = JSON.parse(raw);
      sessionStorage.removeItem('breakoutInitialAssignments');
      initialAssignmentsLoaded.current = true;

      const seqToMeetingId = new Map<number, string>();
      breakouts.forEach((b) => {
        seqToMeetingId.set(b.sequence, b.breakoutRoomMeetingId);
        return undefined;
      });

      const alreadyAssigned = new Set<string>();
      breakouts.forEach((b) => {
        b.participants.filter((p) => !p.isAudioOnly).forEach((p) => {
          alreadyAssigned.add(p.userId);
          return undefined;
        });
        return undefined;
      });

      const newPending = new Map<string, { toRoomId: string; userName: string }>();
      Object.entries(assignments).forEach(([uid, info]) => {
        if (alreadyAssigned.has(uid)) return;
        const targetMeetingId = seqToMeetingId.get(info.roomSequence);
        if (targetMeetingId) {
          newPending.set(uid, { toRoomId: targetMeetingId, userName: info.userName });
        }
      });

      if (newPending.size > 0) {
        setPendingMoves((prev) => {
          const next = new Map(prev);
          newPending.forEach((val, key) => {
            if (!next.has(key)) next.set(key, val);
            return undefined;
          });
          return next;
        });
      }
    } catch (e) {
      sessionStorage.removeItem('breakoutInitialAssignments');
    }
  }, [breakouts]);

  const assignedUserIds = useMemo(() => {
    const ids = new Set<string>();
    breakouts.forEach((b) => {
      b.participants
        .filter((p) => !p.isAudioOnly)
        .forEach((p) => {
          ids.add(p.userId);
          return undefined;
        });
      return undefined;
    });
    return ids;
  }, [breakouts]);

  useEffect(() => {
    setPendingMoves((prev) => {
      const next = new Map(prev);
      let changed = false;
      next.forEach((move, uId) => {
        const targetBreakout = breakouts.find((b) => b.breakoutRoomMeetingId === move.toRoomId);
        const isInTarget = targetBreakout?.participants.some(
          (p) => p.userId === uId && !p.isAudioOnly,
        );
        const isUnassignedTarget = move.toRoomId === meetingId && !assignedUserIds.has(uId);
        if (isInTarget || isUnassignedTarget) {
          next.delete(uId);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [breakouts, assignedUserIds, meetingId]);

  const unassignedUsers = useMemo(
    () => allUsers.filter((u) => {
      const pending = pendingMoves.get(u.userId);
      if (pending && pending.toRoomId !== meetingId) return false;
      if (pending && pending.toRoomId === meetingId) return true;
      return !assignedUserIds.has(u.userId);
    }),
    [allUsers, assignedUserIds, pendingMoves, meetingId],
  );

  const getOptimisticParticipants = useCallback((breakout: BreakoutRoomType) => {
    const serverUsers = breakout.participants.filter((p) => !p.isAudioOnly);
    const filtered = serverUsers.filter((p) => {
      const pending = pendingMoves.get(p.userId);
      return !pending || pending.toRoomId === breakout.breakoutRoomMeetingId;
    });
    const existingIds = new Set(filtered.map((p) => p.userId));
    const pendingIncoming: Array<{ userId: string; name: string }> = [];
    pendingMoves.forEach((move, uId) => {
      if (move.toRoomId === breakout.breakoutRoomMeetingId && !existingIds.has(uId)) {
        pendingIncoming.push({ userId: uId, name: move.userName });
      }
      return undefined;
    });
    return { serverUsers: filtered, pendingIncoming };
  }, [pendingMoves]);

  useEffect(() => {
    const calcRemaining = () => {
      if (!Number.isFinite(breakoutStartedAt) || breakoutStartedAt === 0
        || !Number.isFinite(breakoutDurationInSeconds)) {
        return 0;
      }
      const now = Date.now() + timeSync;
      const end = breakoutStartedAt + (breakoutDurationInSeconds * 1000);
      return Math.max(0, Math.floor((end - now) / 1000));
    };

    if (editingTime === null) {
      setRemainingTime(calcRemaining());
    }

    timerIntervalRef.current = setInterval(() => {
      if (editingTime === null) {
        setRemainingTime(calcRemaining());
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [breakoutDurationInSeconds, breakoutStartedAt, timeSync, editingTime]);

  useEffect(() => () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, []);

  const displayedTime = editingTime ?? remainingTime;
  const hours = Math.floor(displayedTime / 3600);
  const minutes = Math.floor((displayedTime % 3600) / 60);
  const seconds = displayedTime % 60;
  const padNum = (n: number) => n.toString().padStart(2, '0');

  const commitTimeChange = useCallback((newTotalSeconds: number) => {
    const clamped = Math.max(60, newTotalSeconds);
    setEditingTime(clamped);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const newMinutes = Math.max(1, Math.ceil(clamped / 60));
      breakoutRoomSetTime({ variables: { timeInMinutes: newMinutes } });
      setTimeout(() => setEditingTime(null), 500);
    }, DEBOUNCE_DELAY);
  }, [breakoutRoomSetTime]);

  const adjustTime = useCallback((delta: number) => {
    let deltaSeconds = 0;
    if (selectedTimerField === 'h') deltaSeconds = delta * 3600;
    else if (selectedTimerField === 'm') deltaSeconds = delta * 60;
    else deltaSeconds = delta;

    const base = editingTime ?? remainingTime;
    commitTimeChange(base + deltaSeconds);
  }, [selectedTimerField, editingTime, remainingTime, commitTimeChange]);

  const handleTimerInputChange = useCallback((
    field: 'h' | 'm' | 's',
    value: number,
  ) => {
    let newH = hours;
    let newM = minutes;
    let newS = seconds;

    if (field === 'h') newH = Math.max(0, Math.min(23, value));
    else if (field === 'm') newM = Math.max(0, Math.min(59, value));
    else newS = Math.max(0, Math.min(59, value));

    const totalSeconds = (newH * 3600) + (newM * 60) + newS;
    commitTimeChange(totalSeconds);
  }, [hours, minutes, seconds, commitTimeChange]);

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
    let droppedUserName: string;
    try {
      const parsed = JSON.parse(data);
      droppedUserId = parsed.userId;
      fromRoomMeetingId = parsed.fromRoomId;
      droppedUserName = parsed.userName;
    } catch {
      return;
    }
    if (fromRoomMeetingId === toRoomId) return;

    setPendingMoves((prev) => {
      const next = new Map(prev);
      next.set(droppedUserId, { toRoomId, userName: droppedUserName });
      return next;
    });

    breakoutRoomMoveUser({
      variables: {
        userId: droppedUserId,
        fromBreakoutRoomMeetingId: fromRoomMeetingId,
        toBreakoutRoomMeetingId: toRoomId,
      },
    });
  }, [breakoutRoomMoveUser]);

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
  const minimizeLabel = intl.formatMessage(
    intlMessages.genericMinimizePanel,
    { panelName: title },
  );

  const chatTitle = intl.formatMessage(intlMessages.chatTitleMsgAllRooms);

  return (
    <Styled.PanelContent>
      <Styled.HeaderContainer
        title={title}
        data-test="breakoutRoomManagerHeader"
        rightButtonProps={{
          'aria-label': minimizeLabel,
          label: minimizeLabel,
          onClick: closePanel,
          icon: 'minus',
        }}
      />
      <Styled.Separator />

      <Styled.TimerSection>
        <Styled.TimerLabel>
          {intl.formatMessage(intlMessages.durationOfBreakout)}
        </Styled.TimerLabel>
        <Styled.TimerRow>
          <Styled.TimerTimeBtn
            $variant="minus"
            onClick={() => adjustTime(-1)}
            aria-label="Decrease time"
          >
            −
          </Styled.TimerTimeBtn>
          <Styled.TimerDisplay>
            <Styled.TimerInput
              type="number"
              min={0}
              max={23}
              value={padNum(hours)}
              $selected={selectedTimerField === 'h'}
              onClick={() => setSelectedTimerField('h')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleTimerInputChange('h', Number(e.target.value));
              }}
              aria-label="Hours"
            />
            <Styled.TimerColon>:</Styled.TimerColon>
            <Styled.TimerInput
              type="number"
              min={0}
              max={59}
              value={padNum(minutes)}
              $selected={selectedTimerField === 'm'}
              onClick={() => setSelectedTimerField('m')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleTimerInputChange('m', Number(e.target.value));
              }}
              aria-label="Minutes"
            />
            <Styled.TimerColon>:</Styled.TimerColon>
            <Styled.TimerInput
              type="number"
              min={0}
              max={59}
              value={padNum(seconds)}
              $selected={selectedTimerField === 's'}
              onClick={() => setSelectedTimerField('s')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                handleTimerInputChange('s', Number(e.target.value));
              }}
              aria-label="Seconds"
            />
          </Styled.TimerDisplay>
          <Styled.TimerTimeBtn
            $variant="plus"
            onClick={() => adjustTime(1)}
            aria-label="Increase time"
          >
            +
          </Styled.TimerTimeBtn>
        </Styled.TimerRow>
      </Styled.TimerSection>

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
          >
            <Styled.UsersSectionHeader>
              <span>{intl.formatMessage(intlMessages.unassignedUsers)}</span>
              <Styled.UserCount>{padNum(unassignedUsers.length)}</Styled.UserCount>
            </Styled.UsersSectionHeader>
            <Styled.UsersList>
              {unassignedUsers
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((user) => (
                  <Styled.UserItem
                    key={user.userId}
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
            const { serverUsers, pendingIncoming } = getOptimisticParticipants(breakout);
            const totalRoomUsers = serverUsers.length + pendingIncoming.length;
            const roomName = breakout.isDefaultName
              ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: breakout.sequence })
              : breakout.shortName;

            return (
              <Styled.RoomCard
                key={breakout.breakoutRoomMeetingId}
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
                  <Styled.RoomCardName>{roomName}</Styled.RoomCardName>
                  <Styled.RoomCardRight>
                    <Styled.RoomCardCount>
                      {padNum(totalRoomUsers)}
                    </Styled.RoomCardCount>
                    <Styled.RoomCardIcon>
                      <Icon iconName="user_list" />
                    </Styled.RoomCardIcon>
                  </Styled.RoomCardRight>
                </Styled.RoomCardHeader>
                {totalRoomUsers > 0 && (
                  <Styled.RoomCardUserList>
                    {serverUsers
                      .sort((a, b) => a.user.nameSortable.localeCompare(b.user.nameSortable))
                      .map((participant) => (
                        <Styled.RoomCardUserItem
                          key={participant.userId}
                          id={`running-${participant.userId}-${breakout.breakoutRoomMeetingId}`}
                          draggable
                          onDragStart={(ev) => dragStart(
                            ev,
                            participant.userId,
                            breakout.breakoutRoomMeetingId,
                            participant.user.name,
                          )}
                        >
                          {participant.user.name}
                          {participant.userId === userId
                            ? ` (${intl.formatMessage(intlMessages.you)})`
                            : ''}
                        </Styled.RoomCardUserItem>
                      ))}
                    {pendingIncoming.map((pending) => (
                      <Styled.RoomCardUserItem
                        key={`pending-${pending.userId}`}
                        style={{ opacity: 0.55, fontStyle: 'italic' }}
                      >
                        {pending.name}
                        {pending.userId === userId
                          ? ` (${intl.formatMessage(intlMessages.you)})`
                          : ''}
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
            />
            <Styled.MegaphoneSendBtn
              type="button"
              onClick={handleMegaphoneSend}
              disabled={!megaphoneMessage.trim()}
            >
              <Icon iconName="send" />
            </Styled.MegaphoneSendBtn>
          </Styled.MegaphoneChatRow>
        </Styled.MegaphoneChatArea>
      )}
      <Styled.BottomBar>
        {/* @ts-ignore */}
        <Styled.MegaphoneBtn
          icon="megaphone"
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
