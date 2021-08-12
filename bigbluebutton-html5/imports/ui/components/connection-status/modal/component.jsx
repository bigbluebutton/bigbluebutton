import React, { PureComponent } from 'react';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/connection-status/icon/component';
import Switch from '/imports/ui/components/switch/component';
import Service from '../service';
import Modal from '/imports/ui/components/modal/simple/component';
import { styles } from './styles';

const NETWORK_MONITORING_INTERVAL_MS = 2000;

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
    clearInterval(this.rateInterval);
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
    this.rateInterval = setInterval(async () => {
      const data = await Service.getNetworkData();

      const {
        outbound: audioCurrentUploadRate,
        inbound: audioCurrentDownloadRate,
      } = Service.calculateBitsPerSecond(data, previousData);

      const audio = {
        audioCurrentUploadRate,
        audioCurrentDownloadRate,
        transport: data.transportStats,
      };

      // SAMPLE DATA
      const video = {
        videoCurrentUploadRate: Math.floor(Math.random() * 100),
        videoCurrentDownloadRate: Math.floor(Math.random() * 100),
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
      <div
        className={styles.item}
        data-test="connectionStatusItemEmpty"
      >
        <div className={styles.left}>
          <div className={styles.name}>
            <div className={styles.text}>
              {intl.formatMessage(intlMessages.empty)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  displaySettingsStatus(status) {
    const { intl } = this.props;

    return (
      <span className={styles.toggleLabel}>
        {status ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </span>
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
    }, 1000);
  }

  renderConnections() {
    const {
      connectionStatus,
      intl,
    } = this.props;

    if (isConnectionStatusEmpty(connectionStatus)) return this.renderEmpty();

    return connectionStatus.map((conn, index) => {
      const dateTime = new Date(conn.timestamp);
      const itemStyle = {};
      itemStyle[styles.even] = (index + 1) % 2 === 0;

      const textStyle = {};
      textStyle[styles.offline] = conn.offline;
      return (
        <div
          key={index}
          className={cx(styles.item, itemStyle)}
          data-test="connectionStatusItemUser"
        >
          <div className={styles.left}>
            <div className={styles.avatar}>
              <UserAvatar
                className={cx({ [styles.initials]: conn.avatar.length === 0 })}
                you={conn.you}
                avatar={conn.avatar}
                moderator={conn.moderator}
                color={conn.color}
              >
                {conn.name.toLowerCase().slice(0, 2)}
              </UserAvatar>
            </div>

            <div className={styles.name}>
              <div
                className={cx(styles.text, textStyle)}
                data-test={conn.offline ? "offlineUser" : null}
              >
                {conn.name}
                {conn.offline ? ` (${intl.formatMessage(intlMessages.offline)})` : null}
              </div>
            </div>
            <div className={styles.status}>
              <div className={styles.icon}>
                <Icon level={conn.level} />
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.time}>
              <time dateTime={dateTime}>
                <FormattedTime value={dateTime} />
              </time>
            </div>
          </div>
        </div>
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
      <div className={styles.dataSaving}>
        <div className={styles.description}>
          {intl.formatMessage(intlMessages.dataSaving)}
        </div>

        <div className={styles.row}>
          <div className={styles.col} aria-hidden="true">
            <div className={styles.formElement}>
              <span className={styles.label}>
                {intl.formatMessage(intlMessages.webcam)}
              </span>
            </div>
          </div>
          <div className={styles.col}>
            <div className={cx(styles.formElement, styles.pullContentRight)}>
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
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.col} aria-hidden="true">
            <div className={styles.formElement}>
              <span className={styles.label}>
                {intl.formatMessage(intlMessages.screenshare)}
              </span>
            </div>
          </div>
          <div className={styles.col}>
            <div className={cx(styles.formElement, styles.pullContentRight)}>
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render network data , containing information abount current upload and
   * download rates
   * @return {Object} The component to be renderized.
   */
  renderNetworkData() {
    const {
      audioLabel,
      videoLabel,
    } = this;

    const { networkData } = this.state;

    const {
      audioCurrentUploadRate,
      audioCurrentDownloadRate,
    } = networkData.audio;

    const {
      videoCurrentUploadRate,
      videoCurrentDownloadRate,
    } = networkData.video;

    return (
      <div
        className={styles.networkData}
      >
        <p>
          {`↑${audioLabel}: ${audioCurrentUploadRate} kbps |`}
        </p>
        <p>
          {`↓${audioLabel}: ${audioCurrentDownloadRate} kbps |`}
        </p>
        <p>
          {`↑${videoLabel}: ${videoCurrentUploadRate} kbps |`}
        </p>
        <p>
          {`↓${videoLabel}: ${videoCurrentDownloadRate} kbps`}
        </p>
      </div>
    );
  }

  /**
   * Renders the clipboard's copy button, for network stats.
   * @return {Object} - The component to be renderized
   */
  renderCopyDataButton() {
    const { intl } = this.props;

    const { hasNetworkData } = this.state;
    return (
      <div>
        <span
          className={cx(styles.copy, !hasNetworkData ? styles.disabled : '')}
          role="button"
          onClick={this.copyNetworkData.bind(this)}
          onKeyPress={this.copyNetworkData.bind(this)}
          tabIndex={0}
        >
          <p>{intl.formatMessage(intlMessages.copy)}</p>
        </span>
      </div>
    );
  }

  render() {
    const {
      closeModal,
      intl,
    } = this.props;

    const { dataSaving } = this.state;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={() => closeModal(dataSaving, intl)}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.ariaTitle)}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {intl.formatMessage(intlMessages.title)}
            </h2>
          </div>
          <div className={styles.description}>
            {intl.formatMessage(intlMessages.description)}
            {' '}
            {this.help
              && (
                <a href={this.help} target="_blank" rel="noopener noreferrer">
                  {`(${intl.formatMessage(intlMessages.more)})`}
                </a>
              )
            }
          </div>
          <div className={styles.networkDataContainer}>
            {this.renderNetworkData()}
            {this.renderCopyDataButton()}
          </div>
          {this.renderDataSaving()}
          <div className={styles.content}>
            <div className={styles.wrapper}>
              {this.renderConnections()}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

ConnectionStatusComponent.propTypes = propTypes;

export default injectIntl(ConnectionStatusComponent);
