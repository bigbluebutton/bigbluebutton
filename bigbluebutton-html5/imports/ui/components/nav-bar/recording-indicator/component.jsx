import React from 'react';
import Button from '/imports/ui/components/button/component';
import RecordingContainer from '/imports/ui/components/recording/container';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import cx from 'classnames';
import { styles } from './styles';

const RecordingIndicator = ({
  record, title, recording, buttonTitle, mountModal, time,
}) => {
  if (!record) return null;

  return (
    <div
      aria-label={title}
      className={styles.recordState}
    >
      <div className={styles.border}>
        <Button
          label={buttonTitle}
          hideLabel
          ghost
          className={cx(styles.btn, recording ? styles.recordIndicator : styles.notRecording)}
          onClick={() => {
            mountModal(<RecordingContainer />);
            document.activeElement.blur();
          }}
        />
      </div>
      <div className={styles.presentationTitle}>
        {recording ? humanizeSeconds(time) : <div>{buttonTitle}</div>}
      </div>
    </div>
  );
};

export default RecordingIndicator;
