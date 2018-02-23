import React from 'react';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const RecordingIndicator = ({ record, allowStartStopRecording, title, recording }) => {

  if (!record || !allowStartStopRecording) return null;

  return (
    <div className={recording ? styles.recording : styles.recordIndicator}>
      <Icon
        iconName="record"
      />
      <span>
        {title}
      </span>
    </div>
  );
};

export default RecordingIndicator;
