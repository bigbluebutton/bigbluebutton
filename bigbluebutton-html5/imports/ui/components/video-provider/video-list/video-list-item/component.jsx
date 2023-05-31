import React, { useEffect, useRef, useState } from 'react';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import PropTypes from 'prop-types';
import UserActions from '/imports/ui/components/video-provider/video-list/video-list-item/user-actions/component';
import UserStatus from '/imports/ui/components/video-provider/video-list/video-list-item/user-status/component';
import PinArea from '/imports/ui/components/video-provider/video-list/video-list-item/pin-area/component';
import UserAvatarVideo from '/imports/ui/components/video-provider/video-list/video-list-item/user-avatar/component';
import ViewActions from '/imports/ui/components/video-provider/video-list/video-list-item/view-actions/component';
import {
  isStreamStateUnhealthy,
  subscribeToStreamStateChange,
  unsubscribeFromStreamStateChange,
} from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import Settings from '/imports/ui/services/settings';
import VideoService from '/imports/ui/components/video-provider/service';
import Styled from './styles';
import { withDragAndDrop } from './drag-and-drop/component';

const VIDEO_CONTAINER_WIDTH_BOUND = 125;

const VideoListItem = (props) => {
  const {
    name, voiceUser, isFullscreenContext, layoutContextDispatch, user, onHandleVideoFocus,
    cameraId, numOfStreams, focused, onVideoItemMount, onVideoItemUnmount, onVirtualBgDrop,
    makeDragOperations, dragging, draggingOver, isRTL
  } = props;

  const [videoDataLoaded, setVideoDataLoaded] = useState(false);
  const [isStreamHealthy, setIsStreamHealthy] = useState(false);
  const [isMirrored, setIsMirrored] = useState(VideoService.mirrorOwnWebcam(user?.userId));
  const [isVideoSqueezed, setIsVideoSqueezed] = useState(false);

  const resizeObserver = new ResizeObserver((entry) => {
    if (entry && entry[0]?.contentRect?.width < VIDEO_CONTAINER_WIDTH_BOUND) {
      return setIsVideoSqueezed(true);
    }
    return setIsVideoSqueezed(false);
  });

  const videoTag = useRef();
  const videoContainer = useRef();

  const videoIsReady = isStreamHealthy && videoDataLoaded;
  const { animations } = Settings.application;
  const talking = voiceUser?.talking;

  const onStreamStateChange = (e) => {
    const { streamState } = e.detail;
    const newHealthState = !isStreamStateUnhealthy(streamState);
    e.stopPropagation();
    setIsStreamHealthy(newHealthState);
  };

  const onLoadedData = () => {
    setVideoDataLoaded(true);
    window.dispatchEvent(new Event('resize'));

    /* used when re-sharing cameras after leaving a breakout room.
    it is needed in cases where the user has more than one active camera
    so we only share the second camera after the first
    has finished loading (can't share more than one at the same time) */
    Session.set('canConnect', true);
  };

  // component did mount
  useEffect(() => {
    subscribeToStreamStateChange(cameraId, onStreamStateChange);
    onVideoItemMount(videoTag.current);
    resizeObserver.observe(videoContainer.current);
    videoTag?.current?.addEventListener('loadeddata', onLoadedData);

    return () => {
      videoTag?.current?.removeEventListener('loadeddata', onLoadedData);
      resizeObserver.disconnect();
    };
  }, []);

  // component will mount
  useEffect(() => {
    const playElement = (elem) => {
      if (elem.paused) {
        elem.play().catch((error) => {
          // NotAllowedError equals autoplay issues, fire autoplay handling event
          if (error.name === 'NotAllowedError') {
            const tagFailedEvent = new CustomEvent('videoPlayFailed', { detail: { mediaElement: elem } });
            window.dispatchEvent(tagFailedEvent);
          }
        });
      }
    };

    // This is here to prevent the videos from freezing when they're
    // moved around the dom by react, e.g., when  changing the user status
    // see https://bugs.chromium.org/p/chromium/issues/detail?id=382879
    if (videoDataLoaded) {
      playElement(videoTag.current);
    }
  }, [videoDataLoaded]);

  // component will unmount
  useEffect(() => () => {
    unsubscribeFromStreamStateChange(cameraId, onStreamStateChange);
    onVideoItemUnmount(cameraId);
  }, []);

  const renderSqueezedButton = () => (
    <UserActions
      name={name}
      user={user}
      videoContainer={videoContainer}
      isVideoSqueezed={isVideoSqueezed}
      cameraId={cameraId}
      numOfStreams={numOfStreams}
      onHandleVideoFocus={onHandleVideoFocus}
      focused={focused}
      onHandleMirror={() => setIsMirrored((value) => !value)}
      isRTL={isRTL}
    />
  );

  const renderWebcamConnecting = () => (
    <Styled.WebcamConnecting
      data-test="webcamConnecting"
      animations={animations}
    >
      <UserAvatarVideo
        user={user}
        voiceUser={voiceUser}
        unhealthyStream={videoDataLoaded && !isStreamHealthy}
        squeezed={false}
      />
      <Styled.BottomBar>
        <UserActions
          name={name}
          user={user}
          cameraId={cameraId}
          numOfStreams={numOfStreams}
          onHandleVideoFocus={onHandleVideoFocus}
          focused={focused}
          onHandleMirror={() => setIsMirrored((value) => !value)}
          isRTL={isRTL}
        />
        <UserStatus
          voiceUser={voiceUser}
        />
      </Styled.BottomBar>
    </Styled.WebcamConnecting>
  );

  const renderWebcamConnectingSqueezed = () => (
    <Styled.WebcamConnecting
      data-test="webcamConnectingSqueezed"
      animations={animations}
    >
      <UserAvatarVideo
        user={user}
        unhealthyStream={videoDataLoaded && !isStreamHealthy}
        squeezed
      />
      {renderSqueezedButton()}
    </Styled.WebcamConnecting>
  );

  const renderDefaultButtons = () => (
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
          isRTL={isRTL}
        />
        <UserStatus
          voiceUser={voiceUser}
        />
      </Styled.BottomBar>
    </>
  );

  return (
    <Styled.Content
      ref={videoContainer}
      talking={talking}
      fullscreen={isFullscreenContext}
      data-test={talking ? 'webcamItemTalkingUser' : 'webcamItem'}
      animations={animations}
      {...{
        ...makeDragOperations(onVirtualBgDrop, user?.userId),
        dragging,
        draggingOver,
      }}
    >
      <Styled.VideoContainer>
        <Styled.Video
          mirrored={isMirrored}
          unhealthyStream={videoDataLoaded && !isStreamHealthy}
          data-test={isMirrored ? 'mirroredVideoContainer' : 'videoContainer'}
          ref={videoTag}
          autoPlay
          playsInline
        />
      </Styled.VideoContainer>

      {/* eslint-disable-next-line no-nested-ternary */}
      {videoIsReady
        ? (isVideoSqueezed)
          ? renderSqueezedButton()
          : renderDefaultButtons()
        : (isVideoSqueezed)
          ? renderWebcamConnectingSqueezed()
          : renderWebcamConnecting()}
    </Styled.Content>
  );
};

export default withDragAndDrop(injectIntl(VideoListItem));

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
