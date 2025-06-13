import { useMutation } from '@apollo/client';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  BreakoutRoom as BreakoutRoomType,
  GetBreakoutDataResponse,
  getBreakoutData,
} from './queries';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Header from '/imports/ui/components/common/control-header/component';
import Styled from './styles';
import { layoutDispatch, layoutSelect } from '../../layout/context';
import { ACTIONS, PANELS } from '../../layout/enums';
import { Layout } from '../../layout/layoutTypes';
import BreakoutDropdown from '../breakout-room-dropdown/component';
import { BREAKOUT_ROOM_END_ALL, BREAKOUT_ROOM_REQUEST_JOIN_URL, USER_TRANSFER_VOICE_TO_MEETING } from '../mutations';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import TimeRemaingPanel from './components/timeRemaining';
import BreakoutMessageForm from './components/messageForm';
import { useStopMediaOnMainRoom } from '/imports/ui/components/breakout-room/hooks';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

interface BreakoutRoomProps {
  breakouts: BreakoutRoomType[];
  isModerator: boolean;
  presenter: boolean;
  durationInSeconds: number;
  userJoinedAudio: boolean;
  userId: string;
  meetingId: string;
  createdTime: number;
}

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  breakoutAriaTitle: {
    id: 'app.createBreakoutRoom.ariaTitle',
    description: 'breakout aria title',
  },
  breakoutDuration: {
    id: 'app.createBreakoutRoom.duration',
    description: 'breakout duration time',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  breakoutJoin: {
    id: 'app.createBreakoutRoom.join',
    description: 'label for join breakout room',
  },
  breakoutJoinAudio: {
    id: 'app.createBreakoutRoom.joinAudio',
    description: 'label for option to transfer audio',
  },
  breakoutReturnAudio: {
    id: 'app.createBreakoutRoom.returnAudio',
    description: 'label for option to return audio',
  },
  askToJoin: {
    id: 'app.createBreakoutRoom.askToJoin',
    description: 'label for generate breakout room url',
  },
  generatingURL: {
    id: 'app.createBreakoutRoom.generatingURL',
    description: 'label for generating breakout room url',
  },
  endAllBreakouts: {
    id: 'app.createBreakoutRoom.endAllBreakouts',
    description: 'Button label to end all breakout rooms',
  },
  chatTitleMsgAllRooms: {
    id: 'app.createBreakoutRoom.chatTitleMsgAllRooms',
    description: 'chat title for send message to all rooms',
  },
  alreadyConnected: {
    id: 'app.createBreakoutRoom.alreadyConnected',
    description: 'label for the user that is already connected to breakout room',
  },
  setTimeInMinutes: {
    id: 'app.createBreakoutRoom.setTimeInMinutes',
    description: 'Label for input to set time (minutes)',
  },
  setTimeLabel: {
    id: 'app.createBreakoutRoom.setTimeLabel',
    description: 'Button label to set breakout rooms time',
  },
  setTimeCancel: {
    id: 'app.createBreakoutRoom.setTimeCancel',
    description: 'Button label to cancel set breakout rooms time',
  },
  setTimeHigherThanMeetingTimeError: {
    id: 'app.createBreakoutRoom.setTimeHigherThanMeetingTimeError',
    description: 'Label for error when new breakout rooms time would be higher than remaining time in parent meeting',
  },
});

