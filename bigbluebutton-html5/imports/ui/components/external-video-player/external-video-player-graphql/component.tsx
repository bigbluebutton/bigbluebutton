import React, { useEffect, useMemo, useRef } from 'react';
import ReactPlayer from 'react-player';
import { defineMessages, useIntl } from 'react-intl';
import audioManager from '/imports/ui/services/audio-manager';
import { Session } from 'meteor/session';
import { useReactiveVar, useMutation } from '@apollo/client';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { ExternalVideoVolumeCommandsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/external-video/volume/enums';
import { SetExternalVideoVolumeCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/external-video/volume/types';
import { OnProgressProps } from 'react-player/base';

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
import { ACTIONS } from '../../layout/enums';
import { EXTERNAL_VIDEO_UPDATE } from '../mutations';

import PeerTube from '../custom-players/peertube';
import { ArcPlayer } from '../custom-players/arc-player';

const AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS = 5;

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
  isEchoTest: boolean;
  isPresenter: boolean;
  videoUrl: string;
  isResizing: boolean;
  fullscreenContext: boolean;
  externalVideo: ExternalVideo;
  playing: boolean;
  playerPlaybackRate: number;
  currentTime: number;
  layoutContextDispatch: ReturnType<typeof layoutDispatch>;
  key: string;
  setKey: (key: string) => void;
}

// @ts-ignore - PeerTubePlayer is not typed
Styled.VideoPlayer.addCustomPlayer(PeerTube);
// @ts-ignore - ArcPlayer is not typed
Styled.VideoPlayer.addCustomPlayer(ArcPlayer);

const ExternalVideoPlayer: React.FC<ExternalVideoPlayerProps> = ({
  isResizing,
  externalVideo,
  fullscreenContext,
  videoUrl,
  isPresenter,
  playing,
  playerPlaybackRate,
  currentTime,
  isEchoTest,
  layoutContextDispatch,
  key,
  setKey,
}) => {
  const intl = useIntl();

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
        autoplay: true,
        playsinline: true,
        controls: isPresenter,
      },
      file: {
        attributes: {
          controls: isPresenter ? 'controls' : '',
          autoplay: 'autoplay',
          playsinline: 'playsinline',
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

  const [autoPlayBlocked, setAutoPlayBlocked] = React.useState(false);
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

  const [updateExternalVideo] = useMutation(EXTERNAL_VIDEO_UPDATE);

  let lastMessage: {
    event: string;
    rate: number;
    time: number;
    state?: string;
  } = { event: '', rate: 0, time: 0 };

  const sendMessage = (event: string, data: { rate: number; time: number; state?: string}) => {
    // don't re-send repeated update messages
    if (
      lastMessage.event === event
      && lastMessage.time === data.time
    ) {
      return;
    }

    // don't register to redis a viewer joined message
    if (event === 'viewerJoined') {
      return;
    }

    lastMessage = { ...data, event };

    // Use an integer for playing state
    // 0: stopped 1: playing
    // We might use more states in the future
    const state = data.state ? 1 : 0;

    updateExternalVideo({
      variables: {
        status: event,
        rate: data?.rate,
        time: data?.time,
        state,
      },
    });
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setAutoPlayBlocked(true);
    }, AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS * 1000);

    layoutContextDispatch({
      type: ACTIONS.SET_HAS_EXTERNAL_VIDEO,
      value: true,
    });

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_IS_OPEN,
      value: true,
    });

    const handleExternalVideoVolumeSet = ((
      event: CustomEvent<SetExternalVideoVolumeCommandArguments>,
    ) => setVolume(event.detail.volume)) as EventListener;
    window.addEventListener(ExternalVideoVolumeCommandsEnum.SET, handleExternalVideoVolumeSet);
    return () => {
      window.addEventListener(ExternalVideoVolumeCommandsEnum.SET, handleExternalVideoVolumeSet);
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && !isPresenter) {
      playerRef.current.seekTo(currentTime, 'seconds');
    }
  }, [currentTime]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(currentTime, 'seconds');
    }
  }, [playerRef.current]);

  useEffect(() => {
    if (isPresenter !== presenterRef.current) {
      setKey(uniqueId('react-player'));
      presenterRef.current = isPresenter;
    }
  }, [isPresenter]);

  const handleOnPlay = () => {
    setAutoPlayBlocked(false);
    clearTimeout(timeoutRef.current);
    if (isPresenter) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const rate = playerRef.current?.getInternalPlayer()?.getPlaybackRate() as number ?? 1;
      const currentTime = playerRef.current?.getCurrentTime() ?? 0;
      sendMessage('play', {
        rate,
        time: currentTime,
      });
    } else if (!playing && !isPresenter) {
      playerRef.current?.getInternalPlayer().pauseVideo();
    }
  };

  const handleOnPause = () => {
    if (isPresenter) {
      const rate = playerRef.current?.getInternalPlayer()?.getPlaybackRate() as number ?? 1;
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

  return (
    <Styled.Container
      style={{
        height,
        width,
        top,
        left,
        right,
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
          autoPlayBlocked
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
          key={key}
          height="100%"
          width="100%"
          ref={playerRef}
          volume={volume}
          onPlay={handleOnPlay}
          onProgress={(state: OnProgressProps) => {
            setPlayed(state.played);
            setLoaded(state.loaded);
          }}
          onPause={handleOnPause}
          muted={mute}
        />
        {
          !isPresenter ? (
            <ExternalVideoPlayerToolbar
              handleOnMuted={(m: boolean) => { setMute(m); }}
              handleReload={() => setKey(uniqueId('react-player'))}
              setShowHoverToolBar={setShowHoverToolBar}
              toolbarStyle={toolbarStyle}
              handleVolumeChanged={setVolume}
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
  const theresNoExternalVideo = useRef(true);
  const { data: currentUser } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));

  const { data: currentMeeting } = useMeeting((m) => ({
    externalVideo: m.externalVideo,
  }));

  useEffect(() => {
    if (!currentMeeting?.externalVideo?.externalVideoUrl && !theresNoExternalVideo.current) {
      layoutContextDispatch({
        type: ACTIONS.SET_HAS_EXTERNAL_VIDEO,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: Session.get('presentationLastState'),
      });
    } else if (currentMeeting?.externalVideo?.externalVideoUrl) {
      layoutContextDispatch({
        type: ACTIONS.SET_HAS_EXTERNAL_VIDEO,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: true,
      });
      theresNoExternalVideo.current = false;
    }
  }, [currentMeeting]);

  const [timeSync] = useTimeSync();

  const fullscreenElementId = 'ExternalVideo';
  const externalVideo: ExternalVideo = layoutSelectOutput((i: Output) => i.externalVideo);
  const hasExternalVideoOnLayout: boolean = layoutSelectInput((i: Input) => i.externalVideo.hasExternalVideo);
  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);
  const [key, setKey] = React.useState(uniqueId('react-player'));
  if (!currentUser || !currentMeeting) return null;
  if (!hasExternalVideoOnLayout) return null;
  const playerCurrentTime = currentMeeting.externalVideo?.playerCurrentTime ?? 0;
  const playerPlaybackRate = currentMeeting.externalVideo?.playerPlaybackRate ?? 1;
  const playerUpdatedAt = currentMeeting.externalVideo?.updatedAt ?? Date.now();
  const playerUpdatedAtDate = new Date(playerUpdatedAt);
  const currentDate = new Date(Date.now() + timeSync);
  const currentTime = (((currentDate.getTime() - playerUpdatedAtDate.getTime()) / 1000)
  + playerCurrentTime) * playerPlaybackRate;

  return (
    <ExternalVideoPlayer
      isEchoTest={isEchoTest}
      isPresenter={currentUser.presenter ?? false}
      videoUrl={currentMeeting.externalVideo?.externalVideoUrl ?? ''}
      playing={currentMeeting.externalVideo?.playerPlaying ?? false}
      playerPlaybackRate={currentMeeting.externalVideo?.playerPlaybackRate ?? 1}
      isResizing={isResizing}
      layoutContextDispatch={layoutContextDispatch}
      fullscreenContext={fullscreenContext}
      externalVideo={externalVideo}
      currentTime={currentTime}
      key={key}
      setKey={setKey}
    />
  );
};

export default ExternalVideoPlayerContainer;
