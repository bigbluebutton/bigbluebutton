import React from 'react';
import { styles } from './styles';

const RecordingIndicator = ({
  record, title, recording,
}) => {
  if (!record) return null;

  return (
    <div>
      <div className={recording ? styles.recordIndicator : styles.notRecording} />
      <span className={recording ? styles.recordingLabel : styles.notRecordingLabel}>{title}</span>
    </div>
  );
};

export default RecordingIndicator;
