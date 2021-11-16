import React, { PureComponent } from 'react';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/connection-status/icon/component';
import Switch from '/imports/ui/components/switch/component';
import Service from '../service';
import Styled from './styles';

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
});

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
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
      dataSaving: props.dataSaving,
      hasNetworkData: false,
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
    this.displaySettingsStatus = this.displaySettingsStatus.bind(this);
    this.rateInterval = null;

    this.audioLabel = (intl.formatMessage(intlMessages.audioLabel)).charAt(0);
    this.videoLabel = (intl.formatMessage(intlMessages.videoLabel)).charAt(0);
  }

  async componentDidMount() {
    this.startMonitoringNetwork();
  }

  componentWillUnmount() {
    Meteor.clearInterval(this.rateInterval);
  }

  handleDataSavingChange(key) {
    const { dataSaving } = this.state;
    dataSaving[key] = !dataSaving[key];
    this.setState(dataSaving);
  }

  /**
   * Start monitoring the network data.
   * @return {Promise} A Promise that resolves when process started.
   */
  async startMonitoringNetwork() {
    let previousData = await Service.getNetworkData();
    this.rateInterval = Meteor.setInterval(async () => {
      const data = await Service.getNetworkData();

      const {
        outbound: audioCurrentUploadRate,
        inbound: audioCurrentDownloadRate,
      } = Service.calculateBitsPerSecond(data.audio, previousData.audio);

      const jitter = data.audio['inbound-rtp']
        ? data.audio['inbound-rtp'].jitterBufferAverage
        : 0;

      const packetsLost = data.audio['inbound-rtp']
        ? data.audio['inbound-rtp'].packetsLost
        : 0;

      const audio = {
        audioCurrentUploadRate,
        audioCurrentDownloadRate,
        jitter,
        packetsLost,
        transportStats: data.audio.transportStats,
      };

      const {
        outbound: videoCurrentUploadRate,
        inbound: videoCurrentDownloadRate,
      } = Service.calculateBitsPerSecondFromMultipleData(data.video,
        previousData.video);

      const video = {
        videoCurrentUploadRate,
        videoCurrentDownloadRate,
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
    }, NETWORK_MONITORING_INTERVAL_MS);
  }

  renderEmpty() {
    const { intl } = this.props;

    return (
      <Styled.Item data-test="connectionStatusItemEmpty">
        <Styled.Left>
          <Styled.Name>
            <Styled.Text>
              {intl.formatMessage(intlMessages.empty)}
            </Styled.Text>
          </Styled.Name>
        </Styled.Left>
      </Styled.Item>
    );
  }

  displaySettingsStatus(status) {
    const { intl } = this.props;

    return (
      <Styled.ToggleLabel>
        {status ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </Styled.ToggleLabel>
    );
  }

  /**
   * Copy network data to clipboard
   * @param  {Object}  e              Event object from click event
   * @return {Promise}   A Promise that is resolved after data is copied.
   *
   *
   */
  async copyNetworkData(e) {
    const { intl } = this.props;
    const {
      networkData,
      hasNetworkData,
    } = this.state;

    if (!hasNetworkData) return;

    const { target: copyButton } = e;

    copyButton.innerHTML = intl.formatMessage(intlMessages.copied);

    const data = JSON.stringify(networkData, null, 2);

    await navigator.clipboard.writeText(data);

    this.copyNetworkDataTimeout = setTimeout(() => {
      copyButton.innerHTML = intl.formatMessage(intlMessages.copy);
    }, MIN_TIMEOUT);
  }

  renderConnections() {
    const {
      connectionStatus,
      intl,
    } = this.props;

    if (isConnectionStatusEmpty(connectionStatus)) return this.renderEmpty();

    return connectionStatus.map((conn, index) => {
      const dateTime = new Date(conn.timestamp);

      return (
        <Styled.Item
          key={index}
          even={(index + 1) % 2 === 0}
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
            <Styled.Status aria-label={`${intl.formatMessage(intlMessages.title)} ${conn.level}`}>
              <Styled.Icon>
                <Icon level={conn.level} />
              </Styled.Icon>
            </Styled.Status>
          </Styled.Left>
          <Styled.Right>
            <Styled.Time>
              <time dateTime={dateTime}>
                <FormattedTime value={dateTime} />
              </time>
            </Styled.Time>
          </Styled.Right>
        </Styled.Item>
      );
    });
  }

  renderDataSaving() {
    const {
      intl,
      dataSaving,
    } = this.props;

    const {
      viewParticipantsWebcams,
      viewScreenshare,
    } = dataSaving;

    return (
      <Styled.DataSaving>
        <Styled.Description>
          {intl.formatMessage(intlMessages.dataSaving)}
        </Styled.Description>

        <Styled.Row>
          <Styled.Col aria-hidden="true">
            <Styled.FormElement>
              <Styled.Label>
                {intl.formatMessage(intlMessages.webcam)}
              </Styled.Label>
            </Styled.FormElement>
          </Styled.Col>
          <Styled.Col>
            <Styled.FormElementRight>
              {this.displaySettingsStatus(viewParticipantsWebcams)}
              <Switch
                icons={false}
                defaultChecked={viewParticipantsWebcams}
                onChange={() => this.handleDataSavingChange('viewParticipantsWebcams')}
                ariaLabelledBy="webcam"
                ariaLabel={intl.formatMessage(intlMessages.webcam)}
                data-test="dataSavingWebcams"
                showToggleLabel={false}
              />
            </Styled.FormElementRight>
          </Styled.Col>
        </Styled.Row>

        <Styled.Row>
          <Styled.Col aria-hidden="true">
            <Styled.FormElement>
              <Styled.Label>
                {intl.formatMessage(intlMessages.screenshare)}
              </Styled.Label>
            </Styled.FormElement>
          </Styled.Col>
          <Styled.Col>
            <Styled.FormElementRight>
              {this.displaySettingsStatus(viewScreenshare)}
              <Switch
                icons={false}
                defaultChecked={viewScreenshare}
                onChange={() => this.handleDataSavingChange('viewScreenshare')}
                ariaLabelledBy="screenshare"
                ariaLabel={intl.formatMessage(intlMessages.screenshare)}
                data-test="dataSavingScreenshare"
                showToggleLabel={false}
              />
            </Styled.FormElementRight>
          </Styled.Col>
        </Styled.Row>
      </Styled.DataSaving>
    );
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
      audioLabel,
      videoLabel,
    } = this;

    const { intl } = this.props;

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
      <Styled.NetworkDataContainer>
        <Styled.NetworkData>
          {`↑${audioLabel}: ${audioCurrentUploadRate} k`}
        </Styled.NetworkData>
        <Styled.NetworkData>
          {`↓${audioLabel}: ${audioCurrentDownloadRate} k`}
        </Styled.NetworkData>
        <Styled.NetworkData>
          {`↑${videoLabel}: ${videoCurrentUploadRate} k`}
        </Styled.NetworkData>
        <Styled.NetworkData>
          {`↓${videoLabel}: ${videoCurrentDownloadRate} k`}
        </Styled.NetworkData>
        <Styled.NetworkData>
          {`${intl.formatMessage(intlMessages.jitter)}: ${jitter} ms`}
        </Styled.NetworkData>
        <Styled.NetworkData>
          {`${intl.formatMessage(intlMessages.lostPackets)}: ${packetsLost}`}
        </Styled.NetworkData>
        <Styled.NetworkData>
          {`${intl.formatMessage(intlMessages.usingTurn)}: ${isUsingTurn}`}
        </Styled.NetworkData>
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

    const { intl } = this.props;

    const { hasNetworkData } = this.state;
    return (
      <Styled.CopyContainer aria-live="polite">
        <Styled.Copy
          disabled={!hasNetworkData}
          role="button"
          onClick={this.copyNetworkData.bind(this)}
          onKeyPress={this.copyNetworkData.bind(this)}
          tabIndex={0}
        >
          {intl.formatMessage(intlMessages.copy)}
        </Styled.Copy>
      </Styled.CopyContainer>
    );
  }

  render() {
    const {
      closeModal,
      intl,
    } = this.props;

    const { dataSaving } = this.state;

    return (
      <Styled.ConnectionStatusModal
        onRequestClose={() => closeModal(dataSaving, intl)}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.ariaTitle)}
      >
        <Styled.Container>
          <Styled.Header>
            <Styled.Title>
              {intl.formatMessage(intlMessages.title)}
            </Styled.Title>
          </Styled.Header>
          <Styled.Description>
            {intl.formatMessage(intlMessages.description)}
            {' '}
            {this.help
              && (
                <a href={this.help} target="_blank" rel="noopener noreferrer">
                  {`(${intl.formatMessage(intlMessages.more)})`}
                </a>
              )
            }
          </Styled.Description>
          {this.renderNetworkData()}
          {this.renderCopyDataButton()}
          {this.renderDataSaving()}
          <Styled.Content>
            <Styled.Wrapper>
              {this.renderConnections()}
            </Styled.Wrapper>
          </Styled.Content>
        </Styled.Container>
      </Styled.ConnectionStatusModal>
    );
  }
}

ConnectionStatusComponent.propTypes = propTypes;

export default injectIntl(ConnectionStatusComponent);
