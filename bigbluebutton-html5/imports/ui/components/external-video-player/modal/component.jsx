import React, { Component } from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';

import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';

import { defineMessages, injectIntl } from 'react-intl';
import { isUrlValid, getUrlFromVideoId } from '../service';

import { styles } from './styles';

const intlMessages = defineMessages({
  start: {
    id: 'app.externalVideo.start',
    description: 'Share youtube video',
  },
  urlError: {
    id: 'app.externalVideo.urlError',
    description: 'Not a video URL error',
  },
  input: {
    id: 'app.externalVideo.input',
    description: 'Video URL',
  },
  urlInput: {
    id: 'app.externalVideo.urlInput',
    description: 'URL input field placeholder',
  },
  title: {
    id: 'app.externalVideo.title',
    description: 'Modal title',
  },
  close: {
    id: 'app.externalVideo.close',
    description: 'Close',
  },
  note: {
    id: 'app.externalVideo.noteLabel',
    description: 'provides hint about Shared YouTube videos',
  },
});

class ExternalVideoModal extends Component {
  constructor(props) {
    super(props);

    const { videoId } = props;

    this.state = {
      url: getUrlFromVideoId(videoId),
      sharing: videoId,
    };

    this.startWatchingHandler = this.startWatchingHandler.bind(this);
    this.updateVideoUrlHandler = this.updateVideoUrlHandler.bind(this);
    this.renderUrlError = this.renderUrlError.bind(this);
    this.updateVideoUrlHandler = this.updateVideoUrlHandler.bind(this);
  }

  startWatchingHandler() {
    const { startWatching, closeModal } = this.props;
    const { url } = this.state;

    startWatching(url.trim());
    closeModal();
  }

  updateVideoUrlHandler(ev) {
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
    const { intl, videoId, closeModal } = this.props;
    const { url, sharing } = this.state;

    const startDisabled = !isUrlValid(url) || (getUrlFromVideoId(videoId) === url);

    return (
      <ModalBase
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
      >
        <header data-test="videoModealHeader" className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.title)}</h3>
          <Button
            data-test="modalBaseCloseButton"
            className={styles.closeBtn}
            label={intl.formatMessage(intlMessages.close)}
            icon="close"
            size="md"
            hideLabel
            onClick={closeModal}
          />
        </header>

        <div className={styles.content}>
          <div className={styles.videoUrl}>
            <label htmlFor="video-modal-input" id="video-modal-input">
              {intl.formatMessage(intlMessages.input)}
              <input
                id="video-modal-input"
                onChange={this.updateVideoUrlHandler}
                name="video-modal-input"
                value={url}
                placeholder={intl.formatMessage(intlMessages.urlInput)}
                disabled={sharing}
              />
            </label>
            <div className={styles.youtubeNote}>
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
      </ModalBase>
    );
  }
}

export default injectIntl(withModalMounter(ExternalVideoModal));
