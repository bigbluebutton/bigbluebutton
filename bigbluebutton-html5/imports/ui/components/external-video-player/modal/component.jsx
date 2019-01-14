import React, {Component} from "react";
import { withModalMounter } from '/imports/ui/components/modal/service';

import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';

import {styles} from './styles';

import { defineMessages, injectIntl } from 'react-intl';

const intlMessages = defineMessages({
  start: {
    id: 'app.externalVideo.start',
    description: 'Share youtube video',
  },
  stop: {
    id: 'app.externalVideo.stop',
    description: 'Stop sharing video',
  },
  urlError: {
    id: 'app.externalVideo.urlError',
    description: 'Not a video URL error',
  },
  input: {
    id: 'app.externalVideo.input',
    description: 'Video URL',
  },
  title: {
    id: 'app.externalVideo.title',
    description: 'Modal title',
  },
  close: {
    id: 'app.externalVideo.close',
    description: 'Close',
  },
});

const YOUTUBE_PREFIX = "https://youtube.com/watch?v=";

const getUrlFromVideoId = (id) => {
  return id ? `${YOUTUBE_PREFIX}${id}` : '';
}

class ExternalVideoModal extends Component {

  const { videoId } = this.props;

  state = {
    url: getUrlFromVideoId(videoId),
    sharing: videoId,
  };

  isUrlEmpty = () => {
    const url = this.state.url;
    return !url || url.length == 0;
  }

  isUrlValid = () => {
    const url = this.state.url;
    const regexp = RegExp('^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$');
    return !this.isUrlEmpty() && url.match(regexp);
  }

  startWatchingHandler = () => {
    this.props.startWatching(this.state.url);
    this.props.closeModal();
  }

  stopWatchingHandler = () => {
    this.props.stopWatching();
    this.props.closeModal();
  }

  updateVideoUrlHandler = (ev) => {
    console.log(this.props);
    this.setState({...this.state, url: ev.target.value});
  }

  renderUrlError = () => {
    const { intl } = this.props;
    const { url } = this.state;

    const valid = !this.isUrlEmpty() && url.length > 3 && !this.isUrlValid();

    return (
      valid ?
        (<div className={styles.urlError}>
          {intl.formatMessage(intlMessages.urlError)}
        </div>)
      :
        null
    );
  }

  render() {
    const { intl } = this.props.intl;

    return (
      <ModalBase
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={this.props.closeModal}
      >
        <header data-test="videoModealHeader" className={styles.header}>
          <h3 className={styles.title} >{intl.formatMessage(intlMessages.title)}</h3>
          <Button
            data-test="modalBaseCloseButton"
            className={styles.closeBtn}
            label={intl.formatMessage(intlMessages.close)}
            icon="close"
            size="md"
            hideLabel
            onClick={this.props.closeModal}
          />
        </header>

        <div className={styles.content}>
          <div className={styles.videoUrl}>
            <label htmlFor="video-modal-input">
              {intl.formatMessage(intlMessages.input)}
            </label>
            <input
              id="video-modal-input"
              onChange={this.updateVideoUrlHandler}
              name="video-modal-input"
              value={this.state.url || ""}
            />
          </div>

          <div className={styles.content}>
	        {this.renderUrlError()}
	      </div>


          <Button
            className={styles.startBtn}
            label={intl.formatMessage(intlMessages.start)}
            onClick={this.startWatchingHandler}
            disabled={!this.isUrlValid() || (getUrlFromVideoId(this.props.url) === this.state.url)}>
          </Button>

          <Button
            className={styles.stopBtn}
            label={intl.formatMessage(intlMessages.stop)}
            onClick={this.stopWatchingHandler}
            disabled={!this.state.sharing}>
          </Button>
        </div>
      </ModalBase>
    );
  }
}

export default injectIntl(withModalMounter(ExternalVideoModal));
