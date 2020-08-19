import React from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
import NoteService from './service';
import { styles } from './styles';

const intlMessages = defineMessages({
  hideNoteLabel: {
    id: 'app.note.hideNoteLabel',
    description: 'Label for hiding note button',
  },
  title: {
    id: 'app.note.title',
    description: 'Title for the shared notes',
  },
  tipLabel: {
    id: 'app.note.tipLabel',
    description: 'Label for tip on how to escape iframe',
  },
});

const propTypes = {
  isLocked: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
};

const Note = (props) => {
  const {
    isLocked,
    intl,
    isRTL,
  } = props;

  const url = isLocked ? NoteService.getReadOnlyURL() : NoteService.getNoteURL();

  return (
    <div
      data-test="note"
      className={styles.note}
    >
      <header className={styles.header}>
        <div
          data-test="noteTitle"
          className={styles.title}
        >
          <Button
            onClick={() => {
              Session.set('openPanel', 'userlist');
            }}
            aria-label={intl.formatMessage(intlMessages.hideNoteLabel)}
            label={intl.formatMessage(intlMessages.title)}
            icon={isRTL ? "right_arrow" : "left_arrow"}
            className={styles.hideBtn}
          />
        </div>
      </header>
      <iframe
        title="etherpad"
        src={url}
        aria-describedby="sharedNotesEscapeHint"
      />
      <span id="sharedNotesEscapeHint" className={styles.hint} aria-hidden>
        {intl.formatMessage(intlMessages.tipLabel)}
      </span>
    </div>
  );
};

Note.propTypes = propTypes;
Note.defaultProps = defaultProps;

export default injectWbResizeEvent(injectIntl(Note));
