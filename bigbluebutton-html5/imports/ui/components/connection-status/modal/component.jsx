import React, { PureComponent } from 'react';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import CommonIcon from '/imports/ui/components/common/icon/component';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import Icon from '/imports/ui/components/connection-status/icon/component';
import { getHelp } from '../service';
import Styled from './styles';
import ConnectionStatusHelper from '../status-helper/component';
import Auth from '/imports/ui/services/auth';
import connectionStatus from '../../../core/graphql/singletons/connectionStatus';
import logger from '/imports/startup/client/logger';

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
    description: 'More about connectivity issues',
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
  noEvent: {
    id: 'app.connection-status.connectionStatusNoEvent',
    description: 'Text for inform on status without event ot time of occurrence',
  },
});

const propTypes = {
  setModalIsOpen: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  startMonitoringNetwork: PropTypes.func.isRequired,
  stopMonitoringNetwork: PropTypes.func.isRequired,
  networkData: PropTypes.shape({
    ready: PropTypes.bool,
    audio: PropTypes.shape({
      audioCurrentUploadRate: PropTypes.number,
      audioCurrentDownloadRate: PropTypes.number,
      jitter: PropTypes.number,
      packetsLost: PropTypes.number,
      transportStats: PropTypes.shape({
        isUsingTurn: PropTypes.bool,
      }),
    }),
    video: PropTypes.shape({
      videoCurrentUploadRate: PropTypes.number,
      videoCurrentDownloadRate: PropTypes.number,
    }),
  }),
};

const isConnectionStatusEmpty = (connectionStatusParam) => {
  // Check if it's defined
  if (!connectionStatusParam) return true;

  // Check if it's an array
  if (!Array.isArray(connectionStatusParam)) return true;

  // Check if is empty
  if (connectionStatusParam.length === 0) return true;

  return false;
};

class ConnectionStatusComponent extends PureComponent {
  constructor(props) {
    super(props);

    const { intl } = this.props;

    this.help = getHelp();
    this.state = {
      selectedTab: 0,
      copyButtonText: intl.formatMessage(intlMessages.copy),
    };
    this.setButtonMessage = this.setButtonMessage.bind(this);
    this.audioUploadLabel = intl.formatMessage(intlMessages.audioUploadRate);
    this.audioDownloadLabel = intl.formatMessage(intlMessages.audioDownloadRate);
    this.videoUploadLabel = intl.formatMessage(intlMessages.videoUploadRate);
    this.videoDownloadLabel = intl.formatMessage(intlMessages.videoDownloadRate);
    this.handleSelectTab = this.handleSelectTab.bind(this);
  }

  async componentDidMount() {
    const { startMonitoringNetwork } = this.props;

    try {
      await startMonitoringNetwork();
    } catch (error) {
      logger.warn({
        logCode: 'stats_monitor_network_error',
        extraInfo: {
          errorMessage: error?.message,
          errorStack: error?.stack,
        },
      }, 'Failed to start monitoring network');
    }
  }

