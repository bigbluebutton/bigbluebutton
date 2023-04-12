import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { isUrlValid } from '../service';
import Settings from '/imports/ui/services/settings';
import Styled from './styles';

const intlMessages = defineMessages({
  start: {
    id: 'app.externalVideo.start',
    description: 'Share external video',
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
    description: 'provides hint about Shared External videos',
  },
});

class ExternalVideoModal extends Component {
  constructor(props) {
    super(props);

    const { videoUrl } = props;

    this.state = {
      url: videoUrl,
      sharing: videoUrl,
    };

    this.startWatchingHandler = this.startWatchingHandler.bind(this);
    this.updateVideoUrlHandler = this.updateVideoUrlHandler.bind(this);
    this.renderUrlError = this.renderUrlError.bind(this);
    this.updateVideoUrlHandler = this.updateVideoUrlHandler.bind(this);
  }

  startWatchingHandler() {
    const {
      startWatching,
      setIsOpen,
    } = this.props;

    const { url } = this.state;

    startWatching(url.trim());
    setIsOpen(false);
  }

  updateVideoUrlHandler(ev) {
    this.setState({ url: ev.target.value });
  }

  renderUrlError() {
    const { intl } = this.props;
    const { url } = this.state;
    const { animations } = Settings.application;

    const valid = (!url || url.length <= 3) || isUrlValid(url);

    return (
      !valid
        ? (
          <Styled.UrlError animations={animations}>
            {intl.formatMessage(intlMessages.urlError)}
          </Styled.UrlError>
        )
        : null
    );
  }

  render() {
    const { intl, setIsOpen, isOpen, onRequestClose, priority, } = this.props;
    const { url, sharing } = this.state;
    const { animations } = Settings.application;

    const startDisabled = !isUrlValid(url);

    return (
      <Styled.ExternalVideoModal
        onRequestClose={() => setIsOpen(false)}
        contentLabel={intl.formatMessage(intlMessages.title)}
        title={intl.formatMessage(intlMessages.title)}
        {...{
          setIsOpen, 
          isOpen,
          onRequestClose,
          priority,
        }}
      >
        <Styled.Content>
          <Styled.VideoUrl animations={animations}>
            <label htmlFor="video-modal-input">
              {intl.formatMessage(intlMessages.input)}
              <input
                autoFocus
                id="video-modal-input"
                onChange={this.updateVideoUrlHandler}
                name="video-modal-input"
                placeholder={intl.formatMessage(intlMessages.urlInput)}
                disabled={sharing}
                aria-describedby="exernal-video-note"
                onPaste={(e) => { e.stopPropagation(); }}
                onCut={(e) => { e.stopPropagation(); }}
                onCopy={(e) => { e.stopPropagation(); }}
              />
            </label>
            <Styled.ExternalVideoNote id="external-video-note">
              {intl.formatMessage(intlMessages.note)}
            </Styled.ExternalVideoNote>
          </Styled.VideoUrl>

          <div>
            {this.renderUrlError()}
          </div>

          <Styled.StartButton
            label={intl.formatMessage(intlMessages.start)}
            onClick={this.startWatchingHandler}
            disabled={startDisabled}
            data-test="startNewVideo"
            color="primary"
          />
        </Styled.Content>
      </Styled.ExternalVideoModal>
    );
  }
}

export default injectIntl(ExternalVideoModal);
