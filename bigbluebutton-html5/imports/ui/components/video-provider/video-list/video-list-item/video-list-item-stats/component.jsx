import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import { styles } from '../../styles';

const propTypes = {
  toggleStats: PropTypes.func.isRequired,
  getStats: PropTypes.func.isRequired,
  stats: PropTypes.object.isRequired,
  stopGettingStats: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  titleLabel: {
    id: 'app.video.stats.title',
  },
  packetsReceivedLabel: {
    id: 'app.video.stats.packetsReceived',
  },
  packetsSentLabel: {
    id: 'app.video.stats.packetsSent',
  },
  packetsLostLabel: {
    id: 'app.video.stats.packetsLost',
  },
  bitrateLabel: {
    id: 'app.video.stats.bitrate',
  },
  lostPercentageLabel: {
    id: 'app.video.stats.lostPercentage',
  },
  lostRecentPercentageLabel: {
    id: 'app.video.stats.lostRecentPercentage',
  },
  dimensionsLabel: {
    id: 'app.video.stats.dimensions',
  },
  codecLabel: {
    id: 'app.video.stats.codec',
  },
  decodeDelayLabel: {
    id: 'app.video.stats.decodeDelay',
  },
  rttLabel: {
    id: 'app.video.stats.rtt',
  },
  encodeUsagePercentLabel: {
    id: 'app.video.stats.encodeUsagePercent',
  },
  currentDelayLabel: {
    id: 'app.video.stats.currentDelay',
  },
});

class VideoListItemStats extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount(){
    const { getStats } = this.props;
    getStats();
  }
 
  componentWillUnmount() {
    const { stopGettingStats } = this.props;
    stopGettingStats();
  }

  render() {
    const { intl, toggleStats, stats } = this.props;

    return (
      <div className={styles.webRTCStats}>
        <div>
          <b>{ intl.formatMessage(intlMessages.titleLabel) }</b>
          <Icon className={styles.statsCloseButton} 
            iconName="close" 
            onClick={() => {toggleStats(); }}
          />
        </div>
        <br />
        { stats.video.packetsReceived ?
          ( <span>{ intl.formatMessage(intlMessages.packetsReceivedLabel) }: {stats.video.packetsReceived}</span> ) : (null) }
        { stats.video.packetsSent ?
          ( <span>{ intl.formatMessage(intlMessages.packetsSentLabel) }: {stats.video.packetsSent}</span> ) : (null) }
        <div>{ intl.formatMessage(intlMessages.packetsLostLabel) }: {stats.video.packetsLost}</div>
        <div>{ intl.formatMessage(intlMessages.lostPercentageLabel) }: {stats.video.lostPercentage}%</div>
        <div>{ intl.formatMessage(intlMessages.lostRecentPercentageLabel) }: {stats.video.lostRecentPercentage}%</div>
        <div>{ intl.formatMessage(intlMessages.bitrateLabel) }: {stats.video.bitrate} kbits/sec</div>
        { stats.video.width ?
          ( <div>{ intl.formatMessage(intlMessages.dimensionsLabel) }: {stats.video.width}x{stats.video.height}</div> ) : (null) }
        { stats.video.decodeDelay ?
          ( <div>{ intl.formatMessage(intlMessages.decodeDelayLabel) }: {stats.video.decodeDelay}ms</div>) : (null) }
        { stats.video.codec ?
          ( <div>{ intl.formatMessage(intlMessages.codecLabel) }: {stats.video.codec}</div> ) : (null) }
        { stats.video.rtt ?
          ( <div>{ intl.formatMessage(intlMessages.rttLabel) }: {stats.video.rtt}ms</div> ) : (null) }
        { stats.video.encodeUsagePercent ?
          ( <div>{ intl.formatMessage(intlMessages.encodeUsagePercentLabel) }: {stats.video.encodeUsagePercent}%</div> ) : (null) }
        { stats.video.currentDelay ?
          ( <div>{ intl.formatMessage(intlMessages.currentDelayLabel) }: {stats.video.currentDelay}ms</div> ) : (null) }
      </div>
    );
  }
}

VideoListItemStats.propTypes = propTypes;

export default injectIntl(VideoListItemStats);
