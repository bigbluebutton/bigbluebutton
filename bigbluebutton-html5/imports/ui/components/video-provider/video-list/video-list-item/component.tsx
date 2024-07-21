import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Session from '/imports/ui/services/storage/in-memory';
import UserActions from '/imports/ui/components/video-provider/video-list/video-list-item/user-actions/component';
import UserStatus from '/imports/ui/components/video-provider/video-list/video-list-item/user-status/component';
import PinArea from '/imports/ui/components/video-provider/video-list/video-list-item/pin-area/component';
import UserAvatarVideo from '/imports/ui/components/video-provider/video-list/video-list-item/user-avatar/component';
import {
  isStreamStateUnhealthy,
  subscribeToStreamStateChange,
  unsubscribeFromStreamStateChange,
} from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import VideoService from '/imports/ui/components/video-provider/service';
import Styled from './styles';
import withDragAndDrop from './drag-and-drop/component';
import Auth from '/imports/ui/services/auth';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import PopoutButtonContainer from '/imports/ui/components/media/popout-button/container';
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';

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
  stream: VideoItem;
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
    name, voiceUser, isFullscreenContext, layoutContextDispatch, onHandleVideoFocus,
    cameraId, numOfStreams, focused, onVideoItemMount, onVideoItemUnmount,
    makeDragOperations, dragging, draggingOver, isRTL, isStream, settingsSelfViewDisable,
    disabledCams, amIModerator, stream,
  } = props;

  const intl = useIntl();

  const [videoDataLoaded, setVideoDataLoaded] = useState(false);
  const [isStreamHealthy, setIsStreamHealthy] = useState(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(VideoService.mirrorOwnWebcam(stream.userId));
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
  const Settings = getSettingsSingletonInstance();
  const { animations, webcamBorderHighlightColor } = Settings.application;
  const talking = voiceUser?.talking;
  const raiseHand = (stream.type === VIDEO_TYPES.GRID && stream.raiseHand)
    || (stream.type === VIDEO_TYPES.STREAM && stream.user.raiseHand);
  const { data: currentUser } = useCurrentUser((u) => ({
    userId: u.userId,
    pinned: u.pinned,
    nameSortable: u.nameSortable,
    name: u.name,
    away: u.away,
    disconnected: u.disconnected,
    role: u.role,
    avatar: u.avatar,
    color: u.color,
    presenter: u.presenter,
    clientType: u.clientType,
    raiseHand: u.raiseHand,
    isModerator: u.isModerator,
    reactionEmoji: u.reactionEmoji,
  }));

  let user;
  switch (stream.type) {
    case VIDEO_TYPES.STREAM: {
      user = stream.user;
      break;
    }
    case VIDEO_TYPES.GRID: {
      user = stream;
      break;
    }
    case VIDEO_TYPES.CONNECTING:
    default: {
      user = currentUser ?? {};
      break;
    }
  }

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
    Session.setItem('canConnect', true);
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
    if ((isSelfViewDisabled && stream.userId === Auth.userID) || disabledCams?.includes(cameraId)) {
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
      isFullscreenContext={isFullscreenContext}
      layoutContextDispatch={layoutContextDispatch}
    />
  );

  const renderWebcamConnecting = () => (
    <Styled.WebcamConnecting
      data-test="webcamConnecting"
      animations={animations}
    >
      <UserAvatarVideo
        user={user}
        stream={stream}
        voiceUser={voiceUser}
        unhealthyStream={videoDataLoaded && !isStreamHealthy}
        squeezed={false}
      />
      <Styled.TopBar>
        {raiseHand && <Styled.RaiseHand>✋</Styled.RaiseHand>}
      </Styled.TopBar>
      <Styled.BottomBar>
        <UserActions
          name={name}
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
          videoContainer={videoContainer}
          isFullscreenContext={isFullscreenContext}
          layoutContextDispatch={layoutContextDispatch}
        />
        <UserStatus
          voiceUser={voiceUser}
          user={user}
          stream={stream}
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
        stream={stream}
        unhealthyStream={videoDataLoaded && !isStreamHealthy}
        squeezed
      />
      {renderSqueezedButton()}
    </Styled.WebcamConnecting>
  );

  const renderDefaultButtons = () => (
    <>
      <Styled.TopBar>
        {raiseHand && <Styled.RaiseHand>✋</Styled.RaiseHand>}
        <PinArea
          stream={stream}
          amIModerator={amIModerator}
        />
      </Styled.TopBar>
      <Styled.BottomBar>
        <UserActions
          name={name}
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
          videoContainer={videoContainer}
          isFullscreenContext={isFullscreenContext}
          layoutContextDispatch={layoutContextDispatch}
        />
        <UserStatus
          voiceUser={voiceUser}
          user={user}
          stream={stream}
        />
      </Styled.BottomBar>
    </>
  );

  const renderPopoutButton = () => (
    <PopoutButtonContainer
      popoutRef={videoContainer.current}
      elementName={name}
      dark
    />
  );

  const {
    onDragLeave,
    onDragOver,
    onDrop,
  } = makeDragOperations(stream.userId);

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
        $selfViewDisabled={(isSelfViewDisabled && stream.userId === Auth.userID)
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

      {isStream && ((isSelfViewDisabled && stream.userId === Auth.userID)
      || disabledCams.includes(cameraId)) && (
        <Styled.VideoDisabled>
          {intl.formatMessage(intlMessages.disableDesc)}
        </Styled.VideoDisabled>
      )}

      {/* eslint-disable-next-line no-nested-ternary */}

      {(videoIsReady || (isSelfViewDisabled || disabledCams.includes(cameraId)))
      && (
        <>
          {isVideoSqueezed ? renderSqueezedButton() : renderDefaultButtons()}
          {renderPopoutButton()}
        </>
      )}
      {!videoIsReady && (!isSelfViewDisabled || !isStream) && (
        isVideoSqueezed ? renderWebcamConnectingSqueezed() : renderWebcamConnecting()
      )}
      {((isSelfViewDisabled && stream.userId === Auth.userID) || disabledCams.includes(cameraId))
      && renderWebcamConnecting()}
    </Styled.Content>
  );
};

// @ts-expect-error -> Until everything in Typescript.
export default withDragAndDrop(VideoListItem);
