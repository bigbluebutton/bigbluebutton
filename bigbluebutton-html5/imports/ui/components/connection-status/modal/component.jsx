import React, { PureComponent } from 'react';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import SlowConnection from '/imports/ui/components/slow-connection/component';
import Modal from '/imports/ui/components/modal/simple/component';
import { styles } from './styles';

const STATS = Meteor.settings.public.stats;

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
  offline: {
    id: 'app.connection-status.offline',
    description: 'Offline user',
  },
});

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class ConnectionStatusComponent extends PureComponent {
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

    if (connectionStatus.length === 0) return this.renderEmpty();

    return connectionStatus.map((conn, index) => {
      const dateTime = new Date(conn.timestamp);
      const itemStyle = {};
      itemStyle[styles.even] = index % 2 === 0;

      const textStyle = {};
      textStyle[styles.offline] = conn.offline;

      return (
        <div
          key={index}
          className={cx(styles.item, itemStyle)}
        >
          <div className={styles.left}>
            <div className={styles.avatar}>
              <UserAvatar
                className={styles.icon}
                you={conn.you}
                moderator={conn.moderator}
                color={conn.color}
              >
                {conn.name.toLowerCase().slice(0, 2)}
              </UserAvatar>
            </div>

            <div className={styles.name}>
              <div className={cx(styles.text, textStyle)}>
                {conn.name}
                {conn.offline ? ` (${intl.formatMessage(intlMessages.offline)})` : null}
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

  render() {
    const {
      closeModal,
      intl,
    } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
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
            <a href={STATS.help} target="_blank" rel="noopener noreferrer">
              {`(${intl.formatMessage(intlMessages.more)})`}
            </a>
          </div>
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
