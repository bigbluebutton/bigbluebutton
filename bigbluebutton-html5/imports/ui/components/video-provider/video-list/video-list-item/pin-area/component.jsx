import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import VideoService from '/imports/ui/components/video-provider/service';
import Styled from './styles';

const intlMessages = defineMessages({
  unpinLabel: {
    id: 'app.videoDock.webcamUnpinLabel',
  },
  unpinLabelDisabled: {
    id: 'app.videoDock.webcamUnpinLabelDisabled',
  },
});

const PinArea = (props) => {
  const intl = useIntl();

  const { user } = props;
  const pinned = user?.pin;
  const userId = user?.userId;
  const shouldRenderPinButton = pinned && userId;
  const videoPinActionAvailable = VideoService.isVideoPinEnabledForCurrentUser();

  if (!shouldRenderPinButton) return <Styled.PinButtonWrapper />;

  return (
    <Styled.PinButtonWrapper>
      <Styled.PinButton
        color="default"
        icon={!pinned ? 'pin-video_on' : 'pin-video_off'}
        size="sm"
        onClick={() => VideoService.toggleVideoPin(userId, true)}
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

export default PinArea;
