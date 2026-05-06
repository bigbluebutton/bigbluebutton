import { VideoPreset, type TrackPublishOptions } from 'livekit-client';
import logger from '/imports/startup/client/logger';
import { type CameraProfile, type LiveKitPresetConfig } from '/imports/ui/Types/meetingClientSettings';
import VideoService from '/imports/ui/components/video-provider/service';
import {
  assemblePresetFromConfig,
  deduplicatePresets,
  type PresetDefaults,
} from '/imports/ui/services/livekit/presets';

const DEFAULT_CAM_WIDTH = 640;
const DEFAULT_CAM_HEIGHT = 480;
const DEFAULT_CAM_FPS = 15;
const DEFAULT_CAM_BITRATE = 500_000;
const MAX_SIMULCAST_LAYERS = 3;

interface CaptureSettings {
  width: number;
  height: number;
  frameRate: number | undefined;
}

const getCameraCaptureSettings = (stream: MediaStream): CaptureSettings => {
  const profile = VideoService.getCameraProfile();
  const profileWidth = profile?.constraints?.width ?? DEFAULT_CAM_WIDTH;
  const profileHeight = profile?.constraints?.height ?? DEFAULT_CAM_HEIGHT;
  const profileFps = profile?.constraints?.frameRate ?? DEFAULT_CAM_FPS;

  try {
    const track = stream.getVideoTracks()[0];

    if (!track) {
      return { width: profileWidth, height: profileHeight, frameRate: profileFps };
    }

    const settings = track.getSettings();

    return {
      width: settings.width ?? profileWidth,
      height: settings.height ?? profileHeight,
      frameRate: settings.frameRate ?? profileFps,
    };
  } catch {
    return { width: profileWidth, height: profileHeight, frameRate: profileFps };
  }
};

const getVisibleProfiles = (): CameraProfile[] => {
  // @ts-ignore
  const profiles = window.meetingClientSettings.public.kurento?.cameraProfiles ?? [];

  return profiles.filter((p: CameraProfile) => !p.hidden);
};

// Maps a BBB CameraProfile to a VideoPreset (LiveKit's encoding descriptor).
//
// There are two paths here:
// 1. Profile HAS explicit constraints (width/height) → use them directly.
//    Example: "high" profile with { width: 1280, height: 720, frameRate: 15 }
//    => VideoPreset(1280, 720, 500000, 15)
// 2. Profile has NO constraints (e.g., "low", "medium") → derive resolution
//    proportionally from the *capture* (MediaStream) dimensions and the bitrate
//    ratio to the top (selected) profile. Bitrate scales *roughly* (because we're
//    ignoring FPS, see comment below) with pixel count (area), so:
//      bitrate_ratio = profile.bitrate / topProfile.bitrate
//      area_ratio ≈ bitrate_ratio
//      dimension_scale = sqrt(area_ratio)  (area = scale² × original_area)
//    Example: top=500kbps at 1280x720, medium=200kbps
//      scale = sqrt(200/500) = sqrt(0.4) ≈ 0.632
//      width = round(1280 × 0.632) = 810, height = round(720 × 0.632) = 456
//    Dimensions are clamped to even numbers to avoid borking encoders.
//
// FPS is only set when the profile explicitly defines it via
// constraints.frameRate. If unset, it'll trickle down as undefined for the browser
// to decide how to best manage encoding. This is the same thing we do with
// bbb-webrtc-sfu/mediasoup.
const profileToPreset = (
  profile: CameraProfile,
  captureWidth: number,
  captureHeight: number,
  topBitrate: number,
): VideoPreset => {
  const bitrate = profile?.bitrate || 0;
  const bitrateInBps = bitrate * 1000 || DEFAULT_CAM_BITRATE;
  const fps = profile.constraints?.frameRate;

  // We have constraints with the required fields, map directly
  if (profile.constraints?.width && profile.constraints?.height) {
    return new VideoPreset(
      profile.constraints.width,
      profile.constraints.height,
      bitrateInBps,
      fps,
      'medium',
    );
  }

  if (!bitrate || bitrate <= 0 || !topBitrate || topBitrate <= 0) {
    logger.warn({
      logCode: 'livekit_camera_profile_misconfigured',
      extraInfo: {
        profileId: profile?.id,
        profileBitrate: profile?.bitrate,
        topBitrate,
      },
    }, `LiveKit: camera profile "${profile?.id}" has invalid bitrate (${profile?.bitrate}), using defaults`);

    return new VideoPreset(captureWidth, captureHeight, bitrateInBps, fps, 'medium');
  }

  // Incomplete or undefined constraints: derive resolution from bitrate ratio
  const scale = Math.sqrt(profile.bitrate / topBitrate);
  const w = Math.max(2, Math.round(captureWidth * scale));
  const h = Math.max(2, Math.round(captureHeight * scale));

  return new VideoPreset(
    w - (w % 2), // even width
    h - (h % 2), // even height
    bitrateInBps,
    fps,
    'medium',
  );
};

const getDefaultCameraPresets = (stream: MediaStream): VideoPreset[] => {
  const { width, height, frameRate } = getCameraCaptureSettings(stream);

  return [new VideoPreset(width, height, DEFAULT_CAM_BITRATE, frameRate ?? DEFAULT_CAM_FPS, 'medium')];
};

