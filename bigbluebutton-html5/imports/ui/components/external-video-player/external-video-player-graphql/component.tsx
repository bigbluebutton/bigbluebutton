/* eslint-disable no-param-reassign */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import ReactPlayer from 'react-player';
import { defineMessages, useIntl } from 'react-intl';
import audioManager from '/imports/ui/services/audio-manager';
import { useReactiveVar, useMutation } from '@apollo/client';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { ExternalVideoVolumeCommandsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/external-video/volume/enums';
import { SetExternalVideoVolumeCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/external-video/volume/types';
import { OnProgressProps } from 'react-player/base';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data/hooks/consts';
import { ExternalVideoVolumeUiDataNames } from 'bigbluebutton-html-plugin-sdk';
import { ExternalVideoVolumeUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data/domain/external-video/volume/types';

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
import { EXTERNAL_VIDEO_UPDATE, EXTERNAL_VIDEO_STOP } from '../mutations';
import { calculateCurrentTime } from '/imports/ui/components/external-video-player/service';

import PeerTube from '../custom-players/peertube';
import { ArcPlayer } from '../custom-players/arc-player';
import Panopto from '../custom-players/panopto';
import getStorageSingletonInstance from '/imports/ui/services/storage';

const AUTO_PLAY_BLOCK_DETECTION_TIMEOUT_SECONDS = 5;
const TWITCH_VIDEO_SEEK_TIME_WINDOW = 1; // Twitch video seek time in seconds
// react-player reports onProgress on this interval (its default; BBB does not override it).
// It is passed to the player explicitly (progressInterval below) so a future prop change
// cannot silently halve the detector's sensitivity.
const PROGRESS_INTERVAL_SECONDS = 1;
// Minimum divergence (seconds) between the expected playback position and the reported one
// for a tick to be treated as a seek that react-player did not surface via onSeek (which is
// every provider except FilePlayer, e.g. a YouTube scrub). A normal tick advances by about
// playerPlaybackRate seconds, so a jump larger than a couple of intervals is a seek.
// Sub-threshold scrubs (up to ~2s) are NOT broadcast, and nothing re-syncs the viewer
// position periodically (viewers only re-seek when updatedAt changes), so a missed scrub
// leaves viewers permanently offset by that amount and repeated small scrubs accumulate.
// The threshold is a deliberate trade: tiny drags do not yank viewers, at the cost of a
// standing offset that is only corrected by the next above-threshold seek.
const SEEK_DETECTION_THRESHOLD_SECONDS = 2 * PROGRESS_INTERVAL_SECONDS;
// After detecting a discontinuity, stash it and confirm on the next tick that the new
// position is a sustained playback point before broadcasting. A single-tick glitch (a
// YouTube ad boundary, where getCurrentTime returns the ad position near 0, or a buffering
// hiccup) reports a transient position that self-corrects, so demanding two consistent ticks
// filters it at the cost of ~1s of viewer-follow latency (viewers already lag by about that).
// This path is the only seek propagation for every provider except FilePlayer, so the
// insurance is worth it.
const SEEK_CONFIRMATION_THRESHOLD_SECONDS = SEEK_DETECTION_THRESHOLD_SECONDS;
// Minimum wall-clock gap between two broadcast seeks from the discontinuity detector. Cheap
// insurance against a provider whose getCurrentTime oscillates and would otherwise fan out a
// mutation (a DB write plus a recording event) to every participant every tick.
const MIN_SEEK_BROADCAST_INTERVAL_SECONDS = 2;
// When the browser blocks autoplay with sound, YouTube's embed does not surface the failure: it
// mutes itself and plays anyway. That mute happens inside the iframe, so the `muted` prop here
// stays false, and react-player only calls unmute() when that prop *changes* -- nothing ever
// undoes it. A viewer joining a session that already has a video shared therefore gets a silent
// video until they nudge the volume slider (changeVolume calls unMute) or remount the player with
// the reload button. Chrome gates unmuted autoplay on user activation OR the per-profile Media
// Engagement Index, so this is invisible on an established profile and reproduces in incognito.
// The existing autoplay warning (showUnsynchedMsg) cannot cover it: that triggers on
// `reactPlayerPlaying !== playing`, and muted playback IS playback, so it never fires.
// Recovery: on the first tick where the provider reports itself muted while the UI says it is
// not, unmute it -- immediately if the document already has user activation, and in any case on
// the viewer's next real gesture, which is the only moment the browser is guaranteed to honour an
// unmute rather than answering it by pausing the media. That is one automatic attempt plus one
// gesture-anchored attempt, so it can never ping-pong with the viewer-side auto-resume in
// handleOnStop, and no retry budget is needed.
// Both mouse/touch (pointerup) and keyboard (keydown) count as activation triggers, so a
// keyboard-only viewer is covered too.
const GESTURE_EVENTS_FOR_UNMUTE = ['pointerup', 'keydown'];

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
  closeExternalVideoLabel: {
    id: 'app.externalVideo.stopShareExternalVideo',
  },
});

interface AutoplayMuteRecovery {
  armed: boolean;
  releaseGestureListener: (() => void) | null;
}

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
  getServerCurrentTime(): number;
  updatedAt: string;
}

