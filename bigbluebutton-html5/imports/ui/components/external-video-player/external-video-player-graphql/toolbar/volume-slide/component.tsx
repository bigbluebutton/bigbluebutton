import React, { useCallback, useEffect } from 'react';
import Styled from './styles';

interface VolumeSlideProps {
  onVolumeChanged: (volume: number) => void;
  onMuted: (muted: boolean) => void;
  volume: number;
  muted: boolean;
  hideVolume: boolean;
}

const VolumeSlide: React.FC<VolumeSlideProps> = ({
  onVolumeChanged,
  onMuted,
  volume,
  muted,
  hideVolume,
}) => {
  const [volumeState, setVolume] = React.useState(volume);
  const [mutedState, setMuted] = React.useState(muted);

  const volumeBeforeMute = React.useRef<number>(0);

  const getVolumeIcon = useCallback(() => {
    if (mutedState || volumeState <= 0) return 'volume_off';

    if (volumeState <= 0.25) return 'volume_mute';

    if (volumeState <= 0.75) return 'volume_down';

    return 'volume_up';
  }, [mutedState, volumeState]);

  const handleOnChange = useCallback((volume: number) => {
    onVolumeChanged(volume);

    setVolume(volume);
  }, []);

  useEffect(() => {
    if (mutedState && volumeState > 0) { // unmute if volume was raised during mute
      setMuted(false);
      onMuted(false);
    } else if (volumeState <= 0) { // mute if volume is turned to 0
      setMuted(true);
      onMuted(true);
    }
  }, [volumeState, mutedState, onMuted]);

  useEffect(() => {
    if (volumeState !== volume) {
      handleOnChange(volume);
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
          volumeBeforeMute.current = volumeState;
        }
        onVolumeChanged(muted ? volumeBeforeMute.current : 0);
        setVolume(!muted ? 0 : volumeBeforeMute.current);
        setMuted(!muted);
        onMuted(!muted);
      }}
      >
        <i
          tabIndex={-1}
          className={`icon-bbb-${getVolumeIcon()}`}
        />
      </Styled.Volume>
      <Styled.VolumeSlider
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={mutedState ? 0 : volumeState}
        onChange={(e) => handleOnChange(e.target.valueAsNumber)}
      />
    </Styled.Slider>
  );
};

export default VolumeSlide;
