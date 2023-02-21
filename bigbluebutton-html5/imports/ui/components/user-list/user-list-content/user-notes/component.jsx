import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import NotesService from '/imports/ui/components/notes/service';
import Styled from './styles';
import { PANELS } from '/imports/ui/components/layout/enums';
import { notify } from '/imports/ui/services/notification';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isPinned: PropTypes.bool.isRequired,
  sidebarContentPanel: PropTypes.string.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.notesTitle',
    description: 'Title for the notes list',
  },
  pinnedNotification: {
    id: 'app.notes.pinnedNotification',
    description: 'Notification text for pinned shared notes',
  },
  sharedNotes: {
    id: 'app.notes.title',
    description: 'Title for the shared notes',
  },
  sharedNotesPinned: {
    id: 'app.notes.titlePinned',
    description: 'Title for the shared notes pinned',
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
  disabled: {
    id: 'app.notes.disabled',
    description: 'Aria description for disabled notes button',
  },
});

class UserNotes extends Component {
  constructor(props) {
    super(props);

    this.state = {
      unread: false,
      pinWasNotified: false,
    };
    this.setUnread = this.setUnread.bind(this);
    this.showTitleAlert = this.showTitleAlert.bind(this);
  }

  componentDidMount() {
    this.setUnread(NotesService.hasUnreadNotes());
  }

  componentDidUpdate(prevProps) {
    const { sidebarContentPanel, isPinned } = this.props;
    const { unread } = this.state;

    this.showTitleAlert();

    const notesOpen = sidebarContentPanel === PANELS.SHARED_NOTES && !isPinned;
    const notesClosed = (prevProps.sidebarContentPanel === PANELS.SHARED_NOTES
                        && sidebarContentPanel !== PANELS.SHARED_NOTES)
                        || (prevProps.isPinned && !isPinned);

    if (notesOpen && unread) {
      NotesService.markNotesAsRead();
      this.setUnread(false);
    } else if (!unread && NotesService.hasUnreadNotes()) {
      this.setUnread(true);
    }

    if (notesClosed) {
      NotesService.markNotesAsRead();
      this.setUnread(false);
    }
    if (prevProps.isPinned && !isPinned) {
      this.setState({ pinWasNotified: false });
    }
  }

  setUnread(unread) {
    this.setState({ unread });
  }

  showTitleAlert() {
    const {
      intl,
      isPinned,
    } = this.props;
    const { pinWasNotified } = this.state;
    if (isPinned && !pinWasNotified) {
      notify(intl.formatMessage(intlMessages.pinnedNotification), 'info', 'copy', { pauseOnFocusLoss: false });
      this.setState({
        pinWasNotified: true,
      });
    }
  }

  renderNotes() {
    const {
      intl,
      disableNotes,
      sidebarContentPanel,
      layoutContextDispatch,
      isPinned,
    } = this.props;
    const { unread } = this.state;

    let notification = null;
    if (unread && !isPinned) {
      notification = (
        <Styled.UnreadMessages aria-label={intl.formatMessage(intlMessages.unreadContent)}>
          <Styled.UnreadMessagesText aria-hidden="true">
            ···
          </Styled.UnreadMessagesText>
        </Styled.UnreadMessages>
      );
    }

    const showTitle = isPinned ? intl.formatMessage(intlMessages.sharedNotesPinned)
      : intl.formatMessage(intlMessages.sharedNotes);
    return (
      <Styled.ListItem
        aria-label={showTitle}
        aria-describedby="lockedNotes"
        role="button"
        tabIndex={0}
        onClick={() => NotesService.toggleNotesPanel(sidebarContentPanel, layoutContextDispatch)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            NotesService.toggleNotesPanel(sidebarContentPanel, layoutContextDispatch);
          }
        }}
        as={isPinned ? 'button' : 'div'}
        disabled={isPinned}
        $disabled={isPinned}
      >
        <Icon iconName="copy" />
        <div aria-hidden>
          <Styled.NotesTitle data-test="sharedNotes">
            { showTitle }
          </Styled.NotesTitle>
          {disableNotes
            ? (
              <Styled.NotesLock>
                <Icon iconName="lock" />
                <span id="lockedNotes">{`${intl.formatMessage(intlMessages.locked)} ${intl.formatMessage(intlMessages.byModerator)}`}</span>
              </Styled.NotesLock>
            ) : null}
          {isPinned
            ? (
              <span className="sr-only">{`${intl.formatMessage(intlMessages.disabled)}`}</span>
            ) : null}
        </div>
        {notification}
      </Styled.ListItem>
    );
  }

  render() {
    const { intl } = this.props;

    if (!NotesService.isEnabled()) return null;

    return (
      <Styled.Messages>
        <Styled.Container>
          <Styled.SmallTitle data-test="notesTitle">
            {intl.formatMessage(intlMessages.title)}
          </Styled.SmallTitle>
        </Styled.Container>
        <Styled.ScrollableList>
          <Styled.List>
            {this.renderNotes()}
          </Styled.List>
        </Styled.ScrollableList>
      </Styled.Messages>
    );
  }
}

UserNotes.propTypes = propTypes;

export default injectIntl(UserNotes);
