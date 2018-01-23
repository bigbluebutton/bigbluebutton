import React from 'react';
import { styles } from './styles';

const RecordingIndicator = ({ beingRecorded }) => {
  if (!beingRecorded) return null;
  return <div className={styles.indicator} />;
};

export default RecordingIndicator;
