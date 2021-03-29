import React, { PureComponent } from 'react';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import SlowConnection from '/imports/ui/components/slow-connection/component';
import Switch from '/imports/ui/components/switch/component';
import Service from '../service';
import Modal from '/imports/ui/components/modal/simple/component';
import { styles } from './styles';

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

    this.help = Service.getHelp();
    this.state = { dataSaving: props.dataSaving };
  }

  handleDataSavingChange(key) {
    const { dataSaving } = this.state;
    dataSaving[key] = !dataSaving[key];
    this.setState(dataSaving);
  }

  renderEmpty() {
    const { intl } = this.props;

    return (
      <div className={styles.item}>
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

      return (
        <div
          key={index}
          className={cx(styles.item, itemStyle)}
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
              <div className={styles.text}>
                {conn.name}
              </div>
            </div>
            <div className={styles.status}>
              <SlowConnection effectiveConnectionType={conn.level} />
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
        <div className={styles.saving}>
          <label className={styles.label}>
            {intl.formatMessage(intlMessages.webcam)}
          </label>
          <Switch
            icons={false}
            defaultChecked={viewParticipantsWebcams}
            onChange={() => this.handleDataSavingChange('viewParticipantsWebcams')}
            ariaLabelledBy="webcam"
            ariaLabel={intl.formatMessage(intlMessages.webcam)}
          />
        </div>
        <div className={styles.saving}>
          <label className={styles.label}>
            {intl.formatMessage(intlMessages.screenshare)}
          </label>
          <Switch
            icons={false}
            defaultChecked={viewScreenshare}
            onChange={() => this.handleDataSavingChange('viewScreenshare')}
            ariaLabelledBy="screenshare"
            ariaLabel={intl.formatMessage(intlMessages.screenshare)}
          />
        </div>
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
            {intl.formatMessage(intlMessages.description)}{' '}
            {this.help
              && (
                <a href={this.help} target="_blank" rel="noopener noreferrer">
                  {`(${intl.formatMessage(intlMessages.more)})`}
                </a>
              )
            }
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
