import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Session } from 'meteor/session';
import UserActions from '/imports/ui/components/video-provider/video-provider-graphql/video-list/video-list-item/user-actions/component';
import UserStatus from '/imports/ui/components/video-provider/video-provider-graphql/video-list/video-list-item/user-status/component';
import PinArea from '/imports/ui/components/video-provider/video-provider-graphql/video-list/video-list-item/pin-area/component';
import UserAvatarVideo from '/imports/ui/components/video-provider/video-provider-graphql/video-list/video-list-item/user-avatar/component';
import ViewActions from '/imports/ui/components/video-provider/video-provider-graphql/video-list/video-list-item/view-actions/component';
import {
  isStreamStateUnhealthy,
  subscribeToStreamStateChange,
  unsubscribeFromStreamStateChange,
} from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import Settings from '/imports/ui/services/settings';
import VideoService from '/imports/ui/components/video-provider/video-provider-graphql/service';
import Styled from './styles';
import withDragAndDrop from './drag-and-drop/component';
import Auth from '/imports/ui/services/auth';
import { StreamUser, VideoItem } from '../../types';

const intlMessages = defineMessages({
  disableDesc: {
    id: 'app.videoDock.webcamDisableDesc',
  },
});

const VIDEO_CONTAINER_WIDTH_BOUND = 125;

interface VideoListItemProps {
  isFullscreenContext: boolean;
  layoutContextDispatch: (...args: unknown[]) => void;
  isRTL: boolean;
  amIModerator: boolean;
  cameraId: string;
  disabledCams: string[];
  focused: boolean;
  isStream: boolean;
  name: string;
  numOfStreams: number;
  onHandleVideoFocus: ((id: string) => void) | null;
  onVideoItemMount: (ref: HTMLVideoElement) => void;
  onVideoItemUnmount: (stream: string) => void;
  settingsSelfViewDisable: boolean;
  stream: VideoItem | undefined;
  user: Partial<StreamUser>;
  makeDragOperations: (userId?: string) => {
    onDragOver: (e: DragEvent) => void,
    onDrop: (e: DragEvent) => void,
    onDragLeave: (e: DragEvent) => void,
  };
  dragging: boolean;
  draggingOver: boolean;
  voiceUser: {
    muted: boolean;
    listenOnly: boolean;
    talking: boolean;
    joined: boolean;
  };
}