  componentWillUnmount() {
    const { stopMonitoringNetwork } = this.props;

    clearTimeout(this.copyNetworkDataTimeout);
    stopMonitoringNetwork();
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

  /**
   * Copy network data to clipboard
   * @return {Promise}   A Promise that is resolved after data is copied.
   *
   *
   */
  async copyNetworkData() {
    const { intl, networkData } = this.props;

    if (!networkData?.ready) return;

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
      connectionData,
      intl,
    } = this.props;

    const { selectedTab } = this.state;

    if (isConnectionStatusEmpty(connectionData) && selectedTab !== 1) return this.renderEmpty();

    let connections = connectionData;
    if (selectedTab === 1) {
      connections = connections.filter((curr) => curr.user.userId === Auth.userID);
      if (isConnectionStatusEmpty(connections)) {
        connections = connectionStatus.getUserNetworkHistory();
      }
      if (isConnectionStatusEmpty(connections)) return this.renderEmpty();
    }

    return connections.map((conn, index) => {
      const dateTime = new Date(conn.lastUnstableStatusAt);
      return (
        <Styled.Item
          key={`${conn.user.name}-${conn.user.userId}`}
          last={(index + 1) === connections.length}
          data-test="connectionStatusItemUser"
        >
          <Styled.Left>
            <Styled.Avatar>
              <UserAvatar
                you={conn.user.userId === Auth.userID}
                avatar={conn.user.avatar}
                moderator={conn.user.isModerator}
                color={conn.user.color}
              >
                {conn.user.name.toLowerCase().slice(0, 2)}
              </UserAvatar>
            </Styled.Avatar>

            <Styled.Name>
              <Styled.Text
                offline={!conn.user.currentlyInMeeting}
                data-test={!conn.user.currentlyInMeeting ? 'offlineUser' : null}
              >
                {conn.user.name}
                {!conn.user.currentlyInMeeting ? ` (${intl.formatMessage(intlMessages.offline)})` : null}
              </Styled.Text>
            </Styled.Name>
            {
              !conn.clientNotResponding ? (
                <Styled.Status
                  aria-label={`${intl.formatMessage(intlMessages.title)} ${conn.lastUnstableStatus}`}
                >
                  <Styled.Icon>
                    <Icon level={conn.lastUnstableStatus} />
                  </Styled.Icon>
                </Styled.Status>
              ) : null
            }
            {conn.clientNotResponding && conn.user.currentlyInMeeting
              ? (
                <Styled.ClientNotRespondingText>
                  {intl.formatMessage(intlMessages.clientNotResponding)}
                </Styled.ClientNotRespondingText>
              ) : null}
          </Styled.Left>
          <Styled.Right>
            <Styled.Time>
              {
                conn.lastUnstableStatusAt
                  ? (
                    <time dateTime={dateTime}>
                      <FormattedTime value={dateTime} />
                    </time>
                  )
                  : (
                    <TooltipContainer
                      placement="top"
                      title={intl.formatMessage(intlMessages.noEvent)}
                    >
                      <CommonIcon iconName="close" rotate={false} />
                    </TooltipContainer>
                  )
              }
            </Styled.Time>
          </Styled.Right>
        </Styled.Item>
      );
    });
  }

  /**
   * Render network data , containing information about current upload and
   * download rates
   * @return {Object} The component to be renderized.
   */
  renderNetworkData() {
    const { enableNetworkStats } = window.meetingClientSettings.public.app;

    if (!enableNetworkStats) {
      return null;
    }

    const {
      audioUploadLabel,
      audioDownloadLabel,
      videoUploadLabel,
      videoDownloadLabel,
    } = this;

    const { intl, setModalIsOpen, connectionData } = this.props;

    const { networkData } = this.props;

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
            <ConnectionStatusHelper
              connectionData={connectionData}
              closeModal={() => setModalIsOpen(false)}
            />
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
    const { networkData } = this.props;
    const { enableCopyNetworkStatsButton } = window.meetingClientSettings.public.app;

    if (!enableCopyNetworkStatsButton) {
      return null;
    }

    const { copyButtonText } = this.state;
    return (
      <Styled.CopyContainer aria-live="polite">
        <Styled.Copy
          disabled={!networkData?.ready}
          role="button"
          data-test="copyStats"
          // eslint-disable-next-line react/jsx-no-bind
          onClick={this.copyNetworkData.bind(this)}
          // eslint-disable-next-line react/jsx-no-bind
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
      amIModerator,
    } = this.props;

    const { selectedTab } = this.state;

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
              {amIModerator
                && (
                  <Styled.ConnectionTabSelector selectedClassName="is-selected">
                    <span id="session-logs-tab">{intl.formatMessage(intlMessages.sessionLogs)}</span>
                  </Styled.ConnectionTabSelector>
                )}
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
            {amIModerator
              && (
                <Styled.ConnectionTabPanel selectedClassName="is-selected">
                  <ul>{this.renderConnections()}</ul>
                </Styled.ConnectionTabPanel>
              )}
          </Styled.ConnectionTabs>
        </Styled.Container>
      </Styled.ConnectionStatusModal>
    );
  }
}

ConnectionStatusComponent.propTypes = propTypes;

export default injectIntl(ConnectionStatusComponent);
