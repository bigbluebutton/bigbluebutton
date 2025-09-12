import React, { useCallback, useEffect } from 'react';
import Styled from './styles';

interface VolumeSlideProps {
  onVolumeChanged: (volume: number) => void;
  onMuted: (muted: boolean) => void;
  volume: number;
  muted: boolean;
  hideVolume: boolean;
}

const VolumeSlide = React.forwardRef<HTMLInputElement, VolumeSlideProps>(({
  onVolumeChanged,
  onMuted,
  volume,
  muted,
  hideVolume,
}, ref) => {
  const [volumeState, setVolume] = React.useState(volume);
  const [mutedState, setMuted] = React.useState(muted);

  const volumeBeforeMute = React.useRef<number>(0);

  const getVolumeIcon = useCallback(() => {
    if ((mutedState || muted) || volumeState <= 0) return 'volume_off';

    if (volumeState <= 0.25) return 'volume_mute';

    if (volumeState <= 0.75) return 'volume_down';

    return 'volume_up';
  }, [mutedState, volumeState, muted]);

  const handleOnChange = useCallback((volume: number, mute: boolean) => {
    onVolumeChanged(volume);
    setVolume(volume);
    defineMuteState(mute, volume);
  }, []);

  const defineMuteState = useCallback((mute: boolean, volume: number) => {
    if (mute && volume > 0) { // unmute if volume was raised during mute
      setMuted(false);
      onMuted(false);
    } else if (volume <= 0) { // mute if volume is turned to 0
      setMuted(true);
      onMuted(true);
    }
  }, []);

  useEffect(() => {
    setMuted(muted);
    volumeBeforeMute.current = volume;
  }, []);

  useEffect(() => {
    if (volumeState !== volume) {
      setVolume(volume);
    }

    if (mutedState !== muted) {
      setMuted(muted);
    }
  }, [volume, muted]);

  if (hideVolume) return null;

  return (
    <Styled.Slider>
      <Styled.Volume onClick={() => {
        if (!muted) {
          volumeBeforeMute.current = (volumeState || volume);
        }
        setMuted(!muted);
        onMuted(!muted);
        if (muted) {
          onVolumeChanged(volumeBeforeMute.current || 1);
        }
      }}
      >
        <i
          tabIndex={-1}
          className={`icon-bbb-${getVolumeIcon()}`}
        />
      </Styled.Volume>
      <Styled.VolumeSlider
        ref={ref}
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={mutedState ? 0 : volumeState}
        onChange={(e) => handleOnChange(e.target.valueAsNumber, muted)}
      />
    </Styled.Slider>
  );
});

export default VolumeSlide;
