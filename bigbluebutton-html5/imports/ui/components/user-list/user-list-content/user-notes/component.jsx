import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import NotesService from '/imports/ui/components/notes/service';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import { PANELS } from '/imports/ui/components/layout/enums';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  rev: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.notesTitle',
    description: 'Title for the notes list',
  },
  sharedNotes: {
    id: 'app.notes.title',
    description: 'Title for the shared notes',
  },
  unreadContent: {
    id: 'app.userList.notesListItem.unreadContent',
    description: 'Aria label for notes unread content',
  },
  locked: {
    id: 'app.notes.locked',
    description: '',
  },
  byModerator: {
    id: 'app.userList.byModerator',
    description: '',
  },
});

class UserNotes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      unread: false,
    };
    this.setUnread = this.setUnread.bind(this);
  }

  componentDidMount() {
    const {
      rev,
    } = this.props;

    const lastRev = NotesService.getLastRev();

    if (rev !== 0 && rev > lastRev) this.setUnread(true);
  }

  componentDidUpdate(prevProps) {
    const { sidebarContentPanel, rev } = this.props;
    const { unread } = this.state;

    if (sidebarContentPanel !== PANELS.SHARED_NOTES && !unread) {
      if (prevProps.rev !== rev) this.setUnread(true);
    }

    if (sidebarContentPanel === PANELS.SHARED_NOTES && unread) {
      this.setUnread(false);
    }
  }

  setUnread(unread) {
    this.setState({ unread });
  }

  renderNotes() {
    const {
      intl,
      disableNotes,
      sidebarContentPanel,
      layoutContextDispatch,
    } = this.props;
    const { unread } = this.state;

    let notification = null;
    if (unread) {
      notification = (
        <div
          className={styles.unreadMessages}
          aria-label={intl.formatMessage(intlMessages.unreadContent)}
        >
          <div className={styles.unreadMessagesText} aria-hidden="true">
            ···
          </div>
        </div>
      );
    }

    return (
      <div
        aria-label={intl.formatMessage(intlMessages.sharedNotes)}
        aria-describedby="lockedNotes"
        role="button"
        tabIndex={0}
        className={styles.listItem}
        onClick={() => NotesService.toggleNotesPanel(sidebarContentPanel, layoutContextDispatch)}
        onKeyPress={() => { }}
      >
        <Icon iconName="copy" />
        <div aria-hidden>
          <div className={styles.notesTitle} data-test="sharedNotes">
            {intl.formatMessage(intlMessages.sharedNotes)}
          </div>
          {disableNotes
            ? (
              <div className={styles.notesLock}>
                <Icon iconName="lock" />
                <span id="lockedNotes">{`${intl.formatMessage(intlMessages.locked)} ${intl.formatMessage(intlMessages.byModerator)}`}</span>
              </div>
            ) : null}
        </div>
        {notification}
      </div>
    );
  }

  render() {
    const { intl } = this.props;

    if (!NotesService.isEnabled()) return null;

    return (
      <div className={styles.messages}>
        <div className={styles.container}>
          <h2 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.title)}
          </h2>
        </div>
        <div className={styles.scrollableList}>
          <div className={styles.list}>
            {this.renderNotes()}
          </div>
        </div>
      </div>
    );
  }
}

UserNotes.propTypes = propTypes;

export default UserNotes;
