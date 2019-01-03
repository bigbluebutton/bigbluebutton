import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import RecordingContainer from '/imports/ui/components/recording/container';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import { styles } from './styles';
import cx from 'classnames';

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
