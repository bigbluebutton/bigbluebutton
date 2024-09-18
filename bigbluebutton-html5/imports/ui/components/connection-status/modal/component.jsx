import React, { PureComponent } from 'react';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/connection-status/icon/component';
import Service from '../service';
import Styled from './styles';
import ConnectionStatusHelper from '../status-helper/container';
import logger from '/imports/startup/client/logger';

const NETWORK_MONITORING_INTERVAL_MS = 2000;
const MIN_TIMEOUT = 3000;

const intlMessages = defineMessages({
  ariaTitle: {
    id: 'app.connection-status.ariaTitle',
    description: 'Connection status aria title',
  },
  title: {
    id: 'app.connection-status.title',
    description: 'Connection status title',
  },
  description: {
    id: 'app.connection-status.description',
    description: 'Connection status description',
  },
  empty: {
    id: 'app.connection-status.empty',
    description: 'Connection status empty',
  },
  more: {
    id: 'app.connection-status.more',
    description: 'More about conectivity issues',
  },
  audioLabel: {
    id: 'app.settings.audioTab.label',
    description: 'Audio label',
  },
  videoLabel: {
    id: 'app.settings.videoTab.label',
    description: 'Video label',
  },
  copy: {
    id: 'app.connection-status.copy',
    description: 'Copy network data',
  },
  copied: {
    id: 'app.connection-status.copied',
    description: 'Copied network data',
  },
  offline: {
    id: 'app.connection-status.offline',
    description: 'Offline user',
  },
  dataSaving: {
    id: 'app.settings.dataSavingTab.description',
    description: 'Description of data saving',
  },
  webcam: {
    id: 'app.settings.dataSavingTab.webcam',
    description: 'Webcam data saving switch',
  },
  screenshare: {
    id: 'app.settings.dataSavingTab.screenShare',
    description: 'Screenshare data saving switch',
  },
  on: {
    id: 'app.switch.onLabel',
    description: 'label for toggle switch on state',
  },
  off: {
    id: 'app.switch.offLabel',
    description: 'label for toggle switch off state',
  },
  no: {
    id: 'app.connection-status.no',
    description: 'No to is using turn',
  },
  yes: {
    id: 'app.connection-status.yes',
    description: 'Yes to is using turn',
  },
  usingTurn: {
    id: 'app.connection-status.usingTurn',
    description: 'User is using turn server',
  },
  jitter: {
    id: 'app.connection-status.jitter',
    description: 'Jitter buffer in ms',
  },
  lostPackets: {
    id: 'app.connection-status.lostPackets',
    description: 'Number of lost packets',
  },
  audioUploadRate: {
    id: 'app.connection-status.audioUploadRate',
    description: 'Label for audio current upload rate',
  },
  audioDownloadRate: {
    id: 'app.connection-status.audioDownloadRate',
    description: 'Label for audio current download rate',
  },
  videoUploadRate: {
    id: 'app.connection-status.videoUploadRate',
    description: 'Label for video current upload rate',
  },
  videoDownloadRate: {
    id: 'app.connection-status.videoDownloadRate',
    description: 'Label for video current download rate',
  },
  connectionStats: {
    id: 'app.connection-status.connectionStats',
    description: 'Label for Connection Stats tab',
  },
  myLogs: {
    id: 'app.connection-status.myLogs',
    description: 'Label for My Logs tab',
  },
  sessionLogs: {
    id: 'app.connection-status.sessionLogs',
    description: 'Label for Session Logs tab',
  },
  next: {
    id: 'app.connection-status.next',
    description: 'Label for the next page of the connection stats tab',
  },
  prev: {
    id: 'app.connection-status.prev',
    description: 'Label for the previous page of the connection stats tab',
  },
  clientNotResponding: {
    id: 'app.connection-status.clientNotRespondingWarning',
    description: 'Text for Client not responding warning',
  },
});

const propTypes = {
  setModalIsOpen: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  logMonitoringInterval: PropTypes.number,
  logMediaStats: PropTypes.bool,
};

const defaultProps = {
  logMediaStats: false,
  logMonitoringInterval: 30000,
};

const isConnectionStatusEmpty = (connectionStatus) => {
  // Check if it's defined
  if (!connectionStatus) return true;

  // Check if it's an array
  if (!Array.isArray(connectionStatus)) return true;

  // Check if is empty
  if (connectionStatus.length === 0) return true;

  return false;
};

