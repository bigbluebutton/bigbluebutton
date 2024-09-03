import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { UserCameraHelperButton, UserCameraHelperInterface } from 'bigbluebutton-html-plugin-sdk';
import { UpdatedDataForUserCameraDomElement } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';
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
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';
import PluginButtonContainer from '../../../plugins/plugin-button/container';
import { UserCameraHelperAreas } from '../../../plugins-engine/extensible-areas/components/user-camera-helper/types';

const intlMessages = defineMessages({
  disableDesc: {
    id: 'app.videoDock.webcamDisableDesc',
  },
});

const VIDEO_CONTAINER_WIDTH_BOUND = 125;

interface VideoListItemProps {
  pluginUserCameraHelperPerPosition: UserCameraHelperAreas;
  isFullscreenContext: boolean;
  setUserCamerasRequestedFromPlugin: React.Dispatch<React.SetStateAction<UpdatedDataForUserCameraDomElement[]>>;
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

const renderPluginItems = (
  streamId: string, userId: string,
  pluginItems: UserCameraHelperInterface[],
  bottom: boolean, right: boolean,
) => {
  if (pluginItems !== undefined) {
    return (
      <>
        {
          pluginItems.map((pluginItem) => {
            const pluginButton = pluginItem as UserCameraHelperButton;
            const returnComponent = (
              <PluginButtonContainer
                key={`${pluginButton.type}-${pluginButton.id}-${pluginButton.label}`}
                dark
                bottom={bottom}
                right={right}
                icon={pluginButton.icon}
                label={pluginButton.label}
                onClick={({ browserClickEvent }) => pluginButton.onClick({ browserClickEvent, streamId, userId })}
              />
            );
            return returnComponent;
          })
        }
      </>
    );
  }
  return (<></>);
};

const VideoListItem: React.FC<VideoListItemProps> = (props) => {
  const {
    name, voiceUser, isFullscreenContext, layoutContextDispatch, onHandleVideoFocus,
    cameraId, numOfStreams, focused, onVideoItemMount, onVideoItemUnmount,
    makeDragOperations, dragging, draggingOver, isRTL, isStream, settingsSelfViewDisable,
    disabledCams, amIModerator, stream, setUserCamerasRequestedFromPlugin,
    pluginUserCameraHelperPerPosition,
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

  useEffect(() => {
    setUserCamerasRequestedFromPlugin((userCamera) => {
      if (videoContainer.current && !userCamera.some((uc) => uc.streamId === cameraId)) {
        userCamera.push({
          streamId: cameraId,
          userCameraDomElement: videoContainer.current,
        });
      }
      return userCamera;
    });
  }, [videoContainer]);

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

  const renderScreenshareButtons = () => {
    const {
      userCameraHelperTopLeft: topLeftPluginItems,
      userCameraHelperTopRight: topRightPluginItems,
      userCameraHelperBottomLeft: bottomLeftPluginItems,
      userCameraHelperBottomRight: bottomRightPluginItems,
    } = pluginUserCameraHelperPerPosition;
    const { userId } = stream;
    return (
      <>
        <Styled.UserCameraButtonsContainterWrapper
          positionYAxis="top"
          positionXAxis="left"
        >
          {renderPluginItems(cameraId, userId, topLeftPluginItems, false, false)}
        </Styled.UserCameraButtonsContainterWrapper>
        <Styled.UserCameraButtonsContainterWrapper
          positionYAxis="top"
          positionXAxis="right"
        >
          {renderPluginItems(cameraId, userId, topRightPluginItems, false, true)}
        </Styled.UserCameraButtonsContainterWrapper>
        <Styled.UserCameraButtonsContainterWrapper
          positionYAxis="bottom"
          positionXAxis="left"
        >
          {renderPluginItems(cameraId, userId, bottomLeftPluginItems, true, false)}
        </Styled.UserCameraButtonsContainterWrapper>
        <Styled.UserCameraButtonsContainterWrapper
          positionYAxis="bottom"
          positionXAxis="right"
        >
          {renderPluginItems(cameraId, userId, bottomRightPluginItems, true, true)}
        </Styled.UserCameraButtonsContainterWrapper>
      </>
    );
  };

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
      {renderScreenshareButtons()}
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

      {(videoIsReady || (isSelfViewDisabled || disabledCams.includes(cameraId))) && (
        isVideoSqueezed ? renderSqueezedButton() : renderDefaultButtons()
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
