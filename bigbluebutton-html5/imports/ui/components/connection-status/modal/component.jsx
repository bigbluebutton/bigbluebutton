import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
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
});

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class ConnectionStatusComponent extends PureComponent {
  render() {
    const {
      closeModal,
      connectionStatus,
      intl,
    } = this.props;

    console.log(connectionStatus)

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
            {intl.formatMessage(intlMessages.description)}
          </div>

          <div className={styles.content}>
            <Button
              color="primary"
              className={styles.button}
              label={intl.formatMessage(intlMessages.title)}
              onClick={() => {
                closeModal();
              }}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

ConnectionStatusComponent.propTypes = propTypes;

export default injectIntl(ConnectionStatusComponent);