class ConnectionStatusComponent extends PureComponent {
  constructor(props) {
    super(props);

    const { intl } = this.props;

    this.help = Service.getHelp();
    this.state = {
      selectedTab: 0,
      hasNetworkData: false,
      copyButtonText: intl.formatMessage(intlMessages.copy),
      networkData: {
        user: {

        },
        audio: {
          audioCurrentUploadRate: 0,
          audioCurrentDownloadRate: 0,
          jitter: 0,
          packetsLost: 0,
          transportStats: {},
        },
        video: {
          videoCurrentUploadRate: 0,
          videoCurrentDownloadRate: 0,
        },
      },
    };
    this.setButtonMessage = this.setButtonMessage.bind(this);
    this.rateInterval = null;
    this.audioUploadLabel = intl.formatMessage(intlMessages.audioUploadRate);
    this.audioDownloadLabel = intl.formatMessage(intlMessages.audioDownloadRate);
    this.videoUploadLabel = intl.formatMessage(intlMessages.videoUploadRate);
    this.videoDownloadLabel = intl.formatMessage(intlMessages.videoDownloadRate);
    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  async componentDidMount() {
    this.startMonitoringNetwork();
  }

  componentDidUpdate(prevProps) {
    const { isModalOpen } = this.props;

    // If the modal changed open state, we should re-start network monitoring
    // with the appropriate interval
    if (prevProps.isModalOpen !== isModalOpen) {
      this.startMonitoringNetwork();
    }
  }

  componentWillUnmount() {
    this.stopMonitoringNetwork();
  }

  handleSelectTab(tab) {
    this.setState({
      selectedTab: tab,
    });
  }

  setButtonMessage(msg) {
    this.setState({
      copyButtonText: msg,
    });
  }

  stopMonitoringNetwork() {
    clearInterval(this.rateInterval);
    this.rateInterval = null;
    clearTimeout(this.copyNetworkDataTimeout);
    this.copyNetworkDataTimeout = null;
  }

  shouldLogMediaStats() {
    const { logMediaStats, isModalOpen } = this.props;
    const { networkData } = this.state;
    const { audio, video } = networkData;

    return logMediaStats
      && !isModalOpen
      && (Object.keys(audio).length > 0 || Object.keys(video).length > 0);
  }

  /**
   * Start monitoring the network data.
   * @return {Promise} A Promise that resolves when process started.
   */
  async startMonitoringNetwork() {
    const {
      isModalOpen,
      logMonitoringInterval,
      logMediaStats,
    } = this.props;

    const monitoringInterval = !isModalOpen
      ? logMonitoringInterval
      : NETWORK_MONITORING_INTERVAL_MS;

    if (this.rateInterval) this.stopMonitoringNetwork();

    let previousData = await Service.getNetworkData();
    this.rateInterval = setInterval(async () => {
      const data = await Service.getNetworkData();

      const {
        outbound: audioCurrentUploadRate,
        inbound: audioCurrentDownloadRate,
      } = Service.calculateBitsPerSecond(data.audio, previousData.audio);

      const inboundRtp = Service.getDataType(data.audio, 'inbound-rtp')[0];

      const jitter = inboundRtp
        ? inboundRtp.jitterBufferAverage
        : 0;

      const packetsLost = inboundRtp
        ? inboundRtp.packetsLost
        : 0;

      const audio = {
        audioCurrentUploadRate,
        audioCurrentDownloadRate,
        jitter,
        packetsLost,
        transportStats: data.audio?.transportStats || {},
      };

      const {
        outbound: videoCurrentUploadRate,
        inbound: videoCurrentDownloadRate,
      } = Service.calculateBitsPerSecondFromMultipleData(data.video,
        previousData.video);

      const video = {
        videoCurrentUploadRate,
        videoCurrentDownloadRate,
        screenshareTransportStats: data.video?.screenshareStats?.transportStats || {},
      };

      const { user } = data;

      const networkData = {
        user,
        audio,
        video,
      };

      previousData = data;
      this.setState({
        networkData,
        hasNetworkData: true,
      });

      if (this.shouldLogMediaStats()) {
        logger.info({
          logCode: 'media_stats',
          extraInfo: {
            audio,
            video,
          },
        }, 'Media stats');
      }
    }, monitoringInterval);
  }

  /**
   * Copy network data to clipboard
   * @return {Promise}   A Promise that is resolved after data is copied.
   *
   *
   */
  async copyNetworkData() {
    const { intl } = this.props;
    const {
      networkData,
      hasNetworkData,
    } = this.state;

    if (!hasNetworkData) return;

    this.setButtonMessage(intl.formatMessage(intlMessages.copied));

    const data = JSON.stringify(networkData, null, 2);

    await navigator.clipboard.writeText(data);

    this.copyNetworkDataTimeout = setTimeout(() => {
      this.setButtonMessage(intl.formatMessage(intlMessages.copy));
    }, MIN_TIMEOUT);
  }

  renderEmpty() {
    const { intl } = this.props;

    return (
      <Styled.Item last data-test="connectionStatusItemEmpty">
        <Styled.Left>
          <Styled.FullName>
            <Styled.Text>
              {intl.formatMessage(intlMessages.empty)}
            </Styled.Text>
          </Styled.FullName>
        </Styled.Left>
      </Styled.Item>
    );
  }

  renderConnections() {
    const {
      connectionStatus,
      intl,
    } = this.props;

    const { selectedTab } = this.state;

    if (isConnectionStatusEmpty(connectionStatus)) return this.renderEmpty();

    let connections = connectionStatus;
    if (selectedTab === 1) {
      connections = connections.filter(conn => conn.you);
      if (isConnectionStatusEmpty(connections)) return this.renderEmpty();
    }

    return connections.map((conn, index) => {
      const dateTime = new Date(conn.timestamp);
      return (
        <Styled.Item
          key={`${conn?.name}-${conn.userId}`}
          last={(index + 1) === connections.length}
          data-test="connectionStatusItemUser"
        >
          <Styled.Left>
            <Styled.Avatar>
              <UserAvatar
                you={conn.you}
                avatar={conn.avatar}
                moderator={conn.moderator}
                color={conn.color}
              >
                {conn.name.toLowerCase().slice(0, 2)}
              </UserAvatar>
            </Styled.Avatar>

            <Styled.Name>
              <Styled.Text
                offline={conn.offline}
                data-test={conn.offline ? "offlineUser" : null}
              >
                {conn.name}
                {conn.offline ? ` (${intl.formatMessage(intlMessages.offline)})` : null}
              </Styled.Text>
            </Styled.Name>
            <Styled.Status aria-label={`${intl.formatMessage(intlMessages.title)} ${conn.status}`}>
              <Styled.Icon>
                <Icon level={conn.status} />
              </Styled.Icon>
            </Styled.Status>
            { conn.notResponding && !conn.offline
              ? (
                <Styled.ClientNotRespondingText>
                  {intl.formatMessage(intlMessages.clientNotResponding)}
                </Styled.ClientNotRespondingText>
              ) : null }
          </Styled.Left>
            <Styled.Right>
              <Styled.Time>
                { conn.timestamp ?
                  <time dateTime={dateTime}>
                    <FormattedTime value={dateTime} />
                  </time>
                  : null
                }
              </Styled.Time>
            </Styled.Right>
        </Styled.Item>
      );
    });
  }

  /**
   * Render network data , containing information abount current upload and
   * download rates
   * @return {Object} The component to be renderized.
   */
  renderNetworkData() {
    const { enableNetworkStats } = Meteor.settings.public.app;

    if (!enableNetworkStats) {
      return null;
    }

    const {
      audioUploadLabel,
      audioDownloadLabel,
      videoUploadLabel,
      videoDownloadLabel,
    } = this;

    const { intl, setModalIsOpen } = this.props;

    const { networkData } = this.state;

    const {
      audioCurrentUploadRate,
      audioCurrentDownloadRate,
      jitter,
      packetsLost,
      transportStats,
    } = networkData.audio;

    const {
      videoCurrentUploadRate,
      videoCurrentDownloadRate,
    } = networkData.video;

    let isUsingTurn = '--';

    if (transportStats) {
      switch (transportStats.isUsingTurn) {
        case true:
          isUsingTurn = intl.formatMessage(intlMessages.yes);
          break;
        case false:
          isUsingTurn = intl.formatMessage(intlMessages.no);
          break;
        default:
          break;
      }
    }

    return (
      <Styled.NetworkDataContainer
        data-test="networkDataContainer"
        tabIndex={0}
      >
        <Styled.HelperWrapper>
          <Styled.Helper>
            <ConnectionStatusHelper closeModal={() => setModalIsOpen(false)} />
          </Styled.Helper>
        </Styled.HelperWrapper>
        <Styled.NetworkDataContent>
          <Styled.DataColumn>
            <Styled.NetworkData>
              <div>{`${audioUploadLabel}`}</div>
              <div>{`${audioCurrentUploadRate}k ↑`}</div>
            </Styled.NetworkData>
            <Styled.NetworkData>
              <div>{`${videoUploadLabel}`}</div>
              <div data-test="videoUploadRateData">{`${videoCurrentUploadRate}k ↑`}</div>
            </Styled.NetworkData>
            <Styled.NetworkData>
              <div>{`${intl.formatMessage(intlMessages.jitter)}`}</div>
              <div>{`${jitter} ms`}</div>
            </Styled.NetworkData>
            <Styled.NetworkData>
              <div>{`${intl.formatMessage(intlMessages.usingTurn)}`}</div>
              <div>{`${isUsingTurn}`}</div>
            </Styled.NetworkData>
          </Styled.DataColumn>

          <Styled.DataColumn>
            <Styled.NetworkData>
              <div>{`${audioDownloadLabel}`}</div>
              <div>{`${audioCurrentDownloadRate}k ↓`}</div>
            </Styled.NetworkData>
            <Styled.NetworkData>
              <div>{`${videoDownloadLabel}`}</div>
              <div>{`${videoCurrentDownloadRate}k ↓`}</div>
            </Styled.NetworkData>
            <Styled.NetworkData>
              <div>{`${intl.formatMessage(intlMessages.lostPackets)}`}</div>
              <div>{`${packetsLost}`}</div>
            </Styled.NetworkData>
            <Styled.NetworkData invisible>
              <div>Content Hidden</div>
              <div>0</div>
            </Styled.NetworkData>
          </Styled.DataColumn>
        </Styled.NetworkDataContent>
      </Styled.NetworkDataContainer>
    );
  }

  /**
   * Renders the clipboard's copy button, for network stats.
   * @return {Object} - The component to be renderized
   */
  renderCopyDataButton() {
    const { enableCopyNetworkStatsButton } = Meteor.settings.public.app;

    if (!enableCopyNetworkStatsButton) {
      return null;
    }

    const { hasNetworkData, copyButtonText } = this.state;
    return (
      <Styled.CopyContainer aria-live="polite">
        <Styled.Copy
          disabled={!hasNetworkData}
          role="button"
	        data-test="copyStats"
          onClick={this.copyNetworkData.bind(this)}
          onKeyPress={this.copyNetworkData.bind(this)}
          tabIndex={0}
        >
          {copyButtonText}
        </Styled.Copy>
      </Styled.CopyContainer>
    );
  }

  render() {
    const {
      setModalIsOpen,
      intl,
      isModalOpen,
    } = this.props;

    const { selectedTab } = this.state;

    if (!isModalOpen) return null;

    return (
      <Styled.ConnectionStatusModal
        priority="low"
        onRequestClose={() => setModalIsOpen(false)}
        setIsOpen={setModalIsOpen}
        hideBorder
        isOpen={isModalOpen}
        contentLabel={intl.formatMessage(intlMessages.ariaTitle)}
        data-test="connectionStatusModal"
      >
        <Styled.Container>
          <Styled.Header>
            <Styled.Title>
              {intl.formatMessage(intlMessages.title)}
            </Styled.Title>
          </Styled.Header>

          <Styled.ConnectionTabs
            onSelect={this.handleSelectTab}
            selectedIndex={selectedTab}
          >
            <Styled.ConnectionTabList>
              <Styled.ConnectionTabSelector selectedClassName="is-selected">
                <span id="connection-status-tab">{intl.formatMessage(intlMessages.title)}</span>
              </Styled.ConnectionTabSelector>
              <Styled.ConnectionTabSelector selectedClassName="is-selected">
                <span id="my-logs-tab">{intl.formatMessage(intlMessages.myLogs)}</span>
              </Styled.ConnectionTabSelector>
              {Service.isModerator()
                && (
                  <Styled.ConnectionTabSelector selectedClassName="is-selected">
                    <span id="session-logs-tab">{intl.formatMessage(intlMessages.sessionLogs)}</span>
                  </Styled.ConnectionTabSelector>
                )
              }
            </Styled.ConnectionTabList>
            <Styled.ConnectionTabPanel selectedClassName="is-selected">
              <div>
                {this.renderNetworkData()}
                {this.renderCopyDataButton()}
              </div>
            </Styled.ConnectionTabPanel>
            <Styled.ConnectionTabPanel selectedClassName="is-selected">
              <ul>{this.renderConnections()}</ul>
            </Styled.ConnectionTabPanel>
            {Service.isModerator()
              && (
                <Styled.ConnectionTabPanel selectedClassName="is-selected">
                  <ul>{this.renderConnections()}</ul>
                </Styled.ConnectionTabPanel>
              )
            }
          </Styled.ConnectionTabs>
        </Styled.Container>
      </Styled.ConnectionStatusModal>
    );
  }
}

ConnectionStatusComponent.propTypes = propTypes;

export default injectIntl(ConnectionStatusComponent);
