import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles.scss';

const intlMessages = defineMessages({
  dropZoneLabel: {
    id: 'app.video.dropZoneLabel',
    description: 'message showing where the user can drop cameraDock',
  },
});

const DropArea = ({ id, style, intl }) => (
  <>
    <div
      id={id}
      className={styles.dropZoneArea}
      style={
        {
          ...style,
          zIndex: style.zIndex + 1,
        }
      }
    />
    <div
      className={styles.dropZoneBg}
      style={
        {
          ...style,
          zIndex: style.zIndex,
        }
      }
    >
      {intl.formatMessage(intlMessages.dropZoneLabel)}
    </div>
  </>
);

export default injectIntl(DropArea);
