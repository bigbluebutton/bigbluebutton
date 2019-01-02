import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  videoMenu: {
    id: 'app.video.videoMenu',
    description: 'video menu label',
  },
  videoMenuDesc: {
    id: 'app.video.videoMenuDesc',
    description: 'video menu description',
  },
  videoMenuDisabled: {
    id: 'app.video.videoMenuDisabled',
    description: 'video menu label',
  },
});


const propTypes = {
  intl: intlShape.isRequired,
  isSharingVideo: PropTypes.bool.isRequired,
  videoItems: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const JoinVideoOptions = ({
  intl,
  isSharingVideo,
  videoShareAllowed,
  handleJoinVideo,
  handleCloseVideo,
}) => {

  return (
    <Button
      label={!videoShareAllowed ?
        intl.formatMessage(intlMessages.videoMenuDisabled)
        :
        intl.formatMessage(intlMessages.videoMenu)
      }
      className={cx(styles.button, isSharingVideo || styles.ghostButton)}
      onClick={isSharingVideo ? handleCloseVideo : handleJoinVideo}
      hideLabel
      aria-label={intl.formatMessage(intlMessages.videoMenuDesc)}
      color={isSharingVideo ? 'primary' : 'default'}
      icon={isSharingVideo ? 'video' : 'video_off'}
      ghost={!isSharingVideo}
      size="lg"
      circle
      disabled={!videoShareAllowed}
    />
  );
};
JoinVideoOptions.propTypes = propTypes;
export default injectIntl(JoinVideoOptions);
