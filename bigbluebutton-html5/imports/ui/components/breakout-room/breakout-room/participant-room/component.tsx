import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import { BreakoutRoom as BreakoutRoomType } from '../queries';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  USER_TRANSFER_VOICE_TO_MEETING,
  BREAKOUT_ROOM_CALL_MODERATOR,
  BREAKOUT_ROOM_REQUEST_JOIN_URL,
} from '../../mutations';
import { notify } from '/imports/ui/services/notification';
import { useStopMediaOnMainRoom } from '/imports/ui/components/breakout-room/hooks';
import { setBreakoutWindowRef, rejoinAudio, closeBreakoutWindow } from '/imports/ui/components/breakout-room/breakout-room/service';
import { USER_LEAVE_MEETING } from '/imports/ui/core/graphql/mutations/userMutations';
import Session from '/imports/ui/services/storage/in-memory';
import BreakoutCountdown from '../breakout-countdown/component';

const CALL_MODERATOR_COOLDOWN_MS = 30000;

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  youAreInRoom: {
    id: 'app.createBreakoutRoom.youAreInRoom',
    description: 'Message telling user which room they are in',
  },
  joinRoom: {
    id: 'app.createBreakoutRoom.join',
    description: 'Enter breakout room button label',
  },
  alreadyConnected: {
    id: 'app.createBreakoutRoom.alreadyConnected',
    description: 'Already in room label',
  },
  callModerator: {
    id: 'app.createBreakoutRoom.callModerator',
    description: 'Call moderator button label',
  },
  returnToMainSession: {
    id: 'app.createBreakoutRoom.returnToMainSession',
    description: 'Return to main session button label',
  },
  genericMinimizePanel: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Generic minimize label for panels',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  notAssignedLabel: {
    id: 'app.createBreakoutRoom.notAssignedLabel',
    description: 'Label telling user they are not in a breakout room',
  },
  notAssignedHelp: {
    id: 'app.createBreakoutRoom.notAssignedHelp',
    description: 'Text asking user to contact moderator to be assigned',
  },
  callModeratorSent: {
    id: 'app.createBreakoutRoom.callModeratorSent',
    description: 'Toast message confirming call moderator was sent',
  },
  callModeratorCooldown: {
    id: 'app.createBreakoutRoom.callModeratorCooldown',
    description: 'Toast message when call moderator is on cooldown',
  },
  requestToJoin: {
    id: 'app.createBreakoutRoom.askToJoin',
    description: 'Request to join a breakout room',
  },
});

interface ParticipantBreakoutRoomProps {
  breakouts: BreakoutRoomType[];
  meetingId: string;
  presenter: boolean;
  userJoinedAudio: boolean;
  closePanel: () => void;
  isInBreakout?: boolean;
  breakoutMeetingId?: string;
}

