import React, { Component } from 'react';
import browser from 'browser-detect';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cx from 'classnames';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import Icon from '/imports/ui/components/icon/component';
import logger from '/imports/startup/client/logger';
import FullscreenService from '/imports/ui/components/fullscreen-button/service';
import FullscreenButtonContainer from '/imports/ui/components/fullscreen-button/container';
import { styles } from '../styles';
import { withDraggableConsumer } from '/imports/ui/components/media/webcam-draggable-overlay/context';
import VideoService from '../../service';

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

class VideoListItem extends Component {
  constructor(props) {
    super(props);
    this.videoTag = null;

    this.state = {
      videoIsReady: false,
      isFullscreen: false,
    };

    this.mirrorOwnWebcam = VideoService.mirrorOwnWebcam(props.userId);

    this.setVideoIsReady = this.setVideoIsReady.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
  }

  componentDidMount() {
    const { onMount, webcamDraggableDispatch } = this.props;

    webcamDraggableDispatch(
      {
        type: 'setVideoRef',
        value: this.videoTag,
      },
    );

    onMount(this.videoTag);

    this.videoTag.addEventListener('loadeddata', this.setVideoIsReady);
    this.videoContainer.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  componentDidUpdate() {
    const playElement = (elem) => {
      if (elem.paused) {
        elem.play().catch((error) => {
          // NotAllowedError equals autoplay issues, fire autoplay handling event
          if (error.name === 'NotAllowedError') {
            const tagFailedEvent = new CustomEvent('videoPlayFailed', { detail: { mediaTag: elem } });
            window.dispatchEvent(tagFailedEvent);
          }
        });
      }
    };

    // This is here to prevent the videos from freezing when they're
    // moved around the dom by react, e.g., when  changing the user status
    // see https://bugs.chromium.org/p/chromium/issues/detail?id=382879
    if (this.videoTag) {
      playElement(this.videoTag);
    }
  }

  componentWillUnmount() {
    this.videoTag.removeEventListener('loadeddata', this.setVideoIsReady);
    this.videoContainer.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  onFullscreenChange() {
    const { webcamDraggableDispatch } = this.props;
    const { isFullscreen } = this.state;
    const serviceIsFullscreen = FullscreenService.isFullScreen(this.videoContainer);

    if (isFullscreen !== serviceIsFullscreen) {
      this.setState({ isFullscreen: serviceIsFullscreen });
      webcamDraggableDispatch(
        {
          type: 'setIsCameraFullscreen',
          value: serviceIsFullscreen,
        },
      );
    }
  }

  setVideoIsReady() {
    const { videoIsReady } = this.state;
    if (!videoIsReady) this.setState({ videoIsReady: true });
    window.dispatchEvent(new Event('resize'));
  }

  getAvailableActions() {
    const {
      actions,
      cameraId,
      name,
    } = this.props;

    return _.compact([
      <DropdownListTitle className={styles.hiddenDesktop} key="name">{name}</DropdownListTitle>,
      <DropdownListSeparator className={styles.hiddenDesktop} key="sep" />,
      ...actions.map(action => (<DropdownListItem key={cameraId} {...action} />)),
    ]);
  }

  renderFullscreenButton() {
    const { name } = this.props;
    const { isFullscreen } = this.state;

    if (!ALLOW_FULLSCREEN) return null;

    return (
      <FullscreenButtonContainer
        fullscreenRef={this.videoContainer}
        elementName={name}
        isFullscreen={isFullscreen}
        dark
      />
    );
  }

  render() {
    const {
      videoIsReady,
      isFullscreen,
    } = this.state;
    const {
      name,
      voiceUser,
      numOfStreams,
      webcamDraggableState,
      swapLayout,
      mirrored
    } = this.props;
    const availableActions = this.getAvailableActions();
    const enableVideoMenu = Meteor.settings.public.kurento.enableVideoMenu || false;

    const result = browser();
    const isFirefox = (result && result.name) ? result.name.includes('firefox') : false;

    return (
      <div className={cx({
        [styles.content]: true,
        [styles.talking]: voiceUser.talking,
      })}
      >
        {
          !videoIsReady &&
            <div className={styles.connecting}>
              <span className={styles.loadingText}>{name}</span>
            </div>
        }
        <div
          className={styles.videoContainer}
          ref={(ref) => { this.videoContainer = ref; }}
        >
          <video
            muted
            className={cx({
              [styles.media]: true,
              [styles.cursorGrab]: !webcamDraggableState.dragging
                && !isFullscreen && !swapLayout,
              [styles.cursorGrabbing]: webcamDraggableState.dragging
                && !isFullscreen && !swapLayout,
              [styles.mirroredVideo]: (this.mirrorOwnWebcam && !mirrored) || (!this.mirrorOwnWebcam && mirrored),
            })}
            ref={(ref) => { this.videoTag = ref; }}
            autoPlay
            playsInline
          />
          {videoIsReady && this.renderFullscreenButton()}
        </div>
        { videoIsReady &&
          <div className={styles.info}>
          {enableVideoMenu && availableActions.length >= 3
            ? (
              <Dropdown className={isFirefox ? styles.dropdownFireFox : styles.dropdown}>
                <DropdownTrigger className={styles.dropdownTrigger}>
                  <span>{name}</span>
                </DropdownTrigger>
                <DropdownContent placement="top left" className={styles.dropdownContent}>
                  <DropdownList className={styles.dropdownList}>
                    {availableActions}
                  </DropdownList>
                </DropdownContent>
              </Dropdown>
            )
            : (
              <div className={isFirefox ? styles.dropdownFireFox
                : styles.dropdown}
              >
                <span className={cx({
                  [styles.userName]: true,
                  [styles.noMenu]: numOfStreams < 3,
                })}
                >
                  {name}
                </span>
              </div>
            )
          }
          {voiceUser.muted && !voiceUser.listenOnly ? <Icon className={styles.muted} iconName="unmute_filled" /> : null}
          {voiceUser.listenOnly ? <Icon className={styles.voice} iconName="listen" /> : null}
        </div>
        }
      </div>
    );
  }
}

export default withDraggableConsumer(VideoListItem);

VideoListItem.defaultProps = {
  numOfStreams: 0,
};

VideoListItem.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.object).isRequired,
  cameraId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  numOfStreams: PropTypes.number,
};
