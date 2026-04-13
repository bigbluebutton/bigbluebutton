import { useMutation } from '@apollo/client';
import React, {
  useCallback, useEffect, useMemo, useRef,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import {
  BreakoutRoom,
  getBreakoutData,
  GetBreakoutDataResponse,
  handleInviteDismissedAt,
} from './queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { BREAKOUT_ROOM_REQUEST_JOIN_URL } from '../../breakout-room/mutations';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { rejoinAudio, setBreakoutWindowRef } from '../../breakout-room/breakout-room/service';
import { useBreakoutExitObserver } from './hooks';
import { useStopMediaOnMainRoom } from '/imports/ui/components/breakout-room/hooks';
import logger from '/imports/startup/client/logger';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const intlMessages = defineMessages({
  addedToRoom: {
    id: 'app.breakoutJoinConfirmation.addedToRoom',
    description: 'Message telling user they were added to a room',
  },
  willBeRedirected: {
    id: 'app.breakoutJoinConfirmation.willBeRedirected',
    description: 'Message telling user they will be redirected',
  },
  enterRoom: {
    id: 'app.breakoutJoinConfirmation.enterRoom',
    description: 'Enter the room button label',
  },
  dismissLabel: {
    id: 'app.breakoutJoinConfirmation.dismissLabel',
    description: 'Cancel button label',
  },
  freeJoinMessage: {
    id: 'app.breakoutJoinConfirmation.freeJoinMessage',
    description: 'Join breakout confirm message',
  },
  generatingURL: {
    id: 'app.createBreakoutRoom.generatingURLMessage',
    description: 'label for generating breakout room url',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  closeModal: {
    id: 'app.modal.close',
    description: 'Close modal',
  },
});

interface BreakoutJoinConfirmationProps {
  freeJoin: boolean;
  breakouts: BreakoutRoom[];
  currentUserJoined: boolean;
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
  const [dismissedInvitationKey, setDismissedInvitationKey] = React.useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const currentInvitationKey = React.useMemo(
    () => breakouts
      .filter((br) => br.showInvitation)
      .map((br) => br.assignedAt ?? '')
      .sort()
      .join(','),
    [breakouts],
  );
  const isDismissed = dismissedInvitationKey !== null
    && dismissedInvitationKey !== ''
    && dismissedInvitationKey === currentInvitationKey;

  const uniqueMatch = (arr: BreakoutRoom[], predicate: (item: BreakoutRoom) => boolean) => {
    const matches = arr.filter(predicate);
    return matches.length === 1 ? matches[0] : null;
  };

  const defaultSelectedBreakoutId = uniqueMatch(breakouts, (br) => br.showInvitation)?.breakoutRoomMeetingId
      || uniqueMatch(breakouts, (br) => br.isLastAssignedRoom)?.breakoutRoomMeetingId
      || breakouts.find((br) => br.joinURL != null)?.breakoutRoomMeetingId
      || breakouts[0]?.breakoutRoomMeetingId;

  const [selectValue, setSelectValue] = React.useState('');

  const requestJoinURL = (breakoutRoomMeetingId: string) => {
    breakoutRoomRequestJoinURL({ variables: { breakoutRoomMeetingId } });
  };

  // request join url if free join is enabled and user is not assigned to any room
  if (defaultSelectedBreakoutId === breakouts[0].breakoutRoomMeetingId) {
    const selectedBreakout = breakouts.find(
      ({ breakoutRoomMeetingId }) => breakoutRoomMeetingId === defaultSelectedBreakoutId,
    );
    if (!selectedBreakout?.joinURL && !waiting) {
      requestJoinURL(defaultSelectedBreakoutId);
      setWaiting(true);
    }
  }

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(event.target.value);
    const selectedBreakout = breakouts.find(
      ({ breakoutRoomMeetingId }) => breakoutRoomMeetingId === event.target.value,
    );
    if (!selectedBreakout?.joinURL) {
      requestJoinURL(event.target.value);
      setWaiting(true);
    }
  };

  useEffect(() => {
    if (defaultSelectedBreakoutId) {
      setSelectValue(defaultSelectedBreakoutId);
    }
  }, [defaultSelectedBreakoutId]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setDismissedInvitationKey(currentInvitationKey);
    callHandleInviteDismissedAt();
  }, [callHandleInviteDismissedAt, currentInvitationKey]);

  const handleJoinBreakoutConfirmation = useCallback(() => {
    stopMediaOnMainRoom(presenter);

    if (breakouts.length === 1 || !freeJoin) {
      const breakout = freeJoin
        ? breakouts.find(({ breakoutRoomMeetingId }) => breakoutRoomMeetingId === selectValue)
        : breakouts.find((br) => br.showInvitation || br.isLastAssignedRoom) || breakouts[0];

      if (breakout?.joinURL) {
        const win = window.open(breakout.joinURL, '_blank');
        if (win) setBreakoutWindowRef(win);
      }
      setIsOpen(false);
      setDismissedInvitationKey(currentInvitationKey);
    } else {
      const selectedBreakout = breakouts.find(
        ({ breakoutRoomMeetingId }) => breakoutRoomMeetingId === selectValue,
      );
      if (selectedBreakout?.joinURL) {
        logger.info({
          logCode: 'breakoutroom_freejoin_selected',
          extraInfo: { selectedBreakout },
        }, 'User selected breakout room to join');
        const win2 = window.open(selectedBreakout.joinURL, '_blank');
        if (win2) setBreakoutWindowRef(win2);
      }
      setIsOpen(false);
      setDismissedInvitationKey(currentInvitationKey);
    }
  }, [breakouts, selectValue, presenter, stopMediaOnMainRoom, freeJoin]);

  const assignedBreakout = breakouts.find((br) => br.showInvitation || br.isLastAssignedRoom) || breakouts[0];
  const roomName = assignedBreakout.isDefaultName
    ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: assignedBreakout.sequence })
    : assignedBreakout.shortName;

  const select = useMemo(() => {
    return (
      <Styled.SelectParent>
        <Styled.BodyText>
          {intl.formatMessage(intlMessages.freeJoinMessage)}
        </Styled.BodyText>
        <Styled.Select
          value={selectValue}
          onChange={handleSelectChange}
          disabled={waiting}
          data-test="selectBreakoutRoomBtn"
        >
          {[...breakouts].sort((a, b) => a.sequence - b.sequence).map(({
            shortName, breakoutRoomMeetingId, isDefaultName, sequence,
          }) => (
            <option
              data-test="roomOption"
              key={breakoutRoomMeetingId}
              value={breakoutRoomMeetingId}
            >
              {isDefaultName ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: sequence }) : shortName}
            </option>
          ))}
        </Styled.Select>
        {waiting ? (
          <Styled.BodyText>{intl.formatMessage(intlMessages.generatingURL)}</Styled.BodyText>
        ) : null}
      </Styled.SelectParent>
    );
  }, [breakouts, waiting, selectValue]);

  useEffect(() => {
    if (waiting) {
      const breakout = breakouts.find(
        ({ breakoutRoomMeetingId }) => breakoutRoomMeetingId === selectValue,
      );
      if (breakout?.joinURL) {
        setWaiting(false);
      }
    }
  }, [breakouts, waiting]);

  useEffect(() => {
    if (breakouts?.length > 0 && !currentUserJoined && !isDismissed) {
      setIsOpen(true);
    }
  }, [breakouts, currentUserJoined, isDismissed]);

  useEffect(() => {
    if (freeJoin) {
      logger.info({
        logCode: 'breakoutroom_freejoin_options',
        extraInfo: { breakouts },
      }, 'User is given the option to join these breakout rooms');
    }
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <Styled.Overlay onClick={handleOverlayClick}>
      <Styled.Dialog ref={dialogRef} role="dialog" aria-modal="true" aria-label={roomName} data-test="breakoutJoinConfirmationDialog">
        <Styled.Header>
          <Styled.Title>{roomName}</Styled.Title>
          <Styled.CloseButton
            onClick={handleClose}
            aria-label={intl.formatMessage(intlMessages.closeModal)}
          >
            ✕
          </Styled.CloseButton>
        </Styled.Header>
        <Styled.Body>
          {freeJoin ? select : (
            <>
              <Styled.BodyText>
                {intl.formatMessage(intlMessages.addedToRoom, { roomName })}
              </Styled.BodyText>
              <Styled.BodyText>
                {intl.formatMessage(intlMessages.willBeRedirected)}
              </Styled.BodyText>
            </>
          )}
        </Styled.Body>
        <Styled.Footer>
          <Styled.CancelButton onClick={handleClose} data-test="modalDismissButton">
            {intl.formatMessage(intlMessages.dismissLabel)}
          </Styled.CancelButton>
          <Styled.EnterButton
            onClick={handleJoinBreakoutConfirmation}
            disabled={waiting}
            data-test="modalConfirmButton"
          >
            {intl.formatMessage(intlMessages.enterRoom)}
          </Styled.EnterButton>
        </Styled.Footer>
      </Styled.Dialog>
    </Styled.Overlay>
  );
};

const BreakoutJoinConfirmationContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((u) => {
    return {
      isModerator: u.isModerator,
      lastBreakoutRoom: u.lastBreakoutRoom,
      presenter: u.presenter,
      breakoutRoomsSummary: u.breakoutRoomsSummary,
      bot: u.bot,
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

  if (currentUser?.bot) return null;

  if (currentUser?.isModerator
      && !currentMeeting?.breakoutRoomsCommonProperties?.sendInvitationToModerators) return null;

  if (!breakoutData || (breakoutData.breakoutRoom?.length ?? 0) === 0) return null;

  return (
    <BreakoutJoinConfirmation
      freeJoin={currentMeeting?.breakoutRoomsCommonProperties?.freeJoin ?? false}
      breakouts={breakoutData.breakoutRoom}
      currentUserJoined={currentUser?.lastBreakoutRoom?.isUserCurrentlyInRoom ?? false}
      presenter={currentUser?.presenter ?? false}
    />
  );
};

export default BreakoutJoinConfirmationContainer;
