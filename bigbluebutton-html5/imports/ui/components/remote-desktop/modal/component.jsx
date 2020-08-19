import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';

import { defineMessages, injectIntl } from 'react-intl';
import { isUrlValid } from '../service';

import { styles } from './styles';

const propTypes = {
  remoteDesktopUrl: PropTypes.string,
  startWatching: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const intlMessages = defineMessages({
  start: {
    id: 'app.remoteDesktop.start',
    description: 'Share remote desktop',
  },
  urlError: {
    id: 'app.remoteDesktop.urlError',
    description: 'Not a remote desktop URL error',
  },
  input: {
    id: 'app.remoteDesktop.input',
    description: 'Remote desktop URL',
  },
  urlInput: {
    id: 'app.remoteDesktop.urlInput',
    description: 'URL input field placeholder',
  },
  title: {
    id: 'app.remoteDesktop.title',
    description: 'Modal title',
  },
  close: {
    id: 'app.remoteDesktop.close',
    description: 'Close',
  },
  note: {
    id: 'app.remoteDesktop.noteLabel',
    description: 'provides hint about shared remote desktops',
  },
});

class RemoteDesktopModal extends Component {
  constructor(props) {
    super(props);

    const { remoteDesktopUrl } = props;

    this.state = {
      url: remoteDesktopUrl,
      sharing: remoteDesktopUrl,
    };

    this.startWatchingHandler = this.startWatchingHandler.bind(this);
    this.updateRemoteDesktopUrlHandler = this.updateRemoteDesktopUrlHandler.bind(this);
    this.renderUrlError = this.renderUrlError.bind(this);
    this.updateRemoteDesktopUrlHandler = this.updateRemoteDesktopUrlHandler.bind(this);
  }

  startWatchingHandler() {
    const {
      startWatching,
      closeModal,
    } = this.props;

    const { url } = this.state;

    startWatching(url.trim());
    closeModal();
  }

  updateRemoteDesktopUrlHandler(ev) {
    this.setState({ url: ev.target.value });
  }

  renderUrlError() {
    const { intl } = this.props;
    const { url } = this.state;

    const valid = (!url || url.length <= 3) || isUrlValid(url);

    return (
      !valid
        ? (
          <div className={styles.urlError}>
            {intl.formatMessage(intlMessages.urlError)}
          </div>
        )
        : null
    );
  }

  render() {
    const { intl, closeModal } = this.props;
    const { url, sharing } = this.state;

    const startDisabled = !isUrlValid(url);

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        contentLabel={intl.formatMessage(intlMessages.title)}
        hideBorder
      >
        <header data-test="remoteDesktopModalHeader" className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.title)}</h3>
        </header>

        <div className={styles.content}>
          <div className={styles.remoteDesktopUrl}>
            <label htmlFor="remote-desktop-modal-input" id="remote-desktop-modal-input">
              {intl.formatMessage(intlMessages.input)}
              <input
                id="remote-desktop-modal-input"
                onChange={this.updateRemoteDesktopUrlHandler}
                name="remote-desktop-modal-input"
                placeholder={intl.formatMessage(intlMessages.urlInput)}
                disabled={sharing}
                aria-describedby="remote-desktop-note"
              />
            </label>
            <div className={styles.remoteDesktopNote} id="remote-desktop-note">
              {intl.formatMessage(intlMessages.note)}
            </div>
          </div>

          <div>
            {this.renderUrlError()}
          </div>

          <Button
            className={styles.startBtn}
            label={intl.formatMessage(intlMessages.start)}
            onClick={this.startWatchingHandler}
            disabled={startDisabled}
          />
        </div>
      </Modal>
    );
  }
}

RemoteDesktopModal.propTypes = propTypes;

export default injectIntl(withModalMounter(RemoteDesktopModal));
