/* eslint-disable no-param-reassign */
import React, { useEffect, useMemo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { defineMessages, useIntl } from 'react-intl';
import audioManager from '/imports/ui/services/audio-manager';
import { useReactiveVar, useMutation } from '@apollo/client';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { ExternalVideoVolumeCommandsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/external-video/volume/enums';
import { SetExternalVideoVolumeCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/external-video/volume/types';
import { OnProgressProps } from 'react-player/base';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/consts';
import { ExternalVideoVolumeUiDataNames } from 'bigbluebutton-html-plugin-sdk';
import { ExternalVideoVolumeUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/external-video/volume/types';

import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  layoutDispatch,
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
} from '../../layout/context';
import Styled from './styles';
import {
  ExternalVideo,
  Input,
  Layout,
  Output,
} from '../../layout/layoutTypes';
import { uniqueId } from '/imports/utils/string-utils';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import ExternalVideoPlayerToolbar from './toolbar/component';
import deviceInfo from '/imports/utils/deviceInfo';
import { ACTIONS, PRESENTATION_AREA } from '../../layout/enums';
import { EXTERNAL_VIDEO_UPDATE } from '../mutations';
import { calculateCurrentTime } from '/imports/ui/components/external-video-player/service';

import PeerTube from '../custom-players/peertube';
import { ArcPlayer } from '../custom-players/arc-player';
import getStorageSingletonInstance from '/imports/ui/services/storage';

const AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS = 5;
const UPDATE_INTERVAL_THRESHOLD_MS = 500;

const intlMessages = defineMessages({
  autoPlayWarning: {
    id: 'app.externalVideo.autoPlayWarning',
    description: 'Shown when user needs to interact with player to make it work',
  },
  refreshLabel: {
    id: 'app.externalVideo.refreshLabel',
  },
  fullscreenLabel: {
    id: 'app.externalVideo.fullscreenLabel',
  },
  subtitlesOn: {
    id: 'app.externalVideo.subtitlesOn',
  },
  subtitlesOff: {
    id: 'app.externalVideo.subtitlesOff',
  },
});

interface ExternalVideoPlayerProps {
  currentVolume: React.MutableRefObject<number>;
  isMuted: React.MutableRefObject<boolean>;
  isEchoTest: boolean;
  isGridLayout: boolean;
  isPresenter: boolean;
  videoUrl: string;
  isResizing: boolean;
  fullscreenContext: boolean;
  externalVideo: ExternalVideo;
  playing: boolean;
  playerPlaybackRate: number;
  playerKey: string;
  isSidebarContentOpen: boolean;
  setPlayerKey: (key: string) => void;
  sendMessage: (event: string, data: {
    rate: number | Promise<number>;
    time: number;
    state?: string;
  }) => void;
  getCurrentTime(): number;
}

// @ts-ignore - PeerTubePlayer is not typed
Styled.VideoPlayer.addCustomPlayer(PeerTube);
// @ts-ignore - ArcPlayer is not typed
Styled.VideoPlayer.addCustomPlayer(ArcPlayer);

const truncateTime = (time: number) => (time < 1 ? 0 : time);

const ExternalVideoPlayer: React.FC<ExternalVideoPlayerProps> = ({
  isGridLayout,
  isSidebarContentOpen,
  currentVolume,
  isMuted,
  isResizing,
  externalVideo,
  fullscreenContext,
  videoUrl,
  isPresenter,
  playing,
  playerPlaybackRate,
  isEchoTest,
  playerKey,
  setPlayerKey,
  sendMessage,
  getCurrentTime,
}) => {
  const intl = useIntl();
  const storage = getStorageSingletonInstance();
  const {
    height,
    width,
    top,
    left,
    right,
  } = externalVideo;

  const hideVolume = useMemo(() => ({
    Vimeo: true,
    Facebook: true,
    ArcPlayer: true,
    // YouTube: true,
  }), []);

  const videoPlayConfig = useMemo(() => {
    return {
      // default option for all players, can be overwritten
      playerOptions: {
        autoPlay: true,
        playsInline: true,
        controls: isPresenter,
      },
      file: {
        attributes: {
          controls: isPresenter ? 'controls' : '',
          autoPlay: true,
          playsInline: true,
        },
      },
      facebook: {
        controls: isPresenter,
      },
      dailymotion: {
        params: {
          controls: isPresenter,
        },
      },
      youtube: {
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          autohide: 1,
          rel: 0,
          ecver: 2,
          controls: isPresenter ? 1 : 0,
          cc_lang_pref: document.getElementsByTagName('html')[0].lang.substring(0, 2),
        },
        embedOptions: {
          host: 'https://www.youtube-nocookie.com',
        },
      },
      peertube: {
        isPresenter,
      },
      twitch: {
        options: {
          controls: isPresenter,
        },
        playerId: 'externalVideoPlayerTwitch',
      },
      preload: true,
      showHoverToolBar: false,
    };
  }, [isPresenter]);

  const [showUnsynchedMsg, setShowUnsynchedMsg] = React.useState(false);
  const [showHoverToolBar, setShowHoverToolBar] = React.useState(false);
  const [mute, setMute] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [subtitlesOn, setSubtitlesOn] = React.useState(false);
  const [played, setPlayed] = React.useState(0);
  const [loaded, setLoaded] = React.useState(0);
  const playerRef = useRef<ReactPlayer>();
  const playerParentRef = useRef<HTMLDivElement| null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const presenterRef = useRef(isPresenter);
  const [duration, setDuration] = React.useState(0);
  const [reactPlayerPlaying, setReactPlayerPlaying] = React.useState(false);

  let currentTime = getCurrentTime();

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    storage.setItem('externalVideoVolume', newVolume);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  useEffect(() => {
    const storedVolume = storage.getItem('externalVideoVolume');
    if (storedVolume) {
      setVolume(storedVolume as number);
    }
  }, []);

  useEffect(() => {
    const unsynchedPlayer = reactPlayerPlaying !== playing;
    if (unsynchedPlayer && !!videoUrl) {
      timeoutRef.current = setTimeout(() => {
        setShowUnsynchedMsg(true);
      }, AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS * 1000);
    } else {
      setShowUnsynchedMsg(false);
      clearTimeout(timeoutRef.current);
    }
  }, [reactPlayerPlaying, playing]);

  useEffect(() => {
    const handleExternalVideoVolumeSet = ((
      event: CustomEvent<SetExternalVideoVolumeCommandArguments>,
    ) => changeVolume(event.detail.volume)) as EventListener;
    window.addEventListener(ExternalVideoVolumeCommandsEnum.SET, handleExternalVideoVolumeSet);
    return () => {
      window.addEventListener(ExternalVideoVolumeCommandsEnum.SET, handleExternalVideoVolumeSet);
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && !isPresenter) {
      playerRef.current.seekTo(truncateTime(currentTime), 'seconds');
    }
  }, [playerRef.current, playing]);

  // --- Plugin related code ---;
  const internalPlayer = playerRef.current?.getInternalPlayer ? playerRef.current?.getInternalPlayer() : null;
  if (internalPlayer && internalPlayer?.isMuted
    && typeof internalPlayer?.isMuted === 'function'
    && internalPlayer?.isMuted() !== isMuted.current) {
    isMuted.current = internalPlayer?.isMuted();
    window.dispatchEvent(new CustomEvent(ExternalVideoVolumeUiDataNames.IS_VOLUME_MUTED, {
      detail: {
        value: internalPlayer?.isMuted(),
      } as ExternalVideoVolumeUiDataPayloads[ExternalVideoVolumeUiDataNames.IS_VOLUME_MUTED],
    }));
  }
  if (internalPlayer && internalPlayer?.getVolume
    && typeof internalPlayer?.getVolume === 'function'
    && internalPlayer?.getVolume() !== currentVolume.current) {
    currentVolume.current = internalPlayer?.getVolume();
    window.dispatchEvent(new CustomEvent(ExternalVideoVolumeUiDataNames.CURRENT_VOLUME_VALUE, {
      detail: {
        value: internalPlayer?.getVolume() / 100,
      } as ExternalVideoVolumeUiDataPayloads[ExternalVideoVolumeUiDataNames.CURRENT_VOLUME_VALUE],
    }));
  }
  // --- End of plugin related code ---

  useEffect(() => {
    if (isPresenter !== presenterRef.current) {
      setPlayerKey(uniqueId('react-player'));
      presenterRef.current = isPresenter;
    }
  }, [isPresenter]);

  const handleOnStart = () => {
    currentTime = getCurrentTime();
    playerRef.current?.seekTo(truncateTime(currentTime), 'seconds');
  };

  const handleOnPlay = async () => {
    setReactPlayerPlaying(true);
    if (isPresenter && !playing) {
      const internalPlayer = playerRef.current?.getInternalPlayer();
      const rate = internalPlayer instanceof HTMLVideoElement
        ? internalPlayer.playbackRate
        : internalPlayer?.getPlaybackRate?.() ?? 1;

      const currentTime = played * duration;
      sendMessage('play', {
        rate,
        time: currentTime,
      });
    }

    if (!playing && !isPresenter) {
      playerRef.current?.getInternalPlayer().pauseVideo();
    }
  };

  const handleOnStop = async () => {
    setReactPlayerPlaying(false);
    if (isPresenter && playing) {
      const internalPlayer = playerRef.current?.getInternalPlayer();
      let rate = internalPlayer instanceof HTMLVideoElement
        ? internalPlayer.playbackRate
        : internalPlayer?.getPlaybackRate?.() ?? 1;

      if (rate instanceof Promise) {
        rate = await rate;
      }

      const currentTime = playerRef.current?.getCurrentTime() ?? 0;
      sendMessage('stop', {
        rate,
        time: currentTime,
      });
    }

    if (!isPresenter && playing) {
      playerRef.current?.getInternalPlayer().playVideo();
    }
  };

  const handleProgress = (state: OnProgressProps) => {
    setPlayed(state.played);
    setLoaded(state.loaded);

    if (playing && isPresenter) {
      currentTime = playerRef.current?.getCurrentTime() || 0;
    }
  };

  const handleOnSeek = async (seconds: number) => {
    if (isPresenter) {
      let rate = playerRef.current?.getInternalPlayer()?.getPlaybackRate() ?? 1;
      if (rate instanceof Promise) {
        rate = await rate;
      }

      sendMessage('seek', {
        rate,
        time: seconds,
      });
      playerRef.current?.seekTo(seconds, 'seconds');
    }
  };

  const isMinimized = width === 0 && height === 0;

  // @ts-ignore accessing lib private property
  const playerName = playerRef.current && playerRef.current.player
    // @ts-ignore accessing lib private property
    && playerRef.current.player.player && playerRef.current.player.player.constructor.name as string;
  let toolbarStyle = 'hoverToolbar';

  if (deviceInfo.isMobile && !showHoverToolBar) {
    toolbarStyle = 'dontShowMobileHoverToolbar';
  }

  if (deviceInfo.isMobile && showHoverToolBar) {
    toolbarStyle = 'showMobileHoverToolbar';
  }

  const shouldShowTools = () => {
    if (isPresenter || (!isPresenter && isGridLayout && !isSidebarContentOpen) || !videoUrl) {
      return false;
    }
    return true;
  };

  return (
    <Styled.Container
      style={{
        height,
        width,
        top,
        left,
        right,
        zIndex: externalVideo.zIndex,
      }}
      isResizing={isResizing}
      isMinimized={isMinimized}
    >
      <Styled.VideoPlayerWrapper
        fullscreen={fullscreenContext}
        ref={playerParentRef}
        data-test="videoPlayer"
      >

        {
          showUnsynchedMsg && shouldShowTools()
            ? (
              <Styled.AutoPlayWarning>
                {intl.formatMessage(intlMessages.autoPlayWarning)}
              </Styled.AutoPlayWarning>
            )
            : ''
        }
        <Styled.VideoPlayer
          config={videoPlayConfig}
          autoPlay
          playsInline
          url={videoUrl}
          playing={playing}
          playbackRate={playerPlaybackRate}
          key={playerKey}
          height="100%"
          width="100%"
          ref={playerRef}
          volume={volume}
          onStart={handleOnStart}
          onPlay={handleOnPlay}
          onSeek={handleOnSeek}
          onDuration={handleDuration}
          onProgress={handleProgress}
          onPause={handleOnStop}
          onEnded={handleOnStop}
          muted={mute || isEchoTest}
        />
        {
          shouldShowTools() ? (
            <ExternalVideoPlayerToolbar
              handleOnMuted={(m: boolean) => { setMute(m); }}
              handleReload={() => setPlayerKey(uniqueId('react-player'))}
              setShowHoverToolBar={setShowHoverToolBar}
              toolbarStyle={toolbarStyle}
              handleVolumeChanged={changeVolume}
              volume={volume}
              muted={mute || isEchoTest}
              mutedByEchoTest={isEchoTest}
              playing={playing}
              playerName={playerName}
              toggleSubtitle={() => setSubtitlesOn(!subtitlesOn)}
              playerParent={playerParentRef.current}
              played={played}
              loaded={loaded}
              subtitlesOn={subtitlesOn}
              hideVolume={hideVolume[playerName as keyof typeof hideVolume]}
            />
          ) : null
        }
      </Styled.VideoPlayerWrapper>
    </Styled.Container>
  );
};

const ExternalVideoPlayerContainer: React.FC = () => {
  /* eslint no-underscore-dangle: "off" */
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isEchoTest = useReactiveVar(audioManager._isEchoTest.value) as boolean;
  const { data: currentUser } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const { data: currentMeeting } = useMeeting((m) => ({
    externalVideo: m.externalVideo,
    layout: m.layout,
  }));
  const currentVolume = React.useRef(0);
  const isMuted = React.useRef(false);
  const hasExternalVideo = useRef(false);
  const lastMessageRef = useRef<{
    event: string;
    rate: number;
    time: number;
    state?: string;
  }>({ event: '', rate: 0, time: 0 });

  const [updateExternalVideo] = useMutation(EXTERNAL_VIDEO_UPDATE);

  const sendMessage = async (event: string, data: { rate: number | Promise<number>; time: number; state?: string }) => {
    const resolvedRate = data.rate instanceof Promise ? await data.rate : data.rate;

    // don't re-send repeated update messages
    if (
      lastMessageRef.current.event === event
      && Math.abs(lastMessageRef.current.time - data.time) < UPDATE_INTERVAL_THRESHOLD_MS
    ) {
      return;
    }

    // don't register to redis a viewer joined message
    if (event === 'viewerJoined') {
      return;
    }

    lastMessageRef.current = { ...data, event, rate: resolvedRate };

    // Use an integer for playing state
    // 0: stopped 1: playing
    // We might use more states in the future
    const state = data.state ? 1 : 0;

    updateExternalVideo({
      variables: {
        status: event,
        rate: resolvedRate,
        time: data.time,
        state,
      },
    });
  };

  useEffect(() => {
    if (!currentMeeting?.externalVideo?.externalVideoUrl && hasExternalVideo.current) {
      layoutContextDispatch({
        type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
        value: {
          content: PRESENTATION_AREA.EXTERNAL_VIDEO,
          open: false,
        },
      });
      hasExternalVideo.current = false;
    } else if (currentMeeting?.externalVideo?.externalVideoUrl && !hasExternalVideo.current) {
      layoutContextDispatch({
        type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
        value: {
          content: PRESENTATION_AREA.EXTERNAL_VIDEO,
          open: true,
        },
      });
      hasExternalVideo.current = true;
    }
  }, [currentMeeting?.externalVideo?.externalVideoUrl]);

  // --- Plugin related code ---
  useEffect(() => {
    // Define functions to first inform ui data hooks that subscribe to these events
    const updateUiDataHookCurrentVolumeForPlugin = () => {
      window.dispatchEvent(new CustomEvent(PluginSdk.ExternalVideoVolumeUiDataNames.CURRENT_VOLUME_VALUE, {
        detail: {
          value: currentVolume.current,
        } as ExternalVideoVolumeUiDataPayloads[PluginSdk.ExternalVideoVolumeUiDataNames.CURRENT_VOLUME_VALUE],
      }));
    };
    const updateUiDataHookIsMutedPlugin = () => {
      window.dispatchEvent(new CustomEvent(PluginSdk.ExternalVideoVolumeUiDataNames.IS_VOLUME_MUTED, {
        detail: {
          value: isMuted.current,
        } as ExternalVideoVolumeUiDataPayloads[PluginSdk.ExternalVideoVolumeUiDataNames.IS_VOLUME_MUTED],
      }));
    };

    // When component mount, add event listener to send first information
    // about these ui data hooks to plugin
    window.addEventListener(
      `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ExternalVideoVolumeUiDataNames.CURRENT_VOLUME_VALUE}`,
      updateUiDataHookCurrentVolumeForPlugin,
    );
    window.addEventListener(
      `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ExternalVideoVolumeUiDataNames.IS_VOLUME_MUTED}`,
      updateUiDataHookIsMutedPlugin,
    );

    // Before component unmount, remove event listeners for plugin ui data hooks
    return () => {
      window.removeEventListener(
        `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ExternalVideoVolumeUiDataNames.CURRENT_VOLUME_VALUE}`,
        updateUiDataHookCurrentVolumeForPlugin,
      );
      window.removeEventListener(
        `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ExternalVideoVolumeUiDataNames.IS_VOLUME_MUTED}`,
        updateUiDataHookIsMutedPlugin,
      );
    };
  }, []);
  // --- End of plugin related code ---

  const [timeSync] = useTimeSync();

  const fullscreenElementId = 'ExternalVideo';
  const externalVideo: ExternalVideo = layoutSelectOutput((i: Output) => i.externalVideo);
  const hasExternalVideoOnLayout: boolean = layoutSelectInput((i: Input) => i.externalVideo.hasExternalVideo);
  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { isOpen: isSidebarContentOpen } = sidebarContent;
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);
  const [key, setKey] = React.useState(uniqueId('react-player'));
  if (!currentUser || !currentMeeting?.externalVideo) return null;
  if (!hasExternalVideoOnLayout) return null;
  const playerPlaybackRate = currentMeeting.externalVideo?.playerPlaybackRate ?? 1;
  const isPresenter = currentUser.presenter ?? false;
  const isGridLayout = currentMeeting.layout?.currentLayoutType === 'VIDEO_FOCUS';
  const playing = currentMeeting.externalVideo?.playerPlaying ?? false;
  const videoUrl = currentMeeting.externalVideo?.externalVideoUrl ?? '';

  const getCurrentTime = () => calculateCurrentTime(timeSync, currentMeeting.externalVideo);

  return (
    <ExternalVideoPlayer
      isSidebarContentOpen={isSidebarContentOpen}
      isGridLayout={isGridLayout}
      currentVolume={currentVolume}
      isMuted={isMuted}
      isEchoTest={isEchoTest}
      isPresenter={isPresenter ?? false}
      videoUrl={videoUrl}
      playing={playing}
      playerPlaybackRate={playerPlaybackRate}
      isResizing={isResizing}
      fullscreenContext={fullscreenContext}
      externalVideo={externalVideo}
      getCurrentTime={getCurrentTime}
      playerKey={key}
      setPlayerKey={setKey}
      sendMessage={sendMessage}
    />
  );
};

export default ExternalVideoPlayerContainer;
