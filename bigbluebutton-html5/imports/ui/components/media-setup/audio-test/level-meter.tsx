import React, { useId } from 'react';
import { BBBSlider } from '@bigbluebutton/bbb-ui-components-react';
import { useStreamVolume } from './hooks';
import Styled from './styles';

// The classic audio modal's meter fills at half of the volume range: the same
// scale here, so that both read alike for the same voice.
const FULL_SCALE_VOLUME = 0.5;

interface AudioLevelMeterProps {
  stream: MediaStream | null;
  label: string;
  animations?: boolean;
  dataTest?: string;
}

/**
 * The input level of a microphone stream, drawn with the library slider.
 */
const AudioLevelMeter: React.FC<AudioLevelMeterProps> = ({
  stream,
  label,
  animations = true,
  dataTest,
}) => {
  const labelId = useId();
  const volume = useStreamVolume(stream);
  const level = Math.round(Math.min(1, volume / FULL_SCALE_VOLUME) * 100);

  return (
    <Styled.MeterContainer
      role="meter"
      aria-labelledby={labelId}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={level}
      data-test={dataTest}
      data-has-volume={level > 0}
    >
      <Styled.MeterLabel id={labelId}>{label}</Styled.MeterLabel>
      <Styled.MeterTrack aria-hidden>
        <BBBSlider
          value={level}
          min={0}
          max={100}
          valueLabelDisplay="off"
          animate={animations}
          slotProps={{
            thumb: { style: { display: 'none' } },
            input: { tabIndex: -1 },
          }}
        />
      </Styled.MeterTrack>
    </Styled.MeterContainer>
  );
};

export default AudioLevelMeter;