const VideoListItem: React.FC<VideoListItemProps> = (props) => {
  const {
    name, voiceUser, isFullscreenContext, layoutContextDispatch, user, onHandleVideoFocus,
    cameraId, numOfStreams, focused, onVideoItemMount, onVideoItemUnmount,
    makeDragOperations, dragging, draggingOver, isRTL, isStream, settingsSelfViewDisable,
    disabledCams, amIModerator, stream,
  } = props;

  const intl = useIntl();

  const [videoDataLoaded, setVideoDataLoaded] = useState(false);
  const [isStreamHealthy, setIsStreamHealthy] = useState(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(VideoService.mirrorOwnWebcam(user?.userId));
  const [isVideoSqueezed, setIsVideoSqueezed] = useState(false);
  const [isSelfViewDisabled, setIsSelfViewDisabled] = useState(false);

  const resizeObserver = new ResizeObserver((entry) => {
    if (entry && entry[0]?.contentRect?.width < VIDEO_CONTAINER_WIDTH_BOUND) {
      return setIsVideoSqueezed(true);
    }
    return setIsVideoSqueezed(false);
  });

  const videoTag = useRef<HTMLVideoElement | null>(null);
  const videoContainer = useRef<HTMLDivElement | null>(null);

  const videoIsReady = isStreamHealthy && videoDataLoaded && !isSelfViewDisabled;
  // @ts-expect-error -> Untyped object.
  const { animations, webcamBorderHighlightColor } = Settings.application;
  const talking = voiceUser?.talking;

  const onStreamStateChange = (e: CustomEvent) => {
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
    onVideoItemMount(videoTag.current!);
    if (videoContainer.current) resizeObserver.observe(videoContainer.current);
    videoTag?.current?.addEventListener('loadeddata', onLoadedData);

    return () => {
      videoTag?.current?.removeEventListener('loadeddata', onLoadedData);
      resizeObserver.disconnect();
    };
  }, []);

  // component will mount
  useEffect(() => {
    const playElement = (elem: HTMLVideoElement) => {
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
    if (!isSelfViewDisabled && videoDataLoaded) {
      playElement(videoTag.current!);
    }
    if ((isSelfViewDisabled && user.userId === Auth.userID) || disabledCams?.includes(cameraId)) {
      videoTag.current?.pause?.();
    }
  }, [isSelfViewDisabled, videoDataLoaded]);

  // component will unmount
  useEffect(() => () => {
    unsubscribeFromStreamStateChange(cameraId, onStreamStateChange);
    onVideoItemUnmount(cameraId);
  }, []);

  useEffect(() => {
    setIsSelfViewDisabled(settingsSelfViewDisable);
  }, [settingsSelfViewDisable]);

  const renderSqueezedButton = () => (
    <UserActions
      name={name}
      user={user}
      stream={stream}
      videoContainer={videoContainer}
      isVideoSqueezed={isVideoSqueezed}
      cameraId={cameraId}
      numOfStreams={numOfStreams}
      onHandleVideoFocus={onHandleVideoFocus}
      focused={focused}
      onHandleMirror={() => setIsMirrored((value) => !value)}
      isMirrored={isMirrored}
      isRTL={isRTL}
      isStream={isStream}
      onHandleDisableCam={() => setIsSelfViewDisabled((value) => !value)}
      isSelfViewDisabled={isSelfViewDisabled}
      amIModerator={amIModerator}
    />
  );

  const renderWebcamConnecting = () => (
    <Styled.WebcamConnecting
      data-test="webcamConnecting"
      animations={animations}
    >
      <UserAvatarVideo
        user={{ ...user, ...stream }}
        voiceUser={voiceUser}
        unhealthyStream={videoDataLoaded && !isStreamHealthy}
        squeezed={false}
      />
      <Styled.BottomBar>
        <UserActions
          name={name}
          user={user}
          stream={stream}
          cameraId={cameraId}
          numOfStreams={numOfStreams}
          onHandleVideoFocus={onHandleVideoFocus}
          focused={focused}
          onHandleMirror={() => setIsMirrored((value) => !value)}
          isMirrored={isMirrored}
          isRTL={isRTL}
          isStream={isStream}
          onHandleDisableCam={() => setIsSelfViewDisabled((value) => !value)}
          isSelfViewDisabled={isSelfViewDisabled}
          amIModerator={amIModerator}
        />
        <UserStatus
          voiceUser={voiceUser}
          user={{ ...user, ...stream }}
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
          stream={stream}
          amIModerator={amIModerator}
        />
        <ViewActions
          videoContainer={videoContainer}
          name={name}
          cameraId={cameraId}
          isFullscreenContext={isFullscreenContext}
          layoutContextDispatch={layoutContextDispatch}
          isStream={isStream}
        />
      </Styled.TopBar>
      <Styled.BottomBar>
        <UserActions
          name={name}
          user={user}
          stream={stream}
          cameraId={cameraId}
          numOfStreams={numOfStreams}
          onHandleVideoFocus={onHandleVideoFocus}
          focused={focused}
          onHandleMirror={() => setIsMirrored((value) => !value)}
          isMirrored={isMirrored}
          isRTL={isRTL}
          isStream={isStream}
          onHandleDisableCam={() => setIsSelfViewDisabled((value) => !value)}
          isSelfViewDisabled={isSelfViewDisabled}
          amIModerator={amIModerator}
        />
        <UserStatus
          voiceUser={voiceUser}
          user={{ ...user, ...stream }}
        />
      </Styled.BottomBar>
    </>
  );

  const {
    onDragLeave,
    onDragOver,
    onDrop,
  } = makeDragOperations(user?.userId);

  return (
    // @ts-expect-error -> Until everything in Typescript.
    <Styled.Content
      ref={videoContainer}
      talking={talking}
      customHighlight={webcamBorderHighlightColor}
      fullscreen={isFullscreenContext}
      data-test={talking ? 'webcamItemTalkingUser' : 'webcamItem'}
      animations={animations}
      isStream={isStream}
      {...{
        onDragLeave,
        onDragOver,
        onDrop,
        dragging,
        draggingOver,
      }}
    >

      <Styled.VideoContainer
        $selfViewDisabled={(isSelfViewDisabled && user.userId === Auth.userID)
          || disabledCams.includes(cameraId)}
      >
        <Styled.Video
          mirrored={isMirrored}
          unhealthyStream={videoDataLoaded && !isStreamHealthy}
          data-test={isMirrored ? 'mirroredVideoContainer' : 'videoContainer'}
          ref={videoTag}
          muted
          autoPlay
          playsInline
        />
      </Styled.VideoContainer>

      {isStream && ((isSelfViewDisabled && user.userId === Auth.userID)
      || disabledCams.includes(cameraId)) && (
        <Styled.VideoDisabled>
          {intl.formatMessage(intlMessages.disableDesc)}
        </Styled.VideoDisabled>
      )}

      {/* eslint-disable-next-line no-nested-ternary */}

      {(videoIsReady || (isSelfViewDisabled || disabledCams.includes(cameraId))) && (
        isVideoSqueezed ? renderSqueezedButton() : renderDefaultButtons()
      )}
      {!videoIsReady && (!isSelfViewDisabled || !isStream) && (
        isVideoSqueezed ? renderWebcamConnectingSqueezed() : renderWebcamConnecting()
      )}
      {((isSelfViewDisabled && user.userId === Auth.userID) || disabledCams.includes(cameraId))
      && renderWebcamConnecting()}
    </Styled.Content>
  );
};

// @ts-expect-error -> Until everything in Typescript.
export default withDragAndDrop(VideoListItem);
