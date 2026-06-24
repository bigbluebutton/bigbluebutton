import { VideoPreset } from 'livekit-client';
import logger from '/imports/startup/client/logger';
import { LiveKitPresetConfig } from '/imports/ui/Types/meetingClientSettings';

export interface PresetDefaults {
  width: number;
  height: number;
  maxBitrate: number;
  maxFramerate?: number;
  priority: RTCPriorityType;
}

export const assemblePresetFromConfig = (
  config: LiveKitPresetConfig,
  defaults: PresetDefaults,
): VideoPreset => {
  const width = config.width ?? defaults.width;
  const height = config.height ?? defaults.height;
  const maxBitrate = config.maxBitrate ?? defaults.maxBitrate;
  const maxFramerate = config.maxFramerate ?? defaults.maxFramerate;
  const priority = config.priority ?? defaults.priority;

  if (!maxBitrate || maxBitrate <= 0) {
    logger.warn({
      logCode: 'livekit_preset_invalid_bitrate',
      extraInfo: {
        configBitrate: config.maxBitrate,
        defaultBitrate: defaults.maxBitrate,
        width,
        height,
      },
    }, `LiveKit: preset has invalid maxBitrate (${config.maxBitrate}), using default (${defaults.maxBitrate})`);

    return new VideoPreset(width, height, defaults.maxBitrate, maxFramerate, priority);
  }

  return new VideoPreset(width, height, maxBitrate, maxFramerate, priority);
};

// Removes presets that are identical across all three encoding dimensions:
// resolution, effective FPS (capped to capture rate), AND bitrate.
// Different bitrates at the same FPS/resolution are preserved — the encoder
// produces meaningfully different output and the SFU can select between
// them for bandwidth adaptation.
export const deduplicatePresets = (
  presets: VideoPreset[],
  captureFrameRate: number | undefined,
): VideoPreset[] => {
  if (captureFrameRate == null || presets.length <= 1) return presets;

  const effectiveFps = (preset: VideoPreset): number => Math.min(
    preset.encoding.maxFramerate ?? captureFrameRate,
    captureFrameRate,
  );

  const deduped: VideoPreset[] = [];

  for (let i = 0; i < presets.length; i += 1) {
    const preset = presets[i];
    const isDuplicate = deduped.some(
      (p) => p.width === preset.width
        && p.height === preset.height
        && p.encoding.maxBitrate === preset.encoding.maxBitrate
        && effectiveFps(p) === effectiveFps(preset),
    );

    if (!isDuplicate) deduped.push(preset);
  }

  return deduped;
};
