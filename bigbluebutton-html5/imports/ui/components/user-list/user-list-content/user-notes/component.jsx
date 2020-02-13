import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { defineMessages } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import NoteService from '/imports/ui/components/note/service';
import { styles } from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  revs: PropTypes.number.isRequired,
  isPanelOpened: PropTypes.bool.isRequired,
};

const intlMessages = defineMessages({
  notesTitle: {
    id: 'app.userList.notesTitle',
    description: 'Title for the notes list',
  },
  title: {
    id: 'app.note.title',
    description: 'Title for the shared notes',
  },
  unreadContent: {
    id: 'app.userList.notesListItem.unreadContent',
    description: 'Aria label for notes unread content',
  },
});

class UserNotes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      unread: false,
    };
  }

  componentDidMount() {
    const { revs } = this.props;

    const lastRevs = NoteService.getLastRevs();

    if (revs !== 0 && revs > lastRevs) this.setState({ unread: true });
  }

  componentDidUpdate(prevProps) {
    const { isPanelOpened, revs } = this.props;
    const { unread } = this.state;

    if (!isPanelOpened && !unread) {
      if (prevProps.revs !== revs) this.setState({ unread: true });
    }

    if (isPanelOpened && unread) {
      this.setState({ unread: false });
    }
  }

  render() {
    const { intl, isPanelOpened } = this.props;
    const { unread } = this.state;

    if (!NoteService.isEnabled()) return null;

    const toggleNotePanel = () => {
      Session.set(
        'openPanel',
        isPanelOpened
          ? 'userlist'
          : 'note',
      );
    };

    const linkClasses = {};
    linkClasses[styles.active] = isPanelOpened;


    let notification = null;
    if (unread) {
      notification = (
        <div
          className={styles.unreadContent}
          aria-label={intl.formatMessage(intlMessages.unreadContent)}
        >
          <div className={styles.unreadContentText} aria-hidden="true">
            ···
          </div>
        </div>
      );
    }

    return (
      <div className={styles.messages}>
        {
          <h2 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.notesTitle)}
          </h2>
        }
        <div className={styles.scrollableList}>
          <div
            role="button"
            tabIndex={0}
            className={cx(styles.noteLink, linkClasses)}
            onClick={toggleNotePanel}
          >
            <Icon iconName="copy" />
            <span>{intl.formatMessage(intlMessages.title)}</span>
            {notification}
          </div>
        </div>
      </div>
    );
  }
}

UserNotes.propTypes = propTypes;

export default UserNotes;
