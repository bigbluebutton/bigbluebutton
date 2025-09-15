import React, { useEffect, useRef, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  type LocalTrack,
  type RemoteTrack,
  type RemoteTrackPublication,
  type LocalTrackPublication,
  ConnectionState,
  RoomEvent,
  Track,
} from 'livekit-client';
import { useConnectionState, useTracks } from '@livekit/components-react';
import { debounce } from '/imports/utils/debounce';
import VideoService from '/imports/ui/components/video-provider/service';
import VideoListContainer from '/imports/ui/components/video-provider/video-list/container';
import logger from '/imports/startup/client/logger';
import { notifyStreamStateChange } from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import BBBVideoStream from '/imports/ui/services/webrtc-base/bbb-video-stream';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import { Output } from '/imports/ui/components/layout/layoutTypes';
import { VIDEO_TYPES } from '/imports/ui/components/video-provider/enums';
import {
  lkIsCameraSource,
  liveKitRoom,
} from '/imports/ui/services/livekit';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

const intlClientErrors = defineMessages({
  permissionError: {
    id: 'app.video.permissionError',
    description: 'Webcam permission error',
  },
  iceConnectionStateError: {
    id: 'app.video.iceConnectionStateError',
    description: 'Ice connection state failed',
  },
  virtualBgGenericError: {
    id: 'app.video.virtualBackground.genericError',
    description: 'Failed to apply camera effect',
  },
  inactiveError: {
    id: 'app.video.inactiveError',
    description: 'Camera stopped unexpectedly',
  },
});

const intlSFUErrors = defineMessages({
  2000: {
    id: 'app.sfu.mediaServerConnectionError2000',
    description: 'SFU connection to the media server',
  },
  2001: {
    id: 'app.sfu.mediaServerOffline2001',
    description: 'SFU is offline',
  },
});

interface LiveKitCameraBridgeProps {
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus: (id: string) => void;
  isGridEnabled: boolean;
  isClientConnected: boolean;
  isUserLocked: boolean;
  currentVideoPageIndex: number;
  streams: VideoItem[];
  playStart: (cameraId: string) => void;
  exitVideo: () => void;
  lockUser: () => void;
  stopVideo: (cameraId?: string) => void;
}

interface StreamRefs {
  connectingStreams: Record<string, boolean>;
  remoteTracks: Record<string, RemoteTrack<Track.Kind>>;
  localTracks: Record<string, LocalTrack<Track.Kind>>;
  localVideoStreams: Record<string, BBBVideoStream>;
  videoTags: Record<string, HTMLVideoElement>;
  publications: Map<string, RemoteTrackPublication | LocalTrackPublication>;
  subscriptions: Map<string, {
    track: RemoteTrack;
    publication: RemoteTrackPublication;
  }>;
}

