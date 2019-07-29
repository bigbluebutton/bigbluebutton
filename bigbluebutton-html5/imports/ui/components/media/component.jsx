import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import WebcamDraggable from './webcam-draggable-overlay/component';

import { styles } from './styles';

const propTypes = {
  children: PropTypes.element.isRequired,
  floatingOverlay: PropTypes.bool,
  hideOverlay: PropTypes.bool,
};

const defaultProps = {
  floatingOverlay: false,
  hideOverlay: true,
};


export default class Media extends Component {
  constructor(props) {
    super(props);
    this.refContainer = React.createRef();

    this.failedTags = [];
    this.listeningToTagPlayFailed = false;
    this.monitorMediaTagPlayFailures();
  }

  monitorMediaTagPlayFailures() {
    const handleFailTagEvent = (e) => {
      e.stopPropagation();
      this.failedTags.push(e.detail.mediaTag);

      if (!this.listeningToTagPlayFailed) {
        this.listeningToTagPlayFailed = true;
        // Monitor user action events so we can play and flush all the failed tags
        // in the queue when the user performs one of them
        window.addEventListener('click', flushFailedTags);
        window.addEventListener('auxclick', flushFailedTags);
        window.addEventListener('keydown', flushFailedTags);
        window.addEventListener('touchstart', flushFailedTags);
      }
    }

    const flushFailedTags = () => {
      window.removeEventListener('click', flushFailedTags);
      window.removeEventListener('auxclick', flushFailedTags);
      window.removeEventListener('keydown', flushFailedTags);
      window.removeEventListener('touchstart', flushFailedTags);

      while (this.failedTags.length) {
        const mediaTag = this.failedTags.shift();
        if (mediaTag) {
          mediaTag.play().catch(e => {
            // Ignore the error for now.
          });
        }
      };

      this.listeningToTagPlayFailed = false;
    }

    // Monitor tag play failure events, probably due to autoplay. The callback
    // puts the failed tags in a queue which will be flushed on a user action
    // by the listeners created @handleFailTagEvent. Once the queue is flushed, all
    // user action listeners are removed since the autoplay restriction should be over.
    // Every media tag in the app should have a then/catch handler and emit
    // this event accordingly so we can try to circumvent autoplay without putting
    // a UI block/prompt.
    // If a tag fail to play again for some odd reason, the listeners will be
    // reattached (see this.listeningToTagPlayFailed) and flushFailedTags runs again
    window.addEventListener("mediaTagPlayFailed", handleFailTagEvent);
  }

  componentWillUpdate() {
    window.dispatchEvent(new Event('resize'));
  }

  componentDidUpdate(prevProps) {
    const {
      userWasInWebcam,
      audioModalIsOpen,
      joinVideo,
    } = this.props;

    const {
      audioModalIsOpen: oldAudioModalIsOpen,
    } = prevProps;

    if ((!audioModalIsOpen && oldAudioModalIsOpen) && userWasInWebcam) {
      Session.set('userWasInWebcam', false);
      joinVideo();
    }
  }

  render() {
    const {
      swapLayout,
      floatingOverlay,
      hideOverlay,
      disableVideo,
      children,
      audioModalIsOpen,
      usersVideo,
    } = this.props;

    const contentClassName = cx({
      [styles.content]: true,
    });

    const overlayClassName = cx({
      [styles.overlay]: true,
      [styles.hideOverlay]: hideOverlay,
      [styles.floatingOverlay]: floatingOverlay,
    });

    return (
      <div
        id="container"
        className={cx(styles.container)}
        ref={this.refContainer}
      >
        <div
          className={!swapLayout ? contentClassName : overlayClassName}
          style={{
            maxHeight: usersVideo.length < 1 || floatingOverlay ? '100%' : '80%',
            minHeight: '20%',
          }}
        >
          {children}
        </div>
        <WebcamDraggable
          refMediaContainer={this.refContainer}
          swapLayout={swapLayout}
          singleWebcam={floatingOverlay}
          usersVideoLenght={usersVideo.length}
          hideOverlay={hideOverlay}
          disableVideo={disableVideo}
          audioModalIsOpen={audioModalIsOpen}
          usersVideo={usersVideo}
        />
      </div>
    );
  }
}

Media.propTypes = propTypes;
Media.defaultProps = defaultProps;
