import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import hark from 'hark';
import Styled from './styles';

const VOL_POLLING_INTERVAL_MS = 100;
const VOL_FLOOR = 0;
const VOL_CEIL = 50;
const DB_AMPL = 65;

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
  volumeFloor,
  volumeRange,
  low,
  optimum,
  high,
  stream,
}) => {
  const harkObserver = useRef(null);
  const volumeRef = useRef(0);
  const [volume, setVolume] = useState(0);

  const handleVolumeChange = (dbVolume) => {
    const previousVolume = volumeRef.current;
    // Normalize it into 0 - range . DB_AMPL is the "relevance factor" -
    // original formula is / 20
    const linearVolume = (10 ** (dbVolume / DB_AMPL)) * (volumeRange);
    // If the current linear volume is lower than 1/10 of the total volume range,
    // ignore to minimize re-renders. Otherwise: generate the next volume val
    // by smoothing the transition with the previous value and rounding it up
    const nextVolume = (linearVolume <= (volumeRange / 10))
      ? volumeFloor
      : Math.round((0.65 * previousVolume) + (0.35 * linearVolume));

    if (previousVolume !== nextVolume) {
      volumeRef.current = nextVolume;
      setVolume(nextVolume);
    }
  };

  const observeVolumeChanges = (_stream) => {
    if (_stream) {
      harkObserver.current = hark(_stream, { interval: VOL_POLLING_INTERVAL_MS });
      harkObserver.current.on('volume_change', handleVolumeChange);
    }
  };

  const stopObservingVolumeChanges = () => {
    harkObserver.current?.stop();
    harkObserver.current = null;
  };

  useEffect(() => {
    observeVolumeChanges();
    return stopObservingVolumeChanges;
  }, []);

  useEffect(() => {
    stopObservingVolumeChanges();
    observeVolumeChanges(stream);
  }, [stream]);

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
AudioStreamVolume.defaultProps = {
  volumeFloor: VOL_FLOOR,
  volumeRange: VOL_CEIL,
  low: VOL_FLOOR,
  optimum: Math.round(0.3 * VOL_CEIL),
  high: Math.round(0.4 * VOL_CEIL),
  stream: null,
};

export default React.memo(AudioStreamVolume);
