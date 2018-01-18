import React from 'react';
import PropTypes from 'prop-types';
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
});

class JoinVideoOptions extends React.Component {
  render() {
    const {
      intl,
      isWaitingResponse,
      isConnected,
      isSharingVideo,
      handleJoinVideo,
      handleCloseVideo,
      isLocked,
    } = this.props;

    if (isSharingVideo) {
      return (
        <Button
          onClick={handleCloseVideo}
          label={intl.formatMessage(intlMessages.leaveVideo)}
          hideLabel
          aria-label={intl.formatMessage(intlMessages.leaveVideo)}
          color="danger"
          icon="video"
          size="lg"
          circle
          disabled={isLocked || isWaitingResponse}
        />
      );
    }

    return (
      <span className={styles.container}>
        <Button
          className={styles.button}
          onClick={handleCloseVideo}
          label={intl.formatMessage(intlMessages.leaveVideo)}
          hideLabel
          aria-label={intl.formatMessage(intlMessages.leaveVideo)}
          color="danger"
          icon="video"
          size="lg"
          circle
          disabled={isWaitingResponse}
        />
      </span>
    );
  }

  return (
    <span className={styles.container}>
      <Button
        className={styles.button}
        onClick={handleJoinVideo}
        label={intl.formatMessage(intlMessages.joinVideo)}
        hideLabel
        aria-label={intl.formatMessage(intlMessages.joinVideo)}
        color="primary"
        icon="video_off"
        size="lg"
        circle
        disabled={isLocked || isWaitingResponse || (!isSharingVideo && isConnected)}
      />
    );
  }
}

export default injectIntl(JoinVideoOptions);