const ParticipantBreakoutRoom: React.FC<ParticipantBreakoutRoomProps> = ({
  breakouts,
  meetingId,
  presenter,
  userJoinedAudio,
  closePanel,
  isInBreakout = false,
  breakoutMeetingId = '',
}) => {
  const intl = useIntl();
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [requestedBreakoutRoomId, setRequestedBreakoutRoomId] = useState<string>('');

  const [breakoutRoomTransfer] = useMutation(USER_TRANSFER_VOICE_TO_MEETING);
  const [callModerator] = useMutation(BREAKOUT_ROOM_CALL_MODERATOR);
  const [requestJoinUrl] = useMutation(BREAKOUT_ROOM_REQUEST_JOIN_URL);
  const [userLeaveMeeting] = useMutation(USER_LEAVE_MEETING);
  const stopMediaOnMainRoom = useStopMediaOnMainRoom();
  const [callModeratorCooldown, setCallModeratorCooldown] = useState(false);

  const {
    data: meetingData,
  } = useMeeting((m) => ({
    breakoutRoomsCommonProperties: m.breakoutRoomsCommonProperties,
    durationInSeconds: m.durationInSeconds,
    createdTime: m.createdTime,
    breakoutPolicies: m.breakoutPolicies,
    name: m.name,
    audioBridge: m.audioBridge,
  }));

  const freeJoin = meetingData?.breakoutRoomsCommonProperties?.freeJoin ?? false;
  const isUsingLiveKit = meetingData?.audioBridge === 'livekit';

  const breakoutDurationInSeconds = isInBreakout
    ? (meetingData?.durationInSeconds ?? 0)
    : (meetingData?.breakoutRoomsCommonProperties?.durationInSeconds ?? 0);
  const breakoutStartedAt = isInBreakout
    ? (meetingData?.createdTime ?? 0)
    : (() => {
      const p = new Date(meetingData?.breakoutRoomsCommonProperties?.startedAt ?? '').getTime();
      return Number.isFinite(p) ? p : 0;
    })();

  const selfRoomSequence = meetingData?.breakoutPolicies?.sequence ?? 0;
  const selfRoomName = isInBreakout
    ? (meetingData?.name
      ?? (selfRoomSequence
        ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: selfRoomSequence })
        : ''))
    : '';

  const userRoom = breakouts.find(
    (b) => b.isLastAssignedRoom || b.isUserCurrentlyInRoom,
  );

  const getUserRoomName = () => {
    if (!userRoom) return '';
    if (userRoom.isDefaultName) {
      return intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: userRoom.sequence });
    }
    return userRoom.shortName;
  };
  const userRoomName = getUserRoomName();

  useEffect(() => () => {
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
  }, []);

  useEffect(() => {
    if (requestedBreakoutRoomId) {
      const breakout = breakouts.find(
        (b) => b.breakoutRoomMeetingId === requestedBreakoutRoomId,
      );
      if (breakout && breakout.joinURL) {
        const win = window.open(breakout.joinURL, '_blank');
        if (win) setBreakoutWindowRef(win);
        setRequestedBreakoutRoomId('');
        stopMediaOnMainRoom(presenter);
      }
    }
  }, [breakouts, requestedBreakoutRoomId, stopMediaOnMainRoom, presenter]);

  const handleCallModerator = useCallback(() => {
    if (callModeratorCooldown) {
      notify(
        intl.formatMessage(intlMessages.callModeratorCooldown),
        'warning',
        'warning',
      );
      return;
    }

    const roomId = isInBreakout ? breakoutMeetingId : userRoom?.breakoutRoomMeetingId;
    if (!roomId) return;

    callModerator({
      variables: {
        breakoutRoomId: roomId,
      },
    }).then(() => {
      notify(
        intl.formatMessage(intlMessages.callModeratorSent),
        'success',
        'user',
      );

      setCallModeratorCooldown(true);
      cooldownTimerRef.current = setTimeout(() => setCallModeratorCooldown(false), CALL_MODERATOR_COOLDOWN_MS);
    }).catch(() => {
      notify(
        intl.formatMessage(intlMessages.callModeratorCooldown),
        'warning',
        'warning',
      );
    });
  }, [
    callModerator, intl, callModeratorCooldown, userRoom, isInBreakout, breakoutMeetingId,
  ]);

  const handleEnterRoom = useCallback(() => {
    if (!userRoom) return;
    if (userRoom.joinURL) {
      const win = window.open(userRoom.joinURL, '_blank');
      if (win) setBreakoutWindowRef(win);
      stopMediaOnMainRoom(presenter);
    } else {
      requestJoinUrl({ variables: { breakoutRoomMeetingId: userRoom.breakoutRoomMeetingId } });
      setRequestedBreakoutRoomId(userRoom.breakoutRoomMeetingId);
    }
  }, [userRoom, requestJoinUrl, stopMediaOnMainRoom, presenter]);

  const handleFreeJoinRoom = useCallback((breakout: BreakoutRoomType) => {
    if (breakout.joinURL) {
      const win = window.open(breakout.joinURL, '_blank');
      if (win) setBreakoutWindowRef(win);
      stopMediaOnMainRoom(presenter);
    } else {
      requestJoinUrl({ variables: { breakoutRoomMeetingId: breakout.breakoutRoomMeetingId } });
      setRequestedBreakoutRoomId(breakout.breakoutRoomMeetingId);
    }
  }, [requestJoinUrl, stopMediaOnMainRoom, presenter]);

  const handleReturnToMainSession = useCallback(() => {
    if (isInBreakout) {
      userLeaveMeeting();
      Session.setItem('codeError', '680');
      return;
    }
    closeBreakoutWindow();
    if (!isUsingLiveKit && userJoinedAudio && userRoom) {
      breakoutRoomTransfer({
        variables: {
          fromMeetingId: userRoom.breakoutRoomMeetingId,
          toMeetingId: meetingId,
        },
      });
    }

    rejoinAudio();
    closePanel();
  }, [
    isInBreakout, userJoinedAudio, userRoom, meetingId,
    breakoutRoomTransfer, closePanel,
    rejoinAudio, userLeaveMeeting,
  ]);

  const title = intl.formatMessage(intlMessages.breakoutTitle);
  const minimizeLabel = intl.formatMessage(
    intlMessages.genericMinimizePanel,
    { panelName: title },
  );

  const renderRoomInfo = () => {
    if (isInBreakout) {
      return (
        <Styled.InfoCard>
          <Styled.RoomNumberSquare>
            {selfRoomSequence}
          </Styled.RoomNumberSquare>
          <Styled.InfoText>
            {intl.formatMessage(intlMessages.youAreInRoom, { roomName: selfRoomName })}
          </Styled.InfoText>
        </Styled.InfoCard>
      );
    }
    if (!freeJoin) {
      if (userRoom) {
        const isCurrentlyInRoom = userRoom.isUserCurrentlyInRoom;
        return (
          <Styled.InfoCard>
            <Styled.RoomNumberSquare>
              {userRoom.sequence}
            </Styled.RoomNumberSquare>
            <Styled.InfoText>
              {intl.formatMessage(intlMessages.youAreInRoom, { roomName: userRoomName })}
            </Styled.InfoText>
            <Styled.EnterRoomBtn
              type="button"
              onClick={handleEnterRoom}
              data-test={isCurrentlyInRoom ? 'alreadyConnected' : 'joinRoom'}
              disabled={isCurrentlyInRoom}
              aria-label={isCurrentlyInRoom
                ? intl.formatMessage(intlMessages.alreadyConnected)
                : intl.formatMessage(intlMessages.joinRoom)}
            >
              {isCurrentlyInRoom
                ? intl.formatMessage(intlMessages.alreadyConnected)
                : intl.formatMessage(intlMessages.joinRoom)}
            </Styled.EnterRoomBtn>
          </Styled.InfoCard>
        );
      }
      return (
        <>
          <Styled.InfoCard>
            <Icon iconName="unassigned" />
            <Styled.InfoText>
              {intl.formatMessage(intlMessages.notAssignedLabel)}
            </Styled.InfoText>
          </Styled.InfoCard>
          <Styled.NotAssignedHelpText>
            {intl.formatMessage(intlMessages.notAssignedHelp)}
          </Styled.NotAssignedHelpText>
        </>
      );
    }
    if (userRoom) {
      const isCurrentlyInRoom = userRoom.isUserCurrentlyInRoom;
      return (
        <Styled.InfoCard>
          <Styled.RoomNumberSquare>
            {userRoom.sequence}
          </Styled.RoomNumberSquare>
          <Styled.InfoText>
            {intl.formatMessage(intlMessages.youAreInRoom, { roomName: userRoomName })}
          </Styled.InfoText>
          <Styled.EnterRoomBtn
            type="button"
            onClick={handleEnterRoom}
            data-test={isCurrentlyInRoom ? 'alreadyConnected' : 'joinRoom'}
            disabled={isCurrentlyInRoom}
            aria-label={isCurrentlyInRoom
              ? intl.formatMessage(intlMessages.alreadyConnected)
              : intl.formatMessage(intlMessages.joinRoom)}
          >
            {isCurrentlyInRoom
              ? intl.formatMessage(intlMessages.alreadyConnected)
              : intl.formatMessage(intlMessages.joinRoom)}
          </Styled.EnterRoomBtn>
        </Styled.InfoCard>
      );
    }
    return null;
  };

  return (
    <Styled.PanelContent>
      <Styled.HeaderContainer
        title={title}
        data-test="breakoutRoomParticipantHeader"
        rightButtonProps={{
          'aria-label': minimizeLabel,
          label: minimizeLabel,
          onClick: closePanel,
          icon: 'minus',
        }}
      />
      <Styled.Separator />

      <BreakoutCountdown
        breakoutDurationInSeconds={breakoutDurationInSeconds}
        breakoutStartedAt={breakoutStartedAt}
      />

      <Styled.Separator />

      {renderRoomInfo()}
      {!isInBreakout && freeJoin ? (
        <Styled.FreeJoinScrollArea>
          <Styled.FreeJoinRoomList>
            {breakouts.map((breakout) => {
              const isCurrent = breakout.breakoutRoomMeetingId === userRoom?.breakoutRoomMeetingId;
              const roomName = breakout.isDefaultName
                ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: breakout.sequence })
                : breakout.shortName;
              const isRequesting = requestedBreakoutRoomId === breakout.breakoutRoomMeetingId;
              const participantCount = breakout.participants.filter((p) => !p.isAudioOnly).length;
              return (
                <Styled.FreeJoinRoomCard key={breakout.breakoutRoomMeetingId} $isCurrent={isCurrent}>
                  <Styled.FreeJoinRoomCardHeader>
                    <Styled.FreeJoinRoomName title={roomName}>{roomName}</Styled.FreeJoinRoomName>
                    <Styled.FreeJoinRoomCount>
                      {participantCount.toString().padStart(2, '0')}
                      <Icon iconName="user_list" />
                    </Styled.FreeJoinRoomCount>
                  </Styled.FreeJoinRoomCardHeader>
                  <Styled.FreeJoinRequestBtn
                    type="button"
                    $isCurrent={isCurrent}
                    disabled={
                      isRequesting
                      || breakout.isUserCurrentlyInRoom
                    }
                    onClick={() => handleFreeJoinRoom(breakout)}
                    aria-label={(() => {
                      if (breakout.isUserCurrentlyInRoom) return intl.formatMessage(intlMessages.alreadyConnected);
                      if (isCurrent) return intl.formatMessage(intlMessages.joinRoom);
                      return intl.formatMessage(intlMessages.requestToJoin);
                    })()}
                  >
                    {(() => {
                      if (breakout.isUserCurrentlyInRoom) return intl.formatMessage(intlMessages.alreadyConnected);
                      if (isCurrent) return intl.formatMessage(intlMessages.joinRoom);
                      return intl.formatMessage(intlMessages.requestToJoin);
                    })()}
                  </Styled.FreeJoinRequestBtn>
                </Styled.FreeJoinRoomCard>
              );
            })}
          </Styled.FreeJoinRoomList>
        </Styled.FreeJoinScrollArea>
      ) : (
        <Styled.ContentArea />
      )}
      {isInBreakout && (
        <Styled.BottomBar>
          {/* @ts-ignore */}
          <Styled.CallModeratorBtn
            icon="user"
            color="primary"
            label={intl.formatMessage(intlMessages.callModerator)}
            onClick={handleCallModerator}
            data-test="callModeratorButton"
          />
          {/* @ts-ignore */}
          <Styled.ReturnBtn
            label={intl.formatMessage(intlMessages.returnToMainSession)}
            onClick={handleReturnToMainSession}
            data-test="returnToMainSessionButton"
            ghost
          />
        </Styled.BottomBar>
      )}
    </Styled.PanelContent>
  );
};

export default ParticipantBreakoutRoom;