const BreakoutRoom: React.FC<BreakoutRoomProps> = ({
  breakouts,
  isModerator,
  durationInSeconds,
  presenter,
  userJoinedAudio,
  userId,
  meetingId,
  createdTime,
}) => {
  const [breakoutRoomEndAll] = useMutation(BREAKOUT_ROOM_END_ALL);
  const [breakoutRoomTransfer] = useMutation(USER_TRANSFER_VOICE_TO_MEETING);
  const [breakoutRoomRequestJoinURL] = useMutation(BREAKOUT_ROOM_REQUEST_JOIN_URL);
  const stopMediaOnMainRoom = useStopMediaOnMainRoom();

  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const intl = useIntl();

  const panelRef = React.useRef<HTMLDivElement>(null);
  const [showChangeTimeForm, setShowChangeTimeForm] = React.useState(false);
  const [requestedBreakoutRoomId, setRequestedBreakoutRoomId] = React.useState<string>('');

  const transferUserToMeeting = (fromMeeting: string, toMeeting: string) => {
    breakoutRoomTransfer(
      {
        variables: {
          fromMeetingId: fromMeeting,
          toMeetingId: toMeeting,
        },
      },
    );
  };

  const requestJoinURL = (breakoutRoomId: string) => {
    breakoutRoomRequestJoinURL({ variables: { breakoutRoomId } });
  };

  const closePanel = useCallback(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }, []);

  useEffect(() => {
    if (requestedBreakoutRoomId) {
      const breakout = breakouts.find((b) => b.breakoutRoomId === requestedBreakoutRoomId);
      if (breakout && breakout.joinURL) {
        window.open(breakout.joinURL, '_blank');
        setRequestedBreakoutRoomId('');
        stopMediaOnMainRoom(presenter);
      }
    }
  }, [breakouts, stopMediaOnMainRoom, presenter]);

  return (
    <Styled.Panel
      ref={panelRef}
      onCopy={(e) => {
        e.preventDefault();
      }}
    >
      <Header
        leftButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.breakoutAriaTitle),
          label: intl.formatMessage(intlMessages.breakoutTitle),
          onClick: closePanel,
        }}
        data-test="breakoutRoomManagerHeader"
        rightButtonProps={{}}
        customRightButton={isModerator && (
          <BreakoutDropdown
            openBreakoutTimeManager={() => setShowChangeTimeForm(true)}
            endAllBreakouts={() => {
              closePanel();
              breakoutRoomEndAll();
            }}
            isMeteorConnected
            amIModerator={isModerator}
            isRTL={isRTL}
          />
        )}
      />
      <TimeRemaingPanel
        showChangeTimeForm={showChangeTimeForm}
        isModerator={isModerator}
        durationInSeconds={durationInSeconds}
        createdTime={createdTime}
        toggleShowChangeTimeForm={setShowChangeTimeForm}
      />
      {isModerator ? <BreakoutMessageForm /> : null}
      {isModerator ? <Styled.Separator /> : null}
      <Styled.BreakoutsList>
        {
          breakouts.map((breakout) => {
            const breakoutLabel = breakout.joinURL
              ? intl.formatMessage(intlMessages.breakoutJoin)
              : intl.formatMessage(intlMessages.askToJoin);
            const dataTest = `${breakout.joinURL ? 'join' : 'askToJoin'}${breakout.shortName.replace(' ', '')}`;
            const userJoinedDialin = breakout.participants.find((p) => p.userId === userId)?.isAudioOnly ?? false;
            return (
              <Styled.BreakoutItems key={`breakoutRoomItems-${breakout.breakoutRoomId}`}>
                <Styled.Content key={`breakoutRoomList-${breakout.breakoutRoomId}`}>
                  <Styled.BreakoutRoomListNameLabel data-test={breakout.shortName} aria-hidden>
                    {breakout.isDefaultName
                      ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: breakout.sequence })
                      : breakout.shortName}
                    <Styled.UsersAssignedNumberLabel>
                      (
                      {breakout.participants.length}
                      )
                    </Styled.UsersAssignedNumberLabel>
                  </Styled.BreakoutRoomListNameLabel>
                  {requestedBreakoutRoomId === breakout.breakoutRoomId ? (
                    <span>
                      {intl.formatMessage(intlMessages.generatingURL)}
                      <Styled.ConnectingAnimation animations />
                    </span>
                  ) : (
                    <Styled.BreakoutActions>
                      {
                        breakout.isUserCurrentlyInRoom
                          ? (
                            <Styled.AlreadyConnected data-test="alreadyConnected">
                              {intl.formatMessage(intlMessages.alreadyConnected)}
                            </Styled.AlreadyConnected>
                          )
                          : (
                            <Styled.JoinButton
                              label={breakoutLabel}
                              data-test={dataTest}
                              aria-label={`${breakoutLabel} ${breakout.shortName}`}
                              onClick={() => {
                                if (!breakout.joinURL) {
                                  setRequestedBreakoutRoomId(breakout.breakoutRoomId);
                                  requestJoinURL(breakout.breakoutRoomId);
                                } else {
                                  window.open(breakout.joinURL, '_blank');
                                  stopMediaOnMainRoom(presenter);
                                }
                              }}
                              disabled={requestedBreakoutRoomId}
                            />
                          )
                      }
                      {
                      isModerator && (userJoinedAudio || userJoinedDialin)
                        ? [
                          ('|'),
                          (
                            <Styled.AudioButton
                              label={
                                userJoinedDialin
                                  ? intl.formatMessage(intlMessages.breakoutReturnAudio)
                                  : intl.formatMessage(intlMessages.breakoutJoinAudio)
                              }
                              disabled={false}
                              key={`join-audio-${breakout.breakoutRoomId}`}
                              onClick={
                                userJoinedDialin ? () => transferUserToMeeting(breakout.breakoutRoomId, meetingId)
                                  : () => transferUserToMeeting(meetingId, breakout.breakoutRoomId)
                              }
                            />
                          ),
                        ]
                        : null
                    }
                    </Styled.BreakoutActions>
                  )}
                </Styled.Content>
                <Styled.JoinedUserNames
                  data-test={`userNameBreakoutRoom-${breakout.shortName}`}
                >
                  {breakout.participants
                    .filter((p) => !p.isAudioOnly)
                    .sort((a, b) => a.user.nameSortable.localeCompare(b.user.nameSortable))
                    .map((u) => u.user.name)
                    .join(', ')}
                </Styled.JoinedUserNames>
              </Styled.BreakoutItems>
            );
          })
        }
      </Styled.BreakoutsList>
    </Styled.Panel>
  );
};

const BreakoutRoomContainer: React.FC = () => {
  const {
    data: meetingData,
  } = useMeeting((m) => ({
    durationInSeconds: m.durationInSeconds,
    createdTime: m.createdTime,
    meetingId: m.meetingId,
  }));

  const {
    data: currentUserData,
    loading: currentUserLoading,
  } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
    presenter: u.presenter,
    voice: u.voice,
    userId: u.userId,
  }));

  const {
    data: breakoutData,
    loading: breakoutLoading,
    error: breakoutError,
  } = useDeduplicatedSubscription<GetBreakoutDataResponse>(getBreakoutData);
  if (
    breakoutLoading
    || currentUserLoading
  ) return null;

  if (breakoutError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: breakoutError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }
  if (!currentUserData || !breakoutData || !meetingData) return null; // or loading spinner or error

  return (
    <BreakoutRoom
      breakouts={breakoutData.breakoutRoom || []}
      isModerator={currentUserData.isModerator ?? false}
      presenter={currentUserData.presenter ?? false}
      durationInSeconds={meetingData.durationInSeconds ?? 0}
      userJoinedAudio={(currentUserData?.voice?.joined && !currentUserData?.voice?.deafened) ?? false}
      userId={currentUserData.userId ?? ''}
      meetingId={meetingData.meetingId ?? ''}
      createdTime={meetingData.createdTime ?? 0}
    />
  );
};
export default BreakoutRoomContainer;
