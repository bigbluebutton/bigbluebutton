import { useMutation } from '@apollo/client';
import React, { useEffect, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import ModalFullscreen from '/imports/ui/components/common/modal/fullscreen/component';
import {
  BreakoutRoom,
  getBreakoutCount,
  GetBreakoutCountResponse,
  getBreakoutData,
  GetBreakoutDataResponse,
  handleInviteDismissedAt,
} from './queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { BREAKOUT_ROOM_REQUEST_JOIN_URL } from '../../breakout-room/mutations';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import AudioManager from '/imports/ui/services/audio-manager';
import AudioService from '/imports/ui/components/audio/service';
import VideoService from '/imports/ui/components/video-provider/service';
import { useExitVideo, useStreams } from '/imports/ui/components/video-provider/hooks';
import logger from '/imports/startup/client/logger';
import { rejoinAudio } from '../../breakout-room/breakout-room/service';
import { useBreakoutExitObserver } from './hooks';

const intlMessages = defineMessages({
  title: {
    id: 'app.breakoutJoinConfirmation.title',
    description: 'Join breakout room title',
  },
  message: {
    id: 'app.breakoutJoinConfirmation.message',
    description: 'Join breakout confirm message',
  },
  freeJoinMessage: {
    id: 'app.breakoutJoinConfirmation.freeJoinMessage',
    description: 'Join breakout confirm message',
  },
  confirmLabel: {
    id: 'app.createBreakoutRoom.join',
    description: 'Join confirmation button label',
  },
  confirmDesc: {
    id: 'app.breakoutJoinConfirmation.confirmDesc',
    description: 'adds context to confirm option',
  },
  dismissLabel: {
    id: 'app.breakoutJoinConfirmation.dismissLabel',
    description: 'Cancel button label',
  },
  dismissDesc: {
    id: 'app.breakoutJoinConfirmation.dismissDesc',
    description: 'adds context to dismiss option',
  },
  generatingURL: {
    id: 'app.createBreakoutRoom.generatingURLMessage',
    description: 'label for generating breakout room url',
  },
});

interface BreakoutJoinConfirmationProps {
  freeJoin: boolean;
  breakouts: BreakoutRoom[];
  currentUserJoined: boolean,
  firstBreakoutId: string;
  isUsingAudio: () => boolean;
  exitVideo: () => Promise<boolean>;
  exitAudio: () => Promise<unknown>;
  storeVideoDevices: () => void;
}

const BreakoutJoinConfirmation: React.FC<BreakoutJoinConfirmationProps> = ({
  freeJoin,
  breakouts,
  currentUserJoined,
  firstBreakoutId,
  isUsingAudio,
  exitAudio,
  exitVideo,
  storeVideoDevices,
}) => {
  const [breakoutRoomRequestJoinURL] = useMutation(BREAKOUT_ROOM_REQUEST_JOIN_URL);
  const [callHandleInviteDismissedAt] = useMutation(handleInviteDismissedAt);

  const intl = useIntl();
  const [waiting, setWaiting] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const defaultSelectedBreakoutId = breakouts.find(({ isLastAssignedRoom }) => isLastAssignedRoom)?.breakoutRoomId
    || firstBreakoutId;

  const [selectValue, setSelectValue] = React.useState(defaultSelectedBreakoutId);

  const requestJoinURL = (breakoutRoomId: string) => {
    breakoutRoomRequestJoinURL({ variables: { breakoutRoomId } });
  };

  // request join url if free join is enabled and user is not assigned to any room
  if (defaultSelectedBreakoutId === firstBreakoutId) {
    const selectedBreakout = breakouts.find(({ breakoutRoomId }) => breakoutRoomId === defaultSelectedBreakoutId);
    if (!selectedBreakout?.joinURL && !waiting) {
      requestJoinURL(defaultSelectedBreakoutId);
      setWaiting(true);
    }
  }

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(event.target.value);
    const selectedBreakout = breakouts.find(({ breakoutRoomId }) => breakoutRoomId === event.target.value);
    if (!selectedBreakout?.joinURL) {
      requestJoinURL(event.target.value);
      setWaiting(true);
    }
  };

  const handleJoinBreakoutConfirmation = () => {
    if (isUsingAudio()) {
      exitAudio();
      logger.info(
        { logCode: 'breakout_join_confirmation' },
        'Joining breakout room closed audio in the main room',
      );
    }
    storeVideoDevices();
    exitVideo();
    if (breakouts.length === 1) {
      const breakout = breakouts[0];

      if (breakout?.joinURL) {
        window.open(breakout.joinURL, '_blank');
      }
      setIsOpen(false);
    } else {
      const selectedBreakout = breakouts.find(({ breakoutRoomId }) => breakoutRoomId === selectValue);
      if (selectedBreakout?.joinURL) {
        window.open(selectedBreakout.joinURL, '_blank');
      }
    }
  };

  const select = useMemo(() => {
    return (
      <Styled.SelectParent>
        {`${intl.formatMessage(intlMessages.freeJoinMessage)}`}
        <Styled.Select
          value={selectValue}
          onChange={handleSelectChange}
          disabled={waiting}
          data-test="selectBreakoutRoomBtn"
        >
          {
            breakouts.sort((a, b) => a.sequence - b.sequence).map(({ shortName, breakoutRoomId }) => (
              <option
                data-test="roomOption"
                key={breakoutRoomId}
                value={breakoutRoomId}
              >
                {shortName}
              </option>
            ))
          }
        </Styled.Select>
        { waiting ? <span data-test="labelGeneratingURL">{intl.formatMessage(intlMessages.generatingURL)}</span> : null}
      </Styled.SelectParent>
    );
  }, [breakouts, waiting, selectValue]);

  useEffect(() => {
    if (waiting) {
      const breakout = breakouts.find(({ breakoutRoomId }) => breakoutRoomId === selectValue);
      if (breakout?.joinURL) {
        setWaiting(false);
      }
    }
  }, [breakouts, waiting]);

  useEffect(() => {
    if (breakouts?.length > 0 && !currentUserJoined) {
      setIsOpen(true);
    }
  }, [breakouts, currentUserJoined]);

  return (
    <ModalFullscreen
      title={intl.formatMessage(intlMessages.title)}
      confirm={{
        callback: handleJoinBreakoutConfirmation,
        label: intl.formatMessage(intlMessages.confirmLabel),
        description: intl.formatMessage(intlMessages.confirmDesc),
        icon: 'popout_window',
        disabled: waiting,
      }}
      dismiss={{
        callback: () => {
          setIsOpen(false);
          callHandleInviteDismissedAt();
        },
        label: intl.formatMessage(intlMessages.dismissLabel),
        description: intl.formatMessage(intlMessages.dismissDesc),
      }}
      {...{
        setIsOpen,
        isOpen,
        priority: 'medium',
      }}
    >
      {freeJoin ? select : `${intl.formatMessage(intlMessages.message)} ${breakouts[0].shortName}?`}
    </ModalFullscreen>
  );
};

const BreakoutJoinConfirmationContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((u) => {
    return {
      isModerator: u.isModerator,
      breakoutRooms: u.breakoutRooms,
    };
  });
  const {
    data: breakoutData,
  } = useDeduplicatedSubscription<GetBreakoutDataResponse>(getBreakoutData);
  const exitVideo = useExitVideo(true);
  const videoStreams = useStreams();
  const storeVideoDevices = () => {
    VideoService.storeDeviceIds(videoStreams);
  };
  const { exitAudio } = AudioService;
  const { isUsingAudio } = AudioManager;
  const breakoutExitObserver = useBreakoutExitObserver();
  useEffect(() => {
    breakoutExitObserver.setCallback('rejoinAudio', rejoinAudio);
    return () => {
      breakoutExitObserver.removeCallback('rejoinAudio');
    };
  }, []);
  const {
    data: breakoutCountData,
  } = useDeduplicatedSubscription<GetBreakoutCountResponse>(getBreakoutCount);
  if (!breakoutCountData || !breakoutCountData.breakoutRoom_aggregate.aggregate.count) return null;
  if (!breakoutData || breakoutData.breakoutRoom.length === 0) return null;
  const firstBreakout = breakoutData.breakoutRoom[0];
  const {
    freeJoin,
    sendInvitationToModerators,
    breakoutRoomId,
  } = firstBreakout;
  if (!sendInvitationToModerators && currentUser?.isModerator) return null;
  return (
    <BreakoutJoinConfirmation
      freeJoin={freeJoin}
      breakouts={breakoutData.breakoutRoom}
      currentUserJoined={currentUser?.breakoutRooms?.isUserCurrentlyInRoom ?? false}
      firstBreakoutId={breakoutRoomId}
      isUsingAudio={isUsingAudio}
      exitVideo={exitVideo}
      exitAudio={exitAudio}
      storeVideoDevices={storeVideoDevices}
    />
  );
};

export default BreakoutJoinConfirmationContainer;
