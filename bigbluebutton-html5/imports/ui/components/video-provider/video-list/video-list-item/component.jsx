import React, { useEffect, useRef, useState } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import ViewActions from '/imports/ui/components/video-provider/video-list/video-list-item/view-actions/component';
import UserActions from '/imports/ui/components/video-provider/video-list/video-list-item/user-actions/component';
import UserStatus from '/imports/ui/components/video-provider/video-list/video-list-item/user-status/component';
import PinArea from '/imports/ui/components/video-provider/video-list/video-list-item/pin-area/component';
import {
  isStreamStateUnhealthy,
  subscribeToStreamStateChange,
  unsubscribeFromStreamStateChange,
} from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import Settings from '/imports/ui/services/settings';
import VideoService from '/imports/ui/components/video-provider/service';
import Styled from './styles';

const VideoListItem = (props) => {
  const {
    name, voiceUser, isFullscreenContext, layoutContextDispatch, user, onHandleVideoFocus,
    cameraId, numOfStreams, focused, onVideoItemMount, onVideoItemUnmount,
  } = props;

  const [videoIsReady, setVideoIsReady] = useState(false);
  const [isStreamHealthy, setIsStreamHealthy] = useState(false);
  const [isMirrored, setIsMirrored] = useState(VideoService.mirrorOwnWebcam(user.userId));

  const videoTag = useRef();
  const videoContainer = useRef();

  const shouldRenderReconnect = !isStreamHealthy && videoIsReady;
  const { animations } = Settings.application;
  const talking = voiceUser?.talking;

  const onStreamStateChange = (e) => {
    const { streamState } = e.detail;
    const newHealthState = !isStreamStateUnhealthy(streamState);
    e.stopPropagation();

    if (newHealthState !== isStreamHealthy) {
      setIsStreamHealthy(newHealthState);
    }
  };

  const handleSetVideoIsReady = () => {
    setVideoIsReady(true);
    window.dispatchEvent(new Event('resize'));

    /* used when re-sharing cameras after leaving a breakout room.
    it is needed in cases where the user has more than one active camera
    so we only share the second camera after the first
    has finished loading (can't share more than one at the same time) */
    Session.set('canConnect', true);
  };

  // component did mount
  useEffect(() => {
    onVideoItemMount(videoTag.current);
    subscribeToStreamStateChange(cameraId, onStreamStateChange);
    videoTag.current.addEventListener('loadeddata', handleSetVideoIsReady);

    return () => {
      videoTag.current.removeEventListener('loadeddata', handleSetVideoIsReady);
    };
  }, []);

  // component will mount
  useEffect(() => {
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
    if (videoIsReady) {
      playElement(videoTag.current);
    }
  }, [videoIsReady]);

  // component will unmount
  useEffect(() => () => {
    unsubscribeFromStreamStateChange(cameraId, onStreamStateChange);
    onVideoItemUnmount(cameraId);
  }, []);

  return (
    <Styled.Content
      ref={videoContainer}
      talking={talking}
      fullscreen={isFullscreenContext}
      data-test={talking ? 'webcamItemTalkingUser' : 'webcamItem'}
      animations={animations}
    >
      {
          videoIsReady
            ? (
              <>
                <Styled.TopBar>
                  <PinArea
                    user={user}
                  />
                  <ViewActions
                    videoContainer={videoContainer}
                    name={name}
                    cameraId={cameraId}
                    isFullscreenContext={isFullscreenContext}
                    layoutContextDispatch={layoutContextDispatch}
                  />
                </Styled.TopBar>
                <Styled.BottomBar>
                  <UserActions
                    name={name}
                    user={user}
                    cameraId={cameraId}
                    numOfStreams={numOfStreams}
                    onHandleVideoFocus={onHandleVideoFocus}
                    focused={focused}
                    onHandleMirror={() => setIsMirrored((value) => !value)}
                  />
                  <UserStatus
                    voiceUser={voiceUser}
                  />
                </Styled.BottomBar>
              </>
            )
            : (
              <Styled.WebcamConnecting
                data-test="webcamConnecting"
                talking={talking}
                animations={animations}
              >
                <Styled.LoadingText>{name}</Styled.LoadingText>
              </Styled.WebcamConnecting>
            )
        }

      <Styled.VideoContainer>
        <Styled.Video
          muted
          mirrored={isMirrored}
          unhealthyStream={shouldRenderReconnect}
          data-test={isMirrored ? 'mirroredVideoContainer' : 'videoContainer'}
          ref={videoTag}
          autoPlay
          playsInline
        />
      </Styled.VideoContainer>

      {shouldRenderReconnect && <Styled.Reconnecting animations={animations} />}
    </Styled.Content>
  );
};

export default injectIntl(VideoListItem);

VideoListItem.defaultProps = {
  numOfStreams: 0,
};

VideoListItem.propTypes = {
  cameraId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  numOfStreams: PropTypes.number,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  onHandleVideoFocus: PropTypes.func.isRequired,
  onVideoItemMount: PropTypes.func.isRequired,
  onVideoItemUnmount: PropTypes.func.isRequired,
  isFullscreenContext: PropTypes.bool.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  user: PropTypes.shape({
    pin: PropTypes.bool.isRequired,
    userId: PropTypes.string.isRequired,
  }).isRequired,
  voiceUser: PropTypes.shape({
    muted: PropTypes.bool.isRequired,
    listenOnly: PropTypes.bool.isRequired,
    talking: PropTypes.bool.isRequired,
    joined: PropTypes.bool.isRequired,
  }).isRequired,
  focused: PropTypes.bool.isRequired,
};
