import React, {
  DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { layoutDispatch, layoutSelect } from '/imports/ui/components/layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useSubscription } from '@apollo/client';
import {
  PINNED_USER, STREAMS_COUNTER,
  StreamsCounter,
  assertionStreamsCounter,
} from './queries';
import { defineMessages, useIntl } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import { isStreamStateUnhealthy } from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import { subscribeToStreamStateChange } from './service';
import UserActionContainer from './user-action/component';
import Styled from './styles';
import { withDragAndDrop } from './drag-and-drop/component';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import VideoService from '/imports/ui/components/video-provider/service';
import UserAvatarVideo from './user-avatar/component';
import UserStatus from './user-status/component';
import ViewActions from './view-actions/component';
import PinAreaContainer from './pin-area/component';
import useSelfViewDisable from '/imports/ui/core/local-states/useSelfViewDisable';
import { User } from '/imports/ui/Types/user';
import logger from '/imports/startup/client/logger';

const VIDEO_CONTAINER_WIDTH_BOUND = 175;
const PIN_WEBCAM = Meteor.settings.public.kurento.enableVideoPin;

const intlMessages = defineMessages({
  disableDesc: {
    id: 'app.videoDock.webcamDisableDesc',
  },
});

type OnDropHandlerType = React.DragEventHandler<HTMLDivElement> & ((e: DragEvent<HTMLElement>) => void);
export interface VideoListItemContainerProps {
  cameraId: string;
  onVideoItemMount: (video: HTMLVideoElement | null) => void;
  isStream: boolean;
  focused: boolean;
  name: string;
  makeDragOperations: (userId: string) => ({
    onDragOver:OnDropHandlerType,
    onDragLeave:OnDropHandlerType,
    onDrop:OnDropHandlerType,
  });
  userId: string;
  dragging: boolean;
  draggingOver: boolean,
  isSelfviewDisabled: boolean,
}

interface VideoListItemProps extends VideoListItemContainerProps {
  userId: string;
  talking: boolean;
  disabledCams: string[];
  settingsSelfViewDisable: boolean;
  voiceUser: boolean;
  presenter: boolean;
  clientType: string;
  color: string;
  avatar: string;
  isModerator: boolean;
  emoji: string;
  numOfStreams: number;
  listenOnly: boolean;
  muted: boolean;
  isFullscreenContext: boolean;
  PinnedUserId: string;
}

interface CustomEvent {
  detail: {
    streamState: string;
  };
  stopPropagation: () => void;
}

function customEventAssertion(data: unknown): asserts data is CustomEvent {
  if (!data) {
    throw new Error('data is undefined');
  }
  if (typeof data !== 'object') {
    throw new Error('data is not object');
  }
  if (!('detail' in data)) {
    throw new Error('data.detail is not defined');
  }
  if (typeof data.detail !== 'object') {
    throw new Error('data.detail is not object');
  }
  if (!data.detail) {
    throw new Error('data.detail is falsy');
  }
  if (!('streamState' in data.detail)) {
    throw new Error('data.detail.streamState is not defined');
  }
  if (typeof data.detail.streamState !== 'string') {
    throw new Error('data.detail.streamState is not string');
  }
  if (!('stopPropagation' in data)) {
    throw new Error('data.stopPropagation is not defined');
  }
}

const VideoListItem: React.FC<VideoListItemProps> = ({
  cameraId,
  userId,
  talking,
  onVideoItemMount,
  disabledCams,
  settingsSelfViewDisable,
  name,
  numOfStreams,
  isStream,
  focused,
  isModerator,
  voiceUser,
  presenter,
  clientType,
  color,
  avatar,
  emoji,
  listenOnly,
  muted,
  isFullscreenContext,
  makeDragOperations,
  dragging,
  draggingOver,
  PinnedUserId,
}) => {
  const intl = useIntl();
  const [videoDataLoaded, setVideoDataLoaded] = useState(false);
  const [isStreamHealthy, setIsStreamHealthy] = useState(false);
  // TODO: need to be changed in near future to user from graphql localsettings
  // when it will be ready and video provider will be migrated to graphql
  const [isMirrored, setIsMirrored] = useState<boolean>(VideoService.mirrorOwnWebcam(userId));
  const [isVideoSqueezed, setIsVideoSqueezed] = useState(false);
  const [isSelfViewDisabled, setIsSelfViewDisabled] = useState(false);
  const layoutContextDispatch = layoutDispatch();
  const pinned = userId === PinnedUserId;

  const resizeObserver = new ResizeObserver((entry) => {
    if (entry && entry[0]?.contentRect?.width < VIDEO_CONTAINER_WIDTH_BOUND) {
      return setIsVideoSqueezed(true);
    }
    return setIsVideoSqueezed(false);
  });

  const videoTag = useRef<HTMLVideoElement | null>(null);
  const videoContainer = useRef<HTMLDivElement | null>(null);

  const videoIsReady = isStreamHealthy && videoDataLoaded && !isSelfViewDisabled;
  // @ts-ignore: Singleton with auto-generated Fields
  const { animations } = Settings.application;

  const onStreamStateChange = useCallback((evt: Event) => {
    const e: unknown = evt;
    customEventAssertion(e);
    const { streamState } = e.detail;
    const newHealthState = !isStreamStateUnhealthy(streamState);
    e.stopPropagation();
    setIsStreamHealthy(newHealthState);
  }, []);

  const onLoadedData = () => {
    setVideoDataLoaded(true);
    window.dispatchEvent(new Event('resize'));

    /* used when re-sharing cameras after leaving a breakout room.
    it is needed in cases where the user has more than one active camera
    so we only share the second camera after the first
    has finished loading (can't share more than one at the same time) */

    // ts-ignore: Meteor global variable, mantained until all code is migrated to typescript
    Session.set('canConnect', true);
  };

  useEffect(() => {
    subscribeToStreamStateChange(cameraId, onStreamStateChange as EventListener);
    onVideoItemMount(videoTag.current);
    if (videoContainer.current !== null) {
      resizeObserver.observe(videoContainer.current);
    }

    if (videoTag.current !== null) {
      videoTag?.current?.addEventListener('loadeddata', onLoadedData);
    }

    return () => {
      videoTag?.current?.removeEventListener('loadeddata', onLoadedData);
      resizeObserver.disconnect();
    };
  }, []);

  // component will mount
  useEffect(() => {
    const playElement = (elem: HTMLVideoElement | null) => {
      if (!elem) return;
      if (elem.paused) {
        elem.play().catch((error: DOMException) => {
          // NotAllowedError equals autoplay issues, fire autoplay handling event
          if (error.name === 'NotAllowedError') {
            const tagFailedEvent = new CustomEvent('videoPlayFailed', { detail: { mediaElement: elem } });
            window.dispatchEvent(tagFailedEvent);
          }
        });
      }
    };
    if (!isSelfViewDisabled && videoDataLoaded) {
      playElement(videoTag.current);
    }
    if ((isSelfViewDisabled && userId === Auth.userID) || disabledCams?.includes(userId)) {
      if (videoTag?.current?.pause) {
        videoTag?.current?.pause();
      }
    }
  }, [isSelfViewDisabled, videoDataLoaded, disabledCams]);

  useEffect(() => {
    setIsSelfViewDisabled(settingsSelfViewDisable);
  }, [settingsSelfViewDisable]);

  const renderSqueezedButton = () => (
    <UserActionContainer
      userId={userId}
      pinned={pinned}
      cameraId={cameraId}
      isSelfViewDisabled={isSelfViewDisabled}
      focused={focused}
      isVideoSqueezed={isVideoSqueezed}
      isStream={isStream}
      videoContainer={videoContainer}
      onHandleMirror={() => setIsMirrored((value) => !value)}
      name={name}
      numOfStreams={numOfStreams}
      isModerator={isModerator}
    />
  );

  const renderWebcamConnecting = () => (
    <Styled.WebcamConnecting
      data-test="webcamConnecting"
      animations={animations}
    >
      <UserAvatarVideo
        presenter={presenter}
        clientType={clientType}
        name={name}
        color={color}
        avatar={avatar}
        isModerator={isModerator}
        emoji={emoji}
        unhealthyStream={videoDataLoaded && !isStreamHealthy}
        squeezed={isVideoSqueezed}
        talking={talking}
      />
      <Styled.BottomBar>
        <UserActionContainer
          userId={userId}
          pinned={pinned}
          cameraId={cameraId}
          isSelfViewDisabled={isSelfViewDisabled}
          focused={focused}
          isVideoSqueezed={isVideoSqueezed}
          isStream={isStream}
          videoContainer={videoContainer}
          onHandleMirror={() => setIsMirrored((value) => !value)}
          name={name}
          numOfStreams={numOfStreams}
          isModerator={isModerator}
        />
        <UserStatus
          listenOnly={listenOnly}
          muted={muted}
          joined={voiceUser}
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
        presenter={presenter}
        clientType={clientType}
        name={name}
        color={color}
        avatar={avatar}
        isModerator={isModerator}
        emoji={emoji}
        unhealthyStream={videoDataLoaded && !isStreamHealthy}
        squeezed={isVideoSqueezed}
        talking={talking}
      />
      {renderSqueezedButton()}
    </Styled.WebcamConnecting>
  );

  const renderDefaultButtons = () => (
    <>
      <Styled.TopBar>
        <PinAreaContainer
          pinned={pinned}
          userId={userId}
          isModerator={isModerator}
          isPinEnabled={PIN_WEBCAM}
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
        <UserActionContainer
          userId={userId}
          pinned={pinned}
          cameraId={cameraId}
          isSelfViewDisabled={isSelfViewDisabled}
          focused={focused}
          isVideoSqueezed={isVideoSqueezed}
          isStream={isStream}
          videoContainer={videoContainer}
          onHandleMirror={() => setIsMirrored((value) => !value)}
          name={name}
          numOfStreams={numOfStreams}
          isModerator={isModerator}
        />
        <UserStatus
          listenOnly={listenOnly}
          muted={muted}
          joined={voiceUser}
        />
      </Styled.BottomBar>
    </>
  );
  const eventsHandlers = makeDragOperations(userId);
  return (
    <Styled.Content
      ref={videoContainer}
      talking={talking}
      fullscreen={isFullscreenContext}
      data-test={talking ? 'webcamItemTalkingUser' : 'webcamItem'}
      animations={animations}
      isStream={isStream}
      dragging={dragging}
      draggingOver={draggingOver}
      onDragOver={eventsHandlers.onDragOver}
      onDragLeave={eventsHandlers.onDragLeave}
      onDrop={eventsHandlers.onDrop}
    >

      <Styled.VideoContainer
        $selfViewDisabled={(isSelfViewDisabled && userId === Auth.userID)
          || disabledCams.includes(cameraId)}
      >
        <Styled.Video
          mirrored={!!isMirrored}
          unhealthyStream={!!(videoDataLoaded && !isStreamHealthy)}
          data-test={isMirrored ? 'mirroredVideoContainer' : 'videoContainer'}
          ref={(ref) => { videoTag.current = ref; }}
          muted={muted}
          autoPlay
          playsInline
        />
      </Styled.VideoContainer>

      {isStream && ((isSelfViewDisabled && userId === Auth.userID)
        || disabledCams.includes(userId)) && (
          <Styled.VideoDisabled>
            {intl.formatMessage(intlMessages.disableDesc)}
          </Styled.VideoDisabled>
      )}

      {/* eslint-disable-next-line no-nested-ternary */}

      {(videoIsReady || (isSelfViewDisabled || disabledCams.includes(userId))) && (
        isVideoSqueezed ? renderSqueezedButton() : renderDefaultButtons()
      )}
      {!videoIsReady && (!isSelfViewDisabled || !isStream) && (
        isVideoSqueezed ? renderWebcamConnectingSqueezed() : renderWebcamConnecting()
      )}
      {((isSelfViewDisabled && userId === Auth.userID) || disabledCams.includes(userId))
        && renderWebcamConnecting()}
    </Styled.Content>
  );
};

const VideoListItemContainer: React.FC<VideoListItemContainerProps> = ({
  cameraId,
  onVideoItemMount,
  isStream,
  focused,
  name,
  makeDragOperations,
  userId,
  dragging,
  draggingOver,
  isSelfviewDisabled,
}) => {
  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const { element } = fullscreen;
  const isFullscreenContext = (element === cameraId);
  const {
    data: currentUser,
  } = useCurrentUser((user: Partial<User>) => ({
    pinned: user.pinned,
    userId: user.userId,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    color: user.color,
    emoji: user.emoji,
    presenter: user.presenter,
    clientType: user.clientType,
    isModerator: user.isModerator,
    voice: user.voice,
  }));

  const [disabledCams] = useSelfViewDisable();

  const streamsCounter = useSubscription<StreamsCounter>(STREAMS_COUNTER);
  const pinnedUser = useSubscription(PINNED_USER);

  if (streamsCounter.loading) return null;
  if (streamsCounter.error) {
    logger.info('Error in streamsCounter subscription', streamsCounter.error);
    return (<div>{JSON.stringify(streamsCounter.error)}</div>);
  }

  if (pinnedUser.loading) return null;
  if (pinnedUser.error) {
    logger.info('Error in pinnedUser subscription', pinnedUser.error);
    return (<div>{JSON.stringify(pinnedUser.error)}</div>);
  }

  assertionStreamsCounter(streamsCounter.data);
  if (
    streamsCounter.data
    && streamsCounter.data.user_camera_aggregate.aggregate.count === 0
  ) return null;

  return (
    <VideoListItem
      cameraId={cameraId}
      userId={userId}
      talking={currentUser?.voice?.talking ?? false}
      listenOnly={currentUser?.voice?.listenOnly ?? false}
      muted={currentUser?.voice?.muted ?? false}
      onVideoItemMount={onVideoItemMount}
      disabledCams={disabledCams ?? []}
      numOfStreams={streamsCounter?.data?.user_camera_aggregate.aggregate.count ?? 0}
      isStream={isStream}
      focused={focused}
      name={name}
      isModerator={currentUser?.isModerator ?? false}
      voiceUser={!!currentUser?.voice ?? false}
      presenter={currentUser?.presenter ?? false}
      clientType={currentUser?.clientType ?? ''}
      color={currentUser?.color ?? ''}
      avatar={currentUser?.avatar ?? ''}
      emoji={currentUser?.emoji ?? ''}
      isFullscreenContext={isFullscreenContext}
      makeDragOperations={makeDragOperations}
      PinnedUserId={pinnedUser?.data?.user[0]?.userId ?? ''}
      dragging={dragging}
      draggingOver={draggingOver}
      // @ts-ignore: Singleton with auto-generated Fields
      settingsSelfViewDisable={isSelfviewDisabled}
      isSelfviewDisabled={isSelfviewDisabled}
    />
  );
};

export default withDragAndDrop(VideoListItemContainer);
