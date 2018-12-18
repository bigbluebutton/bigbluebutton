import React from 'react';
import { styles } from './styles';

const RecordingIndicator = ({
  record, title, recording,
}) => {
  if (!record) return null;

  return (
    <div
      aria-label={title}
      className={styles.recordState}
    >
      <div className={recording ? styles.recordIndicator : styles.notRecording} />
    </div>
  );
};

export default RecordingIndicator;
