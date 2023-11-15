import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import { toggleVideoPin } from './service';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const intlMessages = defineMessages({
  unpinLabel: {
    id: 'app.videoDock.webcamUnpinLabel',
  },
  unpinLabelDisabled: {
    id: 'app.videoDock.webcamUnpinLabelDisabled',
  },
});

interface PinAreaContainerProps {
  pinned: boolean;
  userId: string;
  isModerator: boolean;
  isPinEnabled: boolean;
}

interface pinAreaProps extends PinAreaContainerProps {
  isBreakout: boolean;
}

const PinArea: React.FC<pinAreaProps> = ({
  pinned,
  userId,
  isModerator,
  isPinEnabled,
  isBreakout,
}) => {
  const intl = useIntl();
  const shouldRenderPinButton = pinned && userId;
  const videoPinActionAvailable = isModerator
      && isPinEnabled
      && !isBreakout;

  if (!shouldRenderPinButton) return <Styled.PinButtonWrapper />;

  return (
    <Styled.PinButtonWrapper>
      <Styled.PinButton
        color="default"
        icon={!pinned ? 'pin-video_on' : 'pin-video_off'}
        size="sm"
        onClick={() => toggleVideoPin(userId, true)}
        label={videoPinActionAvailable
          ? intl.formatMessage(intlMessages.unpinLabel)
          : intl.formatMessage(intlMessages.unpinLabelDisabled)}
        hideLabel
        disabled={!videoPinActionAvailable}
        data-test="pinVideoButton"
      />
    </Styled.PinButtonWrapper>
  );
};

const PinAreaContainer: React.FC<PinAreaContainerProps> = ({
  pinned,
  userId,
  isModerator,
  isPinEnabled,
}) => {
  const {
    data: meeting,
  } = useMeeting((m) => ({
    isBreakout: m.isBreakout,
  }));

  return (
    <PinArea
      pinned={pinned}
      userId={userId}
      isModerator={isModerator}
      isPinEnabled={isPinEnabled}
      isBreakout={meeting?.isBreakout ?? false}
    />
  );
};

export default PinAreaContainer;