const LiveKitCameraBridge: React.FC<LiveKitCameraBridgeProps> = ({
  cameraDock,
  focusedId,
  handleVideoFocus,
  isGridEnabled,
  isClientConnected,
  isUserLocked,
  currentVideoPageIndex,
  streams,
  playStart,
  exitVideo,
  lockUser,
  stopVideo,
}) => {
  const intl = useIntl();
  const connectionState = useConnectionState(liveKitRoom);
  const cameraTracks = useTracks([Track.Source.Camera], {
    room: liveKitRoom,
    onlySubscribed: false,
    updateOnlyOn: [
      RoomEvent.TrackPublished, RoomEvent.TrackUnpublished,
      RoomEvent.TrackSubscribed, RoomEvent.TrackUnsubscribed,
      RoomEvent.TrackSubscriptionStatusChanged, RoomEvent.TrackSubscriptionPermissionChanged,
      RoomEvent.TrackSubscriptionFailed,
    ],
  });
  const [meetingSettings] = useMeetingSettings();
  const streamRefs = useRef<StreamRefs>({
    remoteTracks: {},
    localTracks: {},
    connectingStreams: {},
    localVideoStreams: {},
    videoTags: {},
    publications: new Map(),
    subscriptions: new Map(),
  });
  const withSelectiveSubscription = meetingSettings.public.media?.livekit?.selectiveSubscription || false;

  const handleStreamFailure = useCallback((error: Error, stream: string, isLocal: boolean) => {
    const { name: errorName, message: errorMessage } = error;
    const errorLocale = intlClientErrors[errorName as keyof typeof intlClientErrors]
      || intlClientErrors[errorMessage as keyof typeof intlClientErrors]
      || intlSFUErrors[error as unknown as keyof typeof intlSFUErrors];

    logger.error({
      logCode: 'livekit_camera_failure',
      extraInfo: {
        cameraId: stream,
        role: VideoService.getRole(isLocal),
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    }, `LiveKit: camera failure ${errorName} - ${errorMessage}`);

    if (isLocal) {
      stopStream(stream, false);
      if (errorLocale) VideoService.notify(intl.formatMessage(errorLocale));
    } else {
      const stillExists = streams.some((item) => item.type === VIDEO_TYPES.STREAM && item.stream === stream);
      stopStream(stream, stillExists);
    }
  }, [intl, streams]);

  const handleLocalStreamInactive = useCallback((stream: string) => {
    const track = streamRefs.current.localTracks[stream];
    const isLocal = VideoService.isLocalStream(stream);

    if (track == null || !isLocal) return;

    handleStreamFailure(
      new Error('inactiveError'),
      stream,
      isLocal,
    );
  }, [handleStreamFailure]);

  const stopStream = useCallback((stream: string, restarting = false) => {
    const isLocal = VideoService.isLocalStream(stream);
    const role = VideoService.getRole(isLocal);

    logger.info({
      logCode: 'livekit_camera_feed_stop_requested',
      extraInfo: { role, cameraId: stream, restarting },
    }, `LiveKit: camera stop requested. Role ${role}, restarting ${restarting}`);

    if (isLocal) stopVideo(stream);
    destroyStream(stream);
  }, [stopVideo]);

  const unsubscribeFromRemotePub = (
    stream: string,
    publication: RemoteTrackPublication,
  ) => {
    const track = streamRefs.current.remoteTracks[stream];

    if (track) track.detach();
    if (publication?.isSubscribed && withSelectiveSubscription) {
      publication.setSubscribed(false);
    }
  };

  const destroyStream = (stream: string) => {
    const localStream = streamRefs.current.localVideoStreams[stream];
    const publication = streamRefs.current.publications.get(stream);
    const isLocal = VideoService.isLocalStream(stream);

    if (localStream) {
      if (typeof localStream.inactivationHandler === 'function') {
        localStream.removeListener('inactive', localStream.inactivationHandler);
      }

      localStream.stop();
    }

    if (isLocal) {
      const track = streamRefs.current.localTracks[stream];
      const { videoTrackPublications } = liveKitRoom.localParticipant;

      if (!videoTrackPublications || !track) return;

      videoTrackPublications.forEach((publication: LocalTrackPublication) => {
        if (lkIsCameraSource(publication) && publication.track && track.sid === publication.track.sid) {
          liveKitRoom.localParticipant.unpublishTrack(publication.track)
            .then(() => {
              logger.debug({
                logCode: 'livekit_camera_unpublished',
                extraInfo: {
                  cameraId: stream,
                  trackName: publication.trackName,
                  trackSid: publication?.trackSid,
                },
              }, `LiveKit: camera unpublished - ${publication.trackSid}`);
            })
            .catch((error) => {
              logger.error({
                logCode: 'livekit_camera_unpublish_error',
                extraInfo: {
                  cameraId: stream,
                  trackName: publication.trackName,
                  trackSid: publication.trackSid,
                  errorMessage: error.message,
                  errorStack: error.stack,
                },
              }, `LiveKit: failed to unpublish track: ${error.message}`);
            }).finally(() => {
              streamRefs.current.publications.delete(publication.trackName);
            });
        }
      });
      delete streamRefs.current.localTracks[stream];
      delete streamRefs.current.localVideoStreams[stream];
    } else if (publication) {
      unsubscribeFromRemotePub(stream, publication as RemoteTrackPublication);
    }
  };

  const attachLiveKitStream = (stream: string) => {
    const videoElement = streamRefs.current.videoTags[stream];
    const isLocal = VideoService.isLocalStream(stream);

    if (!videoElement) return;

    if (isLocal) {
      const localStream = streamRefs.current.localVideoStreams[stream];

      if (localStream) {
        videoElement.pause();
        videoElement.srcObject = localStream.mediaStream;
        videoElement.load();
        notifyStreamStateChange(stream, 'completed');
      }
    } else {
      const track = streamRefs.current.remoteTracks[stream];

      if (track?.attach) {
        track.attach(videoElement);
        notifyStreamStateChange(stream, 'completed');
      }
    }
  };

  const subscribeToRemotePub = (stream: string) => {
    const publication = streamRefs.current.publications.get(stream) as RemoteTrackPublication;

    // If a publication is not present yet, it will be added when we receive
    // the publish event from the server and this function will be called again
    if (publication) {
      if (publication.isSubscribed) {
        attachLiveKitStream(stream);
        notifyStreamStateChange(stream, 'completed');
        return;
      }

      if (withSelectiveSubscription) {
        publication.setSubscribed(true);
      }
    }
  };

  const startStream = useCallback(async (stream: string, isLocal: boolean) => {
    if (streamRefs.current.localTracks[stream] || streamRefs.current.connectingStreams[stream]) return;

    const LIVEKIT_SETTINGS = meetingSettings.public.media.livekit?.camera;
    const source = Track.Source.Camera;
    const defaultPubOptions = LIVEKIT_SETTINGS?.publishOptions || {
      dtx: true,
      videoCodec: 'vp8',
    };
    const publishOptions = {
      ...defaultPubOptions,
      source,
      name: stream,
    };

    if (!isLocal) {
      subscribeToRemotePub(stream);
      return;
    }

    streamRefs.current.connectingStreams[stream] = true;

    try {
      const localBBBStream = VideoService.getPreloadedStream();
      streamRefs.current.localVideoStreams[stream] = localBBBStream;
      const { mediaStream } = localBBBStream;
      const publishers: Promise<LocalTrackPublication>[] = mediaStream
        .getTracks()
        .map((track: MediaStreamTrack) => {
          return liveKitRoom.localParticipant.publishTrack(track, publishOptions).then((publication) => {
            if (!publication || !publication.track) {
              throw new Error('Failed to publish track: publication or track is missing');
            }

            logger.debug({
              logCode: 'livekit_camera_published',
              extraInfo: {
                cameraId: stream,
                trackName: publication?.trackName,
                trackSid: publication?.trackSid,
              },
            }, `LiveKit: camera published - ${publication?.trackSid}`);
            return publication;
          });
        });

      const trackPublications = await Promise.all(publishers);
      const [publication] = trackPublications;

      if (publication == null || publication?.track == null) {
        throw new Error('Failed to publish track: publication or track is missing');
      }

      streamRefs.current.localTracks[stream] = publication.track;
      localBBBStream.on('streamSwapped', ({ newStream }: { oldStream: MediaStream, newStream: MediaStream }) => {
        if (newStream) replaceVideoTracks(stream, newStream);
      });
      localBBBStream.inactivationHandler = () => handleLocalStreamInactive(stream);
      localBBBStream.once('inactive', localBBBStream.inactivationHandler);

      playStart(stream);
      attachLiveKitStream(stream);
      notifyStreamStateChange(stream, 'completed');
    } catch (error) {
      handleStreamFailure(error as Error, stream, isLocal);
    } finally {
      streamRefs.current.connectingStreams[stream] = false;
    }
  }, [handleLocalStreamInactive, handleStreamFailure, playStart]);

  const handleTrackSubscribed = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
  ) => {
    const { trackSid } = publication;

    if (!lkIsCameraSource(track)) return;

    streamRefs.current.subscriptions.set(trackSid, { track, publication });

    if (track?.kind === 'video' && publication) {
      const stream = publication.trackName;
      streamRefs.current.remoteTracks[stream] = track;
      attachLiveKitStream(stream);
      logger.debug({
        logCode: 'livekit_camera_subscribed',
        extraInfo: {
          cameraId: stream,
          trackName: publication.trackName,
          trackSid: publication.trackSid,
        },
      }, `LiveKit: camera subscribed - ${trackSid}`);
    }
  };

  const handleTrackUnsubscribed = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
  ) => {
    const { trackSid } = publication;

    if (!lkIsCameraSource(track)) return;

    streamRefs.current.subscriptions.delete(trackSid);
    const stream = publication?.trackName;

    logger.debug({
      logCode: 'livekit_camera_unsubscribed',
      extraInfo: {
        cameraId: stream,
        trackName: publication.trackName,
        trackSid: publication.trackSid,
      },
    }, `LiveKit: camera unsubscribed - ${trackSid}`);

    delete streamRefs.current.remoteTracks[stream];
  };

  const handleTrackPublished = useCallback((publication: RemoteTrackPublication) => {
    const { trackName } = publication;

    if (!lkIsCameraSource(publication) || streamRefs.current.publications.has(trackName)) return;

    streamRefs.current.publications.set(trackName, publication);
    if (publication.track) streamRefs.current.remoteTracks[trackName] = publication.track;

    const isLocal = VideoService.isLocalStream(trackName);
    // If the track is remote, should be subscribed to and is not already,
    // subscribe to it
    if (!isLocal
      && !publication.isSubscribed
      && streams.some((item) => item.type === VIDEO_TYPES.STREAM && item.stream === trackName)) {
      subscribeToRemotePub(trackName);
    }
  }, [streams]);

  const handleTrackUnpublished = (publication: RemoteTrackPublication) => {
    const { trackSid, trackName } = publication;

    if (!lkIsCameraSource(publication)) return;

    streamRefs.current.publications.delete(trackName);
    streamRefs.current.subscriptions.delete(trackSid);
  };

  useEffect(() => {
    liveKitRoom.on(RoomEvent.TrackPublished, handleTrackPublished);

    return () => {
      liveKitRoom.off(RoomEvent.TrackPublished, handleTrackPublished);
    };
  }, [handleTrackPublished]);

  useEffect(() => {
    window.addEventListener('beforeunload', exitVideo);
    liveKitRoom.on(RoomEvent.TrackUnpublished, handleTrackUnpublished);
    liveKitRoom.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    liveKitRoom.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
    liveKitRoom.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (lkIsCameraSource(publication)) {
          handleTrackPublished(publication);

          if (publication.isSubscribed && publication.track) {
            handleTrackSubscribed(publication.track, publication);
          }
        }
      });
    });

    return () => {
      liveKitRoom.off(RoomEvent.TrackUnpublished, handleTrackUnpublished);
      liveKitRoom.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      liveKitRoom.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      window.removeEventListener('beforeunload', exitVideo);
      VideoService.updatePeerDictionaryReference({});
      exitVideo();
      Object.keys(streamRefs.current.localTracks).forEach((stream) => {
        stopStream(stream, false);
      });
      Object.keys(streamRefs.current.remoteTracks).forEach((stream) => {
        stopStream(stream, false);
      });
      streamRefs.current.publications.clear();
      streamRefs.current.subscriptions.clear();
    };
  }, []);

  const connectStreams = useCallback((streamsToConnect: string[]) => {
    streamsToConnect.forEach((stream) => {
      const isLocal = VideoService.isLocalStream(stream);
      startStream(stream, isLocal);
    });
  }, [startStream]);

  const destroyStreams = (streamsToDisconnect: string[]) => {
    streamsToDisconnect.forEach(destroyStream);
  };

  const debouncedConnectStreams = useCallback(
    debounce(
      connectStreams,
      VideoService.getPageChangeDebounceTime(),
      { leading: false, trailing: true },
    ),
    [connectStreams],
  );

  const updateStreams = useCallback((streamsList: VideoItem[], shouldDebounce = false) => {
    const connectedStreamIds = [
      ...Object.keys(streamRefs.current.localTracks),
      ...Object.keys(streamRefs.current.remoteTracks),
    ];
    const [
      streamsToConnect,
      streamsToDisconnect,
    ] = VideoService.getStreamsToConnectAndDisconnect(streamsList, connectedStreamIds);

    if (shouldDebounce) {
      debouncedConnectStreams(streamsToConnect);
    } else {
      connectStreams(streamsToConnect);
    }

    destroyStreams(streamsToDisconnect);
  }, [connectStreams, debouncedConnectStreams]);

  const replaceVideoTracks = (streamId: string, mediaStream: MediaStream) => {
    const track = streamRefs.current.localTracks[streamId];
    const videoElement = streamRefs.current.videoTags[streamId];

    if (track && track.replaceTrack && videoElement) {
      const newTracks = mediaStream.getVideoTracks();
      track.replaceTrack(newTracks[0]).then(() => {
        attachLiveKitStream(streamId);
      }).catch((error) => {
        logger.error({
          logCode: 'livekit_camera_replace_track_error',
          extraInfo: {
            cameraId: streamId,
            trackSid: track?.sid,
            errorMessage: error.message,
            errorStack: error.stack,
          },
        }, `LiveKit: failed to replace camera track - ${error.message}`);
      });
    }
  };

  const createVideoTag = (stream: string, video: HTMLVideoElement) => {
    const isLocal = VideoService.isLocalStream(stream);
    const track = isLocal
      ? streamRefs.current.localTracks[stream]
      : streamRefs.current.remoteTracks[stream];

    streamRefs.current.videoTags[stream] = video;

    if (track) attachLiveKitStream(stream);
  };

  const destroyVideoTag = (stream: string) => {
    const videoElement = streamRefs.current.videoTags[stream];

    if (videoElement == null) return;

    if (typeof videoElement.pause === 'function') {
      videoElement.pause();
      videoElement.srcObject = null;
    }

    delete streamRefs.current.videoTags[stream];
  };

  const startVirtualBackgroundByDrop = useCallback(async (
    stream: string,
    backgroundType: string,
    name: string,
    data: string,
  ) => {
    try {
      const bbbVideoStream = streamRefs.current.localVideoStreams[stream];
      await VideoService.startVirtualBackground(bbbVideoStream, backgroundType, name, data);
    } catch (error) {
      const errorLocale = intlClientErrors.virtualBgGenericError;
      if (errorLocale) VideoService.notify(intl.formatMessage(errorLocale));
    }
  }, [intl]);

  useEffect(() => {
    const isLiveKitConnected = connectionState === ConnectionState.Connected;

    if (isClientConnected && isLiveKitConnected) {
      const shouldDebounce = VideoService.isPaginationEnabled()
        && currentVideoPageIndex !== undefined;
      updateStreams(streams, shouldDebounce);
    }
  }, [
    connectionState,
    isClientConnected,
    streams,
    currentVideoPageIndex,
    updateStreams,
    cameraTracks,
  ]);

  useEffect(() => {
    if (!isUserLocked) return;
    lockUser();
  }, [isUserLocked, lockUser]);

  return (
    <VideoListContainer
      streams={streams}
      currentVideoPageIndex={currentVideoPageIndex}
      cameraDock={cameraDock}
      focusedId={focusedId}
      handleVideoFocus={handleVideoFocus}
      isGridEnabled={isGridEnabled}
      onVideoItemMount={createVideoTag}
      onVideoItemUnmount={destroyVideoTag}
      onVirtualBgDrop={startVirtualBackgroundByDrop}
    />
  );
};

export default React.memo(LiveKitCameraBridge);
