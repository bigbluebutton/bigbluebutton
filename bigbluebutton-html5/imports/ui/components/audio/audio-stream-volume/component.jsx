import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import { useStreamVolume } from '/imports/ui/components/media-setup/audio-test/hooks';

const VOL_FLOOR = 0;
const VOL_CEIL = 50;

const propTypes = {
  stream: PropTypes.shape({
    active: PropTypes.bool,
    id: PropTypes.string,
  }),
  volumeFloor: PropTypes.number,
  volumeRange: PropTypes.number,
  optimum: PropTypes.number,
  high: PropTypes.number,
  low: PropTypes.number,
};

const AudioStreamVolume = ({
  volumeFloor = VOL_FLOOR,
  volumeRange = VOL_CEIL,
  low = VOL_FLOOR,
  optimum = Math.round(0.3 * VOL_CEIL),
  high = Math.round(0.4 * VOL_CEIL),
  stream = null,
}) => {
  const volume = useStreamVolume(stream, volumeRange, volumeFloor);

  return (
    <Styled.VolumeMeter
      data-test={volume > 0 ? 'hasVolume' : 'hasNoVolume'}
      min={volumeFloor}
      low={low}
      max={high * 1.25}
      optimum={optimum}
      high={high}
      value={volume}
    />
  );
};

AudioStreamVolume.propTypes = propTypes;

export default React.memo(AudioStreamVolume);
