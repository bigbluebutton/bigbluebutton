import React from 'react';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const RecordingIndicator = ({ beingRecorded, title }) => {
  if (!beingRecorded) return null;

  return (
    <Button
      hideLabel
      className={styles.recordBtn}
      aria-label={title}
      label={title}
      icon="record"
      size="md"
      circle
      ghost
      onClick={() => null}
    />
  )
};

export default RecordingIndicator;
