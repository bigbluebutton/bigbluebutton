import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
import NoteService from '/imports/ui/components/note/service';
import { styles } from './styles';
import { PANELS, ACTIONS } from '../layout/enums';

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

class Note extends Component {
  constructor(props) {
    super(props);

    this.noteURL = NoteService.getNoteURL();
    this.readOnlyURL = NoteService.getReadOnlyURL();
  }

  componentWillUnmount() {
    const revs = NoteService.getRevs();
    NoteService.setLastRevs(revs);
  }

  render() {
    const {
      isLocked,
      intl,
      isRTL,
      newLayoutContextDispatch,
    } = this.props;

    const url = isLocked ? this.readOnlyURL : this.noteURL;
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
                newLayoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                  value: false,
                });
                newLayoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                  value: PANELS.NONE,
                });
              }}
              data-test="hideNoteLabel"
              aria-label={intl.formatMessage(intlMessages.hideNoteLabel)}
              label={intl.formatMessage(intlMessages.title)}
              icon={isRTL ? 'right_arrow' : 'left_arrow'}
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
  }
}

Note.propTypes = propTypes;

export default injectWbResizeEvent(injectIntl(Note));
