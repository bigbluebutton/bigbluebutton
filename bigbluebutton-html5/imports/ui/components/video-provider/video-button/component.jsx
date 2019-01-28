import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
  videoButtonDesc: {
    id: 'app.video.videoButtonDesc',
    description: 'video button description',
  },
  videoDisabled: {
    id: 'app.video.videoDisabled',
    description: 'video disabled label',
  },
});


const propTypes = {
  intl: intlShape.isRequired,
  isSharingVideo: PropTypes.bool.isRequired,
};

const JoinVideoButton = ({
  intl,
  isSharingVideo,
  isDisabled,
  handleJoinVideo,
  handleCloseVideo,
}) => {

  return (
    <Button
      label={isDisabled ?
        intl.formatMessage(intlMessages.videoDisabled)
        :
        (isSharingVideo ?
          intl.formatMessage(intlMessages.leaveVideo)
          :
          intl.formatMessage(intlMessages.joinVideo)
        )
      }
      className={cx(styles.button, isSharingVideo || styles.ghostButton)}
      onClick={isSharingVideo ? handleCloseVideo : handleJoinVideo}
      hideLabel
      aria-label={intl.formatMessage(intlMessages.videoButtonDesc)}
      color={isSharingVideo ? 'primary' : 'default'}
      icon={isSharingVideo ? 'video' : 'video_off'}
      ghost={!isSharingVideo}
      size="lg"
      circle
      disabled={isDisabled}
    />
  );
};
JoinVideoButton.propTypes = propTypes;
export default injectIntl(JoinVideoButton);