// Derives simulcast presets from camera quality profiles.
//
// The selected profile is the TOP (highest quality) layer. The user's
// choice represents their intended max quality — we never publish above
// it. Lower visible profiles become lower simulcast layers, giving the
// SFU/adaptive streaming room to downgrade for constrained subscribers.
//
// Layer selection (given visible profiles sorted low→high):
//   selected = "high" (index 2): layers = [low, medium, high] (3 layers)
//   selected = "medium" (index 1): layers = [low, medium]     (2 layers)
//   selected = "low" (index 0): layers = [low]                (1 layer, no simulcast)
//   selected = hidden profile:   layers = [selected]           (1 layer — don't
//     fight the system's choice)
//
// Each profile is mapped to a VideoPreset via profileToPreset, then
// deduplicated (identical resolution + effective FPS + bitrate collapsed).
const getProfileBasedPresets = (stream: MediaStream): VideoPreset[] => {
  const visibleProfiles = getVisibleProfiles();
  const selectedProfile = VideoService.getCameraProfile();

  if (!selectedProfile || visibleProfiles.length === 0) {
    return getDefaultCameraPresets(stream);
  }

  const selectedIndex = visibleProfiles.findIndex((p) => p.id === selectedProfile.id);

  // Hidden profile (e.g., threshold system selected "low-u12") — single
  // layer. Honor it indefinitely for now (single layer), but we'll need to
  // adjust it further later when quality thresholds are fully supported by the LK bridge - prlanzarin
  if (selectedIndex < 0) {
    const { width, height } = getCameraCaptureSettings(stream);

    return [profileToPreset(selectedProfile, width, height, selectedProfile.bitrate)];
  }

  const start = Math.max(0, selectedIndex - (MAX_SIMULCAST_LAYERS - 1));
  const layerProfiles = visibleProfiles.slice(start, selectedIndex + 1);
  const { width, height, frameRate } = getCameraCaptureSettings(stream);
  const topBitrate = selectedProfile.bitrate;
  const presets = layerProfiles.map(
    (p) => profileToPreset(p, width, height, topBitrate),
  );

  return deduplicatePresets(presets, frameRate);
};

// Override mode: when livekit.camera.presets is explicitly configured,
// bypasses profile-based mapping entirely. Admins use this for direct
// control over simulcast layers (same pattern as screenshare presets).
//
// Partially-specified presets are filled via linear interpolation between the
// auto-generated profile-based defaults.
//
// Interpolated fields:
// - maxBitrate (linear between first/last defaults).
// - FPS: interpolated only when both endpoints have defined FPS. When both
//  are undefined (common for camera profiles without constraints), FPS
//  remains undefined — the browser decides. When only one endpoint has
//  FPS, that value is used for all positions.
// - Resolution defaults to the top profile's resolution for all positions
//
// Config values always win over interpolated defaults when present.
const resolveExplicitPresets = (
  configPresets: LiveKitPresetConfig[],
  stream: MediaStream,
): VideoPreset[] => {
  const defaults = getProfileBasedPresets(stream);
  const first = defaults[0];
  const last = defaults[defaults.length - 1];
  const firstFps = first.encoding.maxFramerate;
  const lastFps = last.encoding.maxFramerate;

  // Interpolate FPS only when both endpoints are defined. Otherwise use
  // whichever is defined, or undefined if neither is (browser decides).
  const interpolateFps = (t: number): number | undefined => {
    if (firstFps != null && lastFps != null) {
      return Math.round(firstFps + t * (lastFps - firstFps));
    }

    return firstFps ?? lastFps;
  };

  const resolved = configPresets.map((config, index) => {
    const t = configPresets.length > 1 ? index / (configPresets.length - 1) : 1;
    const positionalDefaults: PresetDefaults = {
      width: last.width,
      height: last.height,
      maxBitrate: Math.round(
        first.encoding.maxBitrate + t * (last.encoding.maxBitrate - first.encoding.maxBitrate),
      ),
      maxFramerate: interpolateFps(t),
      priority: 'medium',
    };

    return assemblePresetFromConfig(config, positionalDefaults);
  });

  const { frameRate } = getCameraCaptureSettings(stream);

  return deduplicatePresets(resolved, frameRate);
};

// eslint-disable-next-line import/prefer-default-export
export const getCameraPublishOptions = (
  stream: MediaStream,
): Partial<TrackPublishOptions> => {
  // @ts-ignore
  const configPresets = window.meetingClientSettings.public.media?.livekit?.camera?.presets;

  const presets = configPresets?.length
    ? resolveExplicitPresets(configPresets, stream)
    : getProfileBasedPresets(stream);

  const layers = presets.length > 1 ? presets.slice(0, -1) : [];
  const topEncoding = presets[presets.length - 1]?.encoding;

  logger.debug({
    logCode: 'livekit_camera_presets',
    extraInfo: {
      selectedProfile: VideoService.getCameraProfile()?.id,
      presetCount: presets.length,
      simulcastLayerCount: layers.length,
      presets: presets.map((p) => ({
        width: p.width,
        height: p.height,
        maxBitrate: p.encoding.maxBitrate,
        maxFramerate: p.encoding.maxFramerate,
      })),
    },
  }, `LiveKit: resolved camera presets (p=${presets.length}, l=${layers.length})`);

  return {
    simulcast: presets.length > 1,
    videoEncoding: topEncoding,
    videoSimulcastLayers: layers.length > 0 ? layers : undefined,
  };
};
