import React, { useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { toast, type Id as ToastId } from 'react-toastify';
import logger from '/imports/startup/client/logger';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { notify } from '/imports/ui/services/notification';
import { USER_TRANSFER_VOICE_TO_MEETING } from '/imports/ui/components/breakout-room/mutations';
import {
  getBreakoutData,
  GetBreakoutDataResponse,
} from '/imports/ui/components/breakout-room/breakout-room/queries';
import BreakoutTransferToastContent from './component';
import type { LiveKitRoomRow } from '/imports/ui/components/livekit/memberships-manager/hooks';

interface BreakoutTransferNotificationContainerProps {
  membership: LiveKitRoomRow;
}

const intlMessages = defineMessages({
  unknownRoom: {
    id: 'app.createBreakoutRoom.listen.unknownRoom',
    description: 'Fallback when the breakout room name cannot be resolved',
    defaultMessage: 'Unknown room',
  },
  title: {
    id: 'app.createBreakoutRoom.listen.title',
    description: 'Listen-in toast title',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'Default breakout room name',
  },
});

// Persistent indicator while the moderator is listening to a breakout.
const BreakoutTransferNotificationContainer: React.FC<BreakoutTransferNotificationContainerProps> = ({
  membership,
}) => {
  const intl = useIntl();
  const { data: meeting } = useMeeting((m) => ({ meetingId: m.meetingId }));
  const { data: breakoutData } = useDeduplicatedSubscription<GetBreakoutDataResponse>(getBreakoutData);
  const [transferVoiceToMeeting] = useMutation(USER_TRANSFER_VOICE_TO_MEETING);

  const breakoutId = membership.roomName;
  const parentMeetingId = meeting?.meetingId ?? '';

  const breakoutRoom = (breakoutData?.breakoutRoom ?? []).find(
    (b) => b.breakoutRoomMeetingId === breakoutId,
  );
  let breakoutName = intl.formatMessage(intlMessages.unknownRoom);

  if (breakoutRoom) {
    breakoutName = breakoutRoom.isDefaultName
      ? intl.formatMessage(intlMessages.breakoutRoom, { roomNumber: breakoutRoom.sequence })
      : breakoutRoom.shortName;
  }

  const handleReturnToParent = useCallback(() => {
    if (!parentMeetingId) return;

    transferVoiceToMeeting({
      variables: {
        fromMeetingId: breakoutId,
        toMeetingId: parentMeetingId,
      },
    }).catch((error) => {
      logger.error({
        logCode: 'breakout_transfer_return_failed',
        extraInfo: {
          breakoutId,
          errorMessage: (error as Error)?.message,
          errorStack: (error as Error)?.stack,
        },
      }, `Return-to-parent mutation failed: ${(error as Error)?.message}`);
    });
  }, [breakoutId, parentMeetingId, transferVoiceToMeeting]);

  const handleReturnRef = useRef(handleReturnToParent);

  useEffect(() => {
    handleReturnRef.current = handleReturnToParent;
  }, [handleReturnToParent]);

  const toastIdRef = useRef<ToastId | null>(null);

  useEffect(() => {
    return () => {
      if (toastIdRef.current != null) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const message = intl.formatMessage(intlMessages.title, { roomName: breakoutName });
    const content = (
      <BreakoutTransferToastContent
        onReturnToParent={() => handleReturnRef.current()}
        roomName={breakoutName}
      />
    );
    toastIdRef.current = notify(
      message,
      'info',
      'unmute',
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        toastId: `breakout-listen:${breakoutId}`,
      },
      content,
      undefined,
      true,
    );
  }, [breakoutId, breakoutName, intl]);

  return null;
};

export default BreakoutTransferNotificationContainer;