// @ts-ignore - PeerTubePlayer is not typed
Styled.VideoPlayer.addCustomPlayer(PeerTube);
// @ts-ignore - ArcPlayer is not typed
Styled.VideoPlayer.addCustomPlayer(ArcPlayer);
// @ts-ignore - Panopto is not typed
Styled.VideoPlayer.addCustomPlayer(Panopto);

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
  getServerCurrentTime,
  updatedAt,
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
        controls: true,
      },
      file: {
        attributes: {
          controls: 'controls',
          autoPlay: true,
          playsInline: true,
        },
      },
      facebook: {
        controls: true,
      },
      dailymotion: {
        params: {
          controls: true,
        },
      },
      youtube: {
        playerVars: {
          autoplay: 1,
          rel: 0,
          controls: 1,
          cc_lang_pref: document.getElementsByTagName('html')[0].lang.substring(0, 2),
        },
        embedOptions: {
          host: 'https://www.youtube-nocookie.com',
        },
      },
      peertube: {
        isPresenter: true,
      },
      twitch: {
        options: {
          controls: true,
        },
        playerId: 'externalVideoPlayerTwitch',
      },
      preload: true,
      showHoverToolBar: false,
    };
  }, []);

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
  const [reactPlayerPlaying, setReactPlayerPlaying] = React.useState(false);
  // Mirrors reactPlayerPlaying for synchronous reads inside callbacks (avoids a stale
  // closure): handleOnPlay must know whether this was a real resume or a YouTube re-play
  // after buffering on a seek.
  const reactPlayerPlayingRef = useRef(false);
  const firstPlayRef = useRef(true);
  const [playerUrl, setPlayerUrl] = React.useState('');
  const lastCursorRef = useRef<{ position: number, updateAt: number }>({ position: 0, updateAt: 0 });
  // Tracks the last onProgress tick (playedSeconds + wall-clock) so handleProgress
  // can detect a seek the player did not surface via onSeek (every provider except
  // FilePlayer, e.g. a YouTube scrub).
  const lastProgressRef = useRef<{ playedSeconds: number, at: number } | null>(null);
  // A detected discontinuity awaiting the two-tick confirmation (see
  // SEEK_CONFIRMATION_THRESHOLD_SECONDS). Reset wherever the baseline is reset.
  const pendingSeekRef = useRef<{ playedSeconds: number, at: number } | null>(null);
  // Wall-clock of the last seek broadcast by the discontinuity detector, for the rate limit.
  const lastSeekBroadcastAtRef = useRef(0);
  // Monotonic tick counter: getPlaybackRate can be async (Vimeo), so two handleProgress
  // invocations can be in flight; a stale tick must not emit or seed the baseline.
  const tickSeqRef = useRef(0);
  // Autoplay-mute recovery: armed until the provider's muted state has been reconciled once,
  // re-armed per player mount in handleOnStart (see GESTURE_EVENTS_FOR_UNMUTE).
  const autoplayMuteRecoveryRef = useRef<AutoplayMuteRecovery>({
    armed: true,
    releaseGestureListener: null,
  });
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);

  // Keep the synchronous mirror ref and the state in sync so the ref never drifts from
  // reactPlayerPlaying (the ref is read inside async callbacks to dodge a stale closure).
  const setPlayerPlaying = (value: boolean) => {
    reactPlayerPlayingRef.current = value;
    setReactPlayerPlaying(value);
  };

  let currentTime = getServerCurrentTime();

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    storage.setItem('externalVideoVolume', newVolume);
    if (newVolume > 0) {
      const internalPlayer = playerRef.current?.getInternalPlayer();
      internalPlayer?.unMute?.();
    }
  };
  // Work around for Twitch, because twitch doesn't have a no cookie domain
  // causing the video star in the wrong position between sessions
  const addTimeParamToTwitchUrl = (videoUrl: string, timeInSeconds: number) => {
    const convertSecondsToHHMMSS = (seconds: number) => {
      const totalSeconds = Math.floor(seconds);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      const ss = String(secs).padStart(2, '0');

      return `${hh}h${mm}m${ss}s`;
    };

    try {
      const url = new URL(videoUrl);
      const isTwitch = url.hostname === 'twitch.tv' || url.hostname === 'www.twitch.tv';
      if (isTwitch) {
        const formattedTime = convertSecondsToHHMMSS(timeInSeconds);
        url.searchParams.set('t', formattedTime);
        return url.toString();
      }

      return videoUrl;
    } catch (e) {
      // if the URL is invalid, return the original videoUrl
      return videoUrl;
    }
  };

  const stopVideo = useCallback((player: ReactPlayer) => {
    if (player) {
      const internalPlayer = player.getInternalPlayer();
      if (internalPlayer instanceof HTMLVideoElement) {
        internalPlayer.pause();
      } else if (internalPlayer instanceof HTMLAudioElement) {
        internalPlayer.pause();
      } else if (internalPlayer.pauseVideo) {
        internalPlayer.pauseVideo();
      } else if (internalPlayer.pause) {
        internalPlayer?.pause();
      }
    }
  }, []);

  const playVideo = useCallback((player: ReactPlayer) => {
    if (player) {
      const internalPlayer = player.getInternalPlayer();
      if (internalPlayer instanceof HTMLVideoElement) {
        internalPlayer.play();
      } else if (internalPlayer instanceof HTMLAudioElement) {
        internalPlayer.play();
      } else if (internalPlayer.playVideo) {
        internalPlayer.playVideo();
      } else if (internalPlayer.play) {
        internalPlayer.play();
      }
    }
  }, []);

  const getPlayerCurrentTime = useCallback(async (player: ReactPlayer) => {
    if (player) {
      const internalPlayer = player.getInternalPlayer();
      if (internalPlayer instanceof HTMLVideoElement) {
        return internalPlayer.currentTime;
      }

      if (internalPlayer instanceof HTMLAudioElement) {
        return internalPlayer.currentTime;
      }

      // Vimeo player returns a promise for getCurrentTime
      try {
        return (await internalPlayer?.getCurrentTime?.()) ?? 0;
      } catch (e) {
        // If the player is not ready yet, we return 0
        return 0;
      }
    }
    return 0;
  }, []);

  const getPlaybackRate = useCallback((player: ReactPlayer) => {
    if (player) {
      const internalPlayer = player.getInternalPlayer();
      if (internalPlayer instanceof HTMLVideoElement) {
        return internalPlayer.playbackRate;
      }

      if (internalPlayer instanceof HTMLAudioElement) {
        return internalPlayer.playbackRate;
      }

      return internalPlayer?.getPlaybackRate?.() ?? 1;
    }
    return 1;
  }, []);

  const getVolume = useCallback((player: ReactPlayer) => {
    if (player) {
      const internalPlayer = player.getInternalPlayer();
      if (internalPlayer instanceof HTMLVideoElement) {
        return internalPlayer.volume;
      }

      if (internalPlayer instanceof HTMLAudioElement) {
        return internalPlayer.volume;
      }

      if (internalPlayer?.getVolume) {
        return internalPlayer.getVolume();
      }
    }
    return 1;
  }, []);

  // Returns the muted flag the *provider* is actually honouring, or null when it does not report
  // one. Read from the provider rather than from the `mute` state on purpose: detecting where the
  // two have diverged is the whole point (see GESTURE_EVENTS_FOR_UNMUTE).
  const getInternalPlayerMuted = useCallback(async (player: ReactPlayer) => {
    const internalPlayer = player?.getInternalPlayer?.();
    if (!internalPlayer) return null;

    if (internalPlayer instanceof HTMLVideoElement || internalPlayer instanceof HTMLAudioElement) {
      return internalPlayer.muted;
    }

    try {
      // YouTube exposes isMuted(); Vimeo and Twitch expose getMuted() (Vimeo's returns a promise).
      if (typeof internalPlayer.isMuted === 'function') return await internalPlayer.isMuted();
      if (typeof internalPlayer.getMuted === 'function') return await internalPlayer.getMuted();
    } catch (e) {
      // Player not ready or torn down mid-call: treat as unknown.
      return null;
    }

    return null;
  }, []);

  const unmuteInternalPlayer = useCallback((player: ReactPlayer) => {
    const internalPlayer = player?.getInternalPlayer?.();
    if (!internalPlayer) return;

    try {
      if (internalPlayer instanceof HTMLVideoElement || internalPlayer instanceof HTMLAudioElement) {
        internalPlayer.muted = false;
      } else if (typeof internalPlayer.unMute === 'function') {
        internalPlayer.unMute(); // YouTube
      } else if (typeof internalPlayer.unmute === 'function') {
        internalPlayer.unmute(); // Facebook, Kaltura, Wistia
      } else if (typeof internalPlayer.setMuted === 'function') {
        internalPlayer.setMuted(false); // Vimeo, Twitch, DailyMotion
      }
    } catch (e) {
      // Player torn down mid-call. Nothing to retry here: by the time this runs the automatic
      // attempt is already spent, and the gesture listener is the remaining fallback.
    }
  }, []);

  useEffect(() => {
    if (playerUrl !== videoUrl && isPresenter) {
      setPlayerUrl(addTimeParamToTwitchUrl(videoUrl, getServerCurrentTime()));
    } else {
      setPlayerUrl(videoUrl);
    }
    // New video (or a player remount via playerKey rides the same reset path): clear the
    // progress baseline so a stale position from the previous video is not misread as a seek
    // on the first tick, drop any pending discontinuity, and reset the playing mirror so it
    // does not carry a stale "was playing" into the fresh player.
    lastProgressRef.current = null;
    pendingSeekRef.current = null;
    reactPlayerPlayingRef.current = false;
  }, [videoUrl, isPresenter]);

  useEffect(() => {
    const storedVolume = storage.getItem('externalVideoVolume');
    if (storedVolume) {
      const volumeValue = parseFloat(storedVolume as string);
      setVolume(volumeValue > 1 ? volumeValue / 100 : volumeValue);
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
  }, [playerRef.current, updatedAt]);

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
      const internalPlayer = playerRef.current?.getInternalPlayer ? playerRef.current?.getInternalPlayer() : null;
      if (internalPlayer && internalPlayer?.isMuted
        && typeof internalPlayer?.isMuted === 'function') {
        const isMuted = internalPlayer?.isMuted();
        setMute(isMuted);
      }

      if (internalPlayer && internalPlayer?.getVolume
        && typeof internalPlayer?.getVolume === 'function'
        && internalPlayer?.getVolume() !== currentVolume.current) {
        const playerVolume = internalPlayer?.getVolume();
        // the scale given by the player is 0 to 100, but the accepted scale is 0 to 1
        // So we need to divide by 100
        setVolume(playerVolume > 1 ? playerVolume / 100 : playerVolume);
      }

      // Reset the progress baseline on any presenter change. A stalled or autoplay-blocked
      // viewer promoted to presenter would otherwise broadcast a spurious seek from its
      // stale position on the first tick, yanking the whole meeting. A null baseline is the
      // safe state (the next tick re-seeds).
      lastProgressRef.current = null;
      pendingSeekRef.current = null;

      presenterRef.current = isPresenter;
    }
  }, [isPresenter]);

  // Unmute on the viewer's next gesture. Runs synchronously inside the event handler on purpose:
  // that is what makes the browser treat the unmute as user-initiated, so it cannot be answered
  // with a pause. Deliberately not re-checking the muted state first -- an await would leave the
  // handler, and unmuting something already unmuted is a no-op anyway.
  const armGestureUnmute = () => {
    const recovery = autoplayMuteRecoveryRef.current;
    recovery.releaseGestureListener?.();

    const handleGesture = () => {
      // Release through the captured object, not the ref: a player remount swaps the ref's
      // contents, and this listener must always be able to detach itself.
      recovery.releaseGestureListener?.();
      if (mute || isEchoTest || !playerRef.current) return;
      unmuteInternalPlayer(playerRef.current);
    };

    // Capture phase, so this still runs for gestures whose target stops propagation. Note a click
    // inside the provider's cross-origin iframe never reaches this window at all -- that is fine,
    // it activates the iframe itself, so the provider's own unmute control works there.
    GESTURE_EVENTS_FOR_UNMUTE.forEach((e) => window.addEventListener(e, handleGesture, true));
    recovery.releaseGestureListener = () => {
      GESTURE_EVENTS_FOR_UNMUTE.forEach((e) => window.removeEventListener(e, handleGesture, true));
      recovery.releaseGestureListener = null;
    };
  };

  // Undo a mute the provider applied to itself to get around a blocked autoplay
  // (see GESTURE_EVENTS_FOR_UNMUTE). Called on play and on every progress tick while armed, so a
  // provider that reports its muted state a beat after the play event is still caught.
  const recoverFromAutoplayMute = async () => {
    const recovery = autoplayMuteRecoveryRef.current;
    if (!recovery.armed || !playing || mute || isEchoTest) return;

    const player = playerRef.current;
    if (!player) return;

    // Disarm before the await, not after: onPlay and a progress tick can both be in flight, and
    // both would otherwise clear the guard above and run the recovery twice. Every path below
    // ends up disarmed anyway, so hoisting it costs nothing.
    recovery.armed = false;

    const internalMuted = await getInternalPlayerMuted(player);
    // Either autoplay with sound worked or this provider does not report a muted state. Leave it
    // alone rather than unmuting blindly: a viewer who mutes through the provider's own controls
    // must not be overridden a tick later.
    if (internalMuted !== true) return;

    // Sticky activation is enough for most browsers and avoids making the viewer click for their
    // audio. Where it is not, this unmute is refused (and may cost one pause that handleOnStop
    // resumes); the gesture listener below is what actually guarantees recovery.
    if (!navigator.userActivation || navigator.userActivation.hasBeenActive) {
      unmuteInternalPlayer(player);
    }
    armGestureUnmute();
  };

  useEffect(() => () => autoplayMuteRecoveryRef.current.releaseGestureListener?.(), []);

  const handleOnStart = async () => {
    // A start means a fresh player (new video, or a remount via playerKey), so the previous
    // player's autoplay-mute verdict must not carry over, and a gesture listener still waiting on
    // that player is stale. Done before the first await: react-player invokes onStart then onPlay
    // synchronously, and onPlay runs the recovery -- re-arming from this function's async tail
    // would undo that attempt's result.
    autoplayMuteRecoveryRef.current.releaseGestureListener?.();
    autoplayMuteRecoveryRef.current = { armed: true, releaseGestureListener: null };

    const currentTime = getServerCurrentTime();
    const playerCurrentTime = await getPlayerCurrentTime(playerRef.current as ReactPlayer);
    if (isPresenter && !playing) {
      const rate = (internalPlayer instanceof HTMLVideoElement || internalPlayer instanceof HTMLAudioElement)
        ? internalPlayer.playbackRate
        : await internalPlayer?.getPlaybackRate?.() ?? 1;

      sendMessage('start', {
        rate,
        time: currentTime,
        state: 'playing',
      });
    }

    if (currentTime > playerCurrentTime) {
      playerRef?.current?.seekTo(currentTime, 'seconds');
    }
    // Reset the progress baseline; the first onProgress tick after start seeds it. A start is
    // also the remount path (new player mounts), so reset the pending discontinuity and the
    // playing mirror too.
    lastProgressRef.current = null;
    pendingSeekRef.current = null;
    reactPlayerPlayingRef.current = false;
  };

  const handleOnPlay = async () => {
    const wasPlaying = reactPlayerPlayingRef.current;
    setPlayerPlaying(true);
    const internalPlayer = playerRef.current?.getInternalPlayer();
    const url = new URL(videoUrl);
    const isTwitch = url.hostname === 'twitch.tv' || url.hostname === 'www.twitch.tv';
    if (isPresenter && !playing) {
      const rate = (internalPlayer instanceof HTMLVideoElement || internalPlayer instanceof HTMLAudioElement)
        ? internalPlayer.playbackRate
        : await internalPlayer?.getPlaybackRate?.() ?? 1;

      const currentTime = getServerCurrentTime();

      const playerCurrentTime = await getPlayerCurrentTime(playerRef.current as ReactPlayer);
      const playerSeekTime = isTwitch
        && lastCursorRef.current.updateAt
        && Date.now() - lastCursorRef.current.updateAt < TWITCH_VIDEO_SEEK_TIME_WINDOW * 1000
        ? lastCursorRef.current.position
        : playerCurrentTime;
      sendMessage('play', {
        rate,
        // if currentTime is greater than playerCurrentTime, means the video was already played
        // and the presenter refreshed his client
        time: (currentTime > playerCurrentTime) && firstPlayRef.current ? currentTime : playerSeekTime,
        state: 'playing',
      });
    }
    if (!playing && !isPresenter) {
      stopVideo(playerRef.current as ReactPlayer);
    }

    if (firstPlayRef.current) {
      firstPlayRef.current = false;
    }
    // Reset the baseline only on a genuine paused->playing transition. react-player also
    // fires onPlay when YouTube re-enters PLAYING after buffering on a far seek; nulling
    // the baseline there would swallow the very discontinuity we need to detect (#25472).
    if (!wasPlaying) {
      lastProgressRef.current = null;
      pendingSeekRef.current = null;
    }

    // Playback just started: if the provider muted itself to get past a blocked autoplay, undo
    // it now rather than making the viewer discover the volume slider.
    recoverFromAutoplayMute();
  };

  const handleOnStop = async () => {
    setPlayerPlaying(false);
    if (isPresenter && playing) {
      const internalPlayer = playerRef.current?.getInternalPlayer();
      let rate = (internalPlayer instanceof HTMLVideoElement || internalPlayer instanceof HTMLAudioElement)
        ? internalPlayer.playbackRate
        : await internalPlayer?.getPlaybackRate?.() ?? 1;

      if (rate instanceof Promise) {
        rate = await rate;
      }

      const currentTime = await getPlayerCurrentTime(playerRef.current as ReactPlayer);
      sendMessage('stop', {
        rate,
        time: currentTime,
      });
    }

    if (!isPresenter && playing) {
      playVideo(playerRef.current as ReactPlayer);
    }
    // A pause resets the baseline so the following progress tick seeds fresh
    // instead of accumulating drift against the pre-pause position.
    lastProgressRef.current = null;
    pendingSeekRef.current = null;
  };

  const handleProgress = async (state: OnProgressProps) => {
    setPlayed(state.played);
    setLoaded(state.loaded);
    // Snapshot the baseline and wall-clock before the await below. getPlaybackRate can be
    // async (Vimeo), so an interleaved handleOnSeek could otherwise land between the read
    // and the write; capturing here keeps this tick consistent and lets the write below be
    // skipped when a fresher baseline was synced meanwhile.
    const now = Date.now();
    const baseline = lastProgressRef.current;
    // Claim a monotonic sequence for this tick. If a newer tick starts while we await the
    // (possibly async) rate read below, the newer one owns the cycle and this stale tick must
    // not emit a seek or seed the baseline. This closes the tick-vs-tick race, distinct from
    // the interleaved handleOnSeek case the identity guard on the baseline write covers.
    tickSeqRef.current += 1;
    const seq = tickSeqRef.current;
    if (playing && isPresenter) {
      currentTime = getServerCurrentTime();
    }
    const interPlayerPlaybackRate = await getPlaybackRate(playerRef.current as ReactPlayer);
    const isLatestTick = tickSeqRef.current === seq;

    if (isPresenter && isLatestTick) {
      // Emit at most one seek per tick. A real seek (position discontinuity) takes
      // precedence over a bare playback-rate change and carries the real local position
      // (state.playedSeconds) instead of the pre-seek, server-derived currentTime.
      let seekMessage: { rate: number; time: number; state: string } | null = null;

      // Detect a seek react-player did not surface via onSeek (every provider except
      // FilePlayer, e.g. a YouTube scrub). Extrapolate the expected position from the last
      // tick using the real playback rate, then use a SIGNED drift so the three cases stay
      // separate: a jump AHEAD of the extrapolation is a fast-forward seek; a move BACKWARD
      // past the last reported position is a backward seek; a playhead that advanced but by
      // less than wall-clock predicted (drift < -threshold, still moving forward) is a stall,
      // not a seek, and is left alone. This is why a backgrounded presenter tab does not yank
      // every viewer backward, and why a small backward scrub is no longer silently dropped.
      if (playing && baseline) {
        const elapsedSeconds = (now - baseline.at) / 1000;
        const expectedPosition = baseline.playedSeconds + (elapsedSeconds * interPlayerPlaybackRate);
        const drift = state.playedSeconds - expectedPosition;
        const jumpedAhead = drift > SEEK_DETECTION_THRESHOLD_SECONDS;
        const jumpedBack = state.playedSeconds < baseline.playedSeconds - SEEK_DETECTION_THRESHOLD_SECONDS;
        const discontinuity = jumpedAhead || jumpedBack;

        const pending = pendingSeekRef.current;
        if (pending) {
          // Two-tick confirmation: broadcast only when this tick continues playback from the
          // stashed discontinuity (it settled on a sustained position). A one-tick glitch
          // (a YouTube ad boundary reporting the ad position near 0, or buffering) does not
          // continue, so it is discarded here instead of yanking the whole meeting to 0:02
          // and writing that into the recording. Rate-limited as insurance against a provider
          // whose getCurrentTime oscillates.
          const pendingElapsed = (now - pending.at) / 1000;
          const expectedFromPending = pending.playedSeconds + (pendingElapsed * interPlayerPlaybackRate);
          const confirmed = Math.abs(state.playedSeconds - expectedFromPending) <= SEEK_CONFIRMATION_THRESHOLD_SECONDS;
          pendingSeekRef.current = null;
          if (confirmed
            && (now - lastSeekBroadcastAtRef.current) >= MIN_SEEK_BROADCAST_INTERVAL_SECONDS * 1000) {
            seekMessage = {
              rate: interPlayerPlaybackRate,
              time: state.playedSeconds,
              state: 'playing',
            };
            lastSeekBroadcastAtRef.current = now;
          } else if (discontinuity) {
            // Not the continuation we expected, but still discontinuous: re-arm on this new
            // position so a genuine seek that landed mid-glitch is not lost.
            pendingSeekRef.current = { playedSeconds: state.playedSeconds, at: now };
          }
        } else if (discontinuity) {
          pendingSeekRef.current = { playedSeconds: state.playedSeconds, at: now };
        }
      }

      if (!seekMessage && interPlayerPlaybackRate !== playerPlaybackRate) {
        seekMessage = {
          rate: interPlayerPlaybackRate,
          time: currentTime,
          state: playing ? 'playing' : '',
        };
      }

      if (seekMessage) {
        sendMessage('seek', seekMessage);
      }
    }

    // Seed the baseline for the next tick, but only if this is still the latest tick and no
    // interleaved handler advanced the baseline while we awaited the playback rate; otherwise
    // a stale tick would clobber a synced handleOnSeek baseline and cause a duplicate emit.
    if (isLatestTick && lastProgressRef.current === baseline) {
      lastProgressRef.current = { playedSeconds: state.playedSeconds, at: now };
    }

    const storedVolume = storage.getItem('externalVideoVolume');
    const playerVolume = getVolume(playerRef.current as ReactPlayer);
    // The value used to restore the volume is get from the browser storage
    // So update the state isn't necessary as it's not saved on component unmount
    if (storedVolume !== playerVolume) {
      storage.setItem('externalVideoVolume', playerVolume);
    }

    // Second chance for the autoplay mute: covers a provider that only reports its muted state a
    // beat after the play event. No-ops from the first reconciled tick onwards.
    recoverFromAutoplayMute();
  };

  const handleOnSeek = async (cursor: { position: number } | number) => {
    if (isPresenter) {
      const internalPlayer = playerRef.current?.getInternalPlayer();
      let rate = (internalPlayer instanceof HTMLVideoElement || internalPlayer instanceof HTMLAudioElement)
        ? internalPlayer.playbackRate
        : await internalPlayer?.getPlaybackRate?.() ?? 1;
      if (rate instanceof Promise) {
        rate = await rate;
      }

      sendMessage('seek', {
        rate,
        time: typeof cursor === 'number' ? cursor : cursor.position,
        state: playing ? 'playing' : '',
      });

      lastCursorRef.current = {
        position: typeof cursor === 'number' ? cursor : cursor.position,
        updateAt: Date.now(),
      };
      // Sync the progress baseline so the next handleProgress tick does not re-detect this
      // same seek as a discontinuity and emit a duplicate, and drop any pending discontinuity
      // this native seek supersedes.
      lastProgressRef.current = {
        playedSeconds: typeof cursor === 'number' ? cursor : cursor.position,
        at: Date.now(),
      };
      pendingSeekRef.current = null;
    } else {
      playVideo(playerRef.current as ReactPlayer);
    }
  };

  const handlePlaybackRateChange = async () => {
    if (isPresenter) {
      const internalPlayer = playerRef.current?.getInternalPlayer();
      let rate = (internalPlayer instanceof HTMLVideoElement || internalPlayer instanceof HTMLAudioElement)
        ? internalPlayer.playbackRate
        : internalPlayer?.getPlaybackRate?.() ?? 1;
      if (rate instanceof Promise) {
        rate = await rate;
      }
      sendMessage('playbackRateChange', {
        rate,
        time: getServerCurrentTime(),
        state: playing ? 'playing' : '',
      });
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

        {
          playerUrl ? (
            <Styled.VideoPlayer
              config={videoPlayConfig}
              autoPlay
              url={playerUrl}
              playing={playing}
              playbackRate={playerPlaybackRate}
              progressInterval={PROGRESS_INTERVAL_SECONDS * 1000}
              key={playerKey}
              height="100%"
              width="100%"
              ref={playerRef}
              volume={volume}
              onStart={handleOnStart}
              onPlay={handleOnPlay}
              onSeek={handleOnSeek}
              onProgress={handleProgress}
              onPause={handleOnStop}
              onEnded={handleOnStop}
              muted={mute || isEchoTest}
              controls
              previewTabIndex={isPresenter ? 0 : -1}
              onPlaybackRateChange={handlePlaybackRateChange}
            />
          ) : null
        }
        {
          shouldShowTools() ? (
            <ExternalVideoPlayerToolbar
              handleOnMuted={(m: boolean) => setMute(m)}
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
              showUnsynchedMsg={showUnsynchedMsg}
            />
          ) : null
        }
        {
          isPresenter ? (
            <Styled.ExternalVideoCloseButton
              color="primary"
              icon="close"
              size="sm"
              onClick={stopExternalVideoShare}
              data-test="stopExternalVideoShare"
              label={intl.formatMessage(intlMessages.closeExternalVideoLabel)}
              hideLabel
              className={Styled.ExternalVideoCloseButton}
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
    // clear lastMessageRef when video is changed
    if (lastMessageRef?.current?.event) {
      lastMessageRef.current.event = '';
      lastMessageRef.current.rate = 0;
      lastMessageRef.current.time = 0;
      lastMessageRef.current.state = undefined;
    }

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
  const hasExternalVideoOnLayout: boolean = layoutSelectInput((i: Input) => i.externalVideo?.hasExternalVideo);
  const cameraDock = layoutSelectInput((i: Input) => i.cameraDock);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { isOpen: isSidebarContentOpen } = sidebarContent;
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);
  const [key, setKey] = React.useState(uniqueId('react-player'));
  if (!currentUser || !currentMeeting?.externalVideo || !externalVideo?.display) return null;
  if (!hasExternalVideoOnLayout) return null;
  const isPresenter = currentUser.presenter ?? false;
  const isGridLayout = currentMeeting.layout?.currentLayoutType === 'VIDEO_FOCUS';
  const {
    updatedAt = new Date().toISOString(),
    playerPlaybackRate = 1,
    playerPlaying: playing = false,
    externalVideoUrl: videoUrl = '',
  } = currentMeeting.externalVideo;
  const getServerCurrentTime = () => calculateCurrentTime(timeSync, currentMeeting.externalVideo);

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
      getServerCurrentTime={getServerCurrentTime}
      playerKey={key}
      setPlayerKey={setKey}
      sendMessage={sendMessage}
      updatedAt={updatedAt}
    />
  );
};

export default ExternalVideoPlayerContainer;
