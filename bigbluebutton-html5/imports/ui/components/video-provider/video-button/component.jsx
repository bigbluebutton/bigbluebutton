import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import ButtonEmoji from '/imports/ui/components/button/button-emoji/ButtonEmoji';
import VideoService from '../service';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';
import { validIOSVersion } from '/imports/ui/components/app/service';
import deviceInfo from '/imports/utils/deviceInfo';
import { debounce } from 'lodash';

const ENABLE_WEBCAM_SELECTOR_BUTTON = Meteor.settings.public.app.enableWebcamSelectorButton;

const intlMessages = defineMessages({
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
  advancedVideo: {
    id: 'app.video.advancedVideo',
    description: 'Open advanced video label',
  },
  videoLocked: {
    id: 'app.video.videoLocked',
    description: 'video disabled label',
  },
  videoConnecting: {
    id: 'app.video.connecting',
    description: 'video connecting label',
  },
  meteorDisconnected: {
    id: 'app.video.clientDisconnected',
    description: 'Meteor disconnected label',
  },
  iOSWarning: {
    id: 'app.iOSWarning.label',
    description: 'message indicating to upgrade ios version',
  },
});

const JOIN_VIDEO_DELAY_MILLISECONDS = 500;

const propTypes = {
  intl: PropTypes.object.isRequired,
  hasVideoStream: PropTypes.bool.isRequired,
  mountVideoPreview: PropTypes.func.isRequired,
};

const JoinVideoButton = ({
  intl,
  hasVideoStream,
  disableReason,
  mountVideoPreview,
}) => {
  const { isMobile } = deviceInfo;
  const shouldEnableWebcamSelectorButton = ENABLE_WEBCAM_SELECTOR_BUTTON
    && hasVideoStream
    && !isMobile;
  const exitVideo = () => hasVideoStream
    && !isMobile
    && (!VideoService.isMultipleCamerasEnabled() || shouldEnableWebcamSelectorButton);

  const handleOnClick = debounce(() => {
    if (!validIOSVersion()) {
      return VideoService.notify(intl.formatMessage(intlMessages.iOSWarning));
    }

    if (exitVideo()) {
      VideoService.exitVideo();
    } else {
      mountVideoPreview();
    }
  }, JOIN_VIDEO_DELAY_MILLISECONDS);

  const handleOpenAdvancedOptions = (e) => {
    e.stopPropagation();
    mountVideoPreview();
  };

  let label = exitVideo()
    ? intl.formatMessage(intlMessages.leaveVideo)
    : intl.formatMessage(intlMessages.joinVideo);

  if (disableReason) label = intl.formatMessage(intlMessages[disableReason]);

  const renderEmojiButton = () => (
    shouldEnableWebcamSelectorButton
      && (
      <ButtonEmoji
        onClick={handleOpenAdvancedOptions}
        emoji="device_list_selector"
        hideLabel
        label={intl.formatMessage(intlMessages.advancedVideo)}
      />
      )
  );

  return (
    <div className={styles.offsetBottom}>
      <Button
        label={label}
        data-test={hasVideoStream ? 'leaveVideo' : 'joinVideo'}
        className={cx(hasVideoStream || styles.btn)}
        onClick={handleOnClick}
        hideLabel
        color={hasVideoStream ? 'primary' : 'default'}
        icon={hasVideoStream ? 'video' : 'video_off'}
        ghost={!hasVideoStream}
        size="lg"
        circle
        disabled={!!disableReason}
      />
      {renderEmojiButton()}
    </div>
  );
};

JoinVideoButton.propTypes = propTypes;

export default injectIntl(memo(JoinVideoButton));
