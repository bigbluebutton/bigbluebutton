import { useMutation } from '@apollo/client';
import React, { useCallback, useEffect, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import ModalFullscreen from '/imports/ui/components/common/modal/fullscreen/component';
import {
  BreakoutRoom,
  getBreakoutData,
  GetBreakoutDataResponse,
  handleInviteDismissedAt,
} from './queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { BREAKOUT_ROOM_REQUEST_JOIN_URL } from '../../breakout-room/mutations';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { rejoinAudio } from '../../breakout-room/breakout-room/service';
import { useBreakoutExitObserver } from './hooks';
import { useStopMediaOnMainRoom } from '/imports/ui/components/breakout-room/hooks';
import logger from '/imports/startup/client/logger';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

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
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
});

interface BreakoutJoinConfirmationProps {
  freeJoin: boolean;
  breakouts: BreakoutRoom[];
  currentUserJoined: boolean,
  presenter: boolean;
}

const BreakoutJoinConfirmation: React.FC<BreakoutJoinConfirmationProps> = ({
  freeJoin,
  breakouts,
  currentUserJoined,
  presenter,
}) => {
  const [breakoutRoomRequestJoinURL] = useMutation(BREAKOUT_ROOM_REQUEST_JOIN_URL);
  const [callHandleInviteDismissedAt] = useMutation(handleInviteDismissedAt);
  const stopMediaOnMainRoom = useStopMediaOnMainRoom();
  const intl = useIntl();
  const [waiting, setWaiting] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const uniqueMatch = (arr: BreakoutRoom[], predicate: (item: BreakoutRoom) => boolean) => {
    const matches = arr.filter(predicate);
    return matches.length === 1 ? matches[0] : null;
  };

  const defaultSelectedBreakoutId = uniqueMatch(breakouts, (br) => br.showInvitation)?.breakoutRoomId
      || uniqueMatch(breakouts, (br) => br.isLastAssignedRoom)?.breakoutRoomId
      || breakouts.find((br) => br.joinURL != null)?.breakoutRoomId
      || breakouts[0]?.breakoutRoomId;

  const [selectValue, setSelectValue] = React.useState('');

  const requestJoinURL = (breakoutRoomId: string) => {
    breakoutRoomRequestJoinURL({ variables: { breakoutRoomId } });
  };

  // request join url if free join is enabled and user is not assigned to any room
  if (defaultSelectedBreakoutId === breakouts[0].breakoutRoomId) {
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

  useEffect(() => {
    // If User is Moved to a new room, the select value is updated
    if (defaultSelectedBreakoutId) {
      setSelectValue(defaultSelectedBreakoutId);
    }
  }, [defaultSelectedBreakoutId]);

  const handleJoinBreakoutConfirmation = useCallback(() => {
    stopMediaOnMainRoom(presenter);

    if (breakouts.length === 1) {
      const breakout = breakouts[0];

      if (breakout?.joinURL) {
        window.open(breakout.joinURL, '_blank');
      }
      setIsOpen(false);
    } else {
      const selectedBreakout = breakouts.find(({ breakoutRoomId }) => breakoutRoomId === selectValue);
      if (selectedBreakout?.joinURL) {
        // log which breakout room the user is joining
        logger.info({
          logCode: 'breakoutroom_freejoin_selected',
          extraInfo: { selectedBreakout },
        }, 'User selected breakout room to join');

        window.open(selectedBreakout.joinURL, '_blank');
      }
    }
  }, [breakouts, selectValue, presenter, stopMediaOnMainRoom]);

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
            breakouts.sort((a, b) => a.sequence - b.sequence).map(({
              shortName, breakoutRoomId, isDefaultName, sequence,
            }) => (
              <option
                data-test="roomOption"
                key={breakoutRoomId}
                value={breakoutRoomId}
              >
                {isDefaultName ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: sequence }) : shortName}
              </option>
            ))
          }
        </Styled.Select>
        { waiting ? <span data-test="labelGeneratingURL">{intl.formatMessage(intlMessages.generatingURL)}</span> : null}
      </Styled.SelectParent>
    );
  }, [breakouts, waiting, selectValue]);

  const roomName = breakouts[0].isDefaultName
    ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: breakouts[0].sequence })
    : breakouts[0].shortName;

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

  useEffect(() => {
    // log which breakout rooms the user has the option to join
    if (freeJoin) {
      logger.info({
        logCode: 'breakoutroom_freejoin_options',
        extraInfo: { breakouts },
      }, 'User is given the option to join these breakout rooms');
    }
  }, []);

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
      {freeJoin ? select : `${intl.formatMessage(intlMessages.message)} ${roomName}?`}
    </ModalFullscreen>
  );
};

const BreakoutJoinConfirmationContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((u) => {
    return {
      isModerator: u.isModerator,
      lastBreakoutRoom: u.lastBreakoutRoom,
      presenter: u.presenter,
      breakoutRoomsSummary: u.breakoutRoomsSummary,
    };
  });

  const hasInvitationToShow = (currentUser?.breakoutRoomsSummary?.totalOfShowInvitation ?? 0) > 0;

  const { data: currentMeeting } = useMeeting((m) => ({
    breakoutRoomsCommonProperties: m.breakoutRoomsCommonProperties,
  }));

  const breakoutExitObserver = useBreakoutExitObserver();
  useEffect(() => {
    breakoutExitObserver.setCallback('rejoinAudio', rejoinAudio);
    return () => {
      breakoutExitObserver.removeCallback('rejoinAudio');
    };
  }, []);

  const {
    data: breakoutData,
  } = useDeduplicatedSubscription<GetBreakoutDataResponse>(getBreakoutData, { skip: !hasInvitationToShow });

  if (!hasInvitationToShow) return null;

  if (currentUser?.isModerator
      && !currentMeeting?.breakoutRoomsCommonProperties?.sendInvitationToModerators) return null;

  if (!breakoutData || breakoutData.breakoutRoom.length === 0) return null;

  return (
    <BreakoutJoinConfirmation
      freeJoin={currentMeeting?.breakoutRoomsCommonProperties?.freeJoin ?? false}
      breakouts={breakoutData.breakoutRoom}
      currentUserJoined={currentUser?.lastBreakoutRoom?.currentlyInRoom ?? false}
      presenter={currentUser?.presenter ?? false}
    />
  );
};

export default BreakoutJoinConfirmationContainer;
