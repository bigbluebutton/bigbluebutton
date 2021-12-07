import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import NoteService from '/imports/ui/components/note/service';
import Styled from './styles';
import { PANELS } from '../../../layout/enums';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  revs: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.notesTitle',
    description: 'Title for the notes list',
  },
  sharedNotes: {
    id: 'app.note.title',
    description: 'Title for the shared notes',
  },
  unreadContent: {
    id: 'app.userList.notesListItem.unreadContent',
    description: 'Aria label for notes unread content',
  },
  locked: {
    id: 'app.note.locked',
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
    const { revs } = this.props;

    const lastRevs = NoteService.getLastRevs();

    if (revs !== 0 && revs > lastRevs) this.setUnread(true);
  }

  componentDidUpdate(prevProps) {
    const { sidebarContentPanel, revs } = this.props;
    const { unread } = this.state;

    if (sidebarContentPanel !== PANELS.SHARED_NOTES && !unread) {
      if (prevProps.revs !== revs) this.setUnread(true);
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
      intl, disableNote, sidebarContentPanel, layoutContextDispatch,
    } = this.props;
    const { unread } = this.state;

    let notification = null;
    if (unread) {
      notification = (
        <Styled.UnreadMessages aria-label={intl.formatMessage(intlMessages.unreadContent)}>
          <Styled.UnreadMessagesText aria-hidden="true">
            ···
          </Styled.UnreadMessagesText>
        </Styled.UnreadMessages>
      );
    }

    return (
      <Styled.ListItem
        aria-label={intl.formatMessage(intlMessages.sharedNotes)}
        aria-describedby="lockedNote"
        role="button"
        tabIndex={0}
        onClick={() => NoteService.toggleNotePanel(sidebarContentPanel, layoutContextDispatch)}
        onKeyPress={() => { }}
      >
        <Icon iconName="copy" />
        <div aria-hidden>
          <Styled.NoteTitle data-test="sharedNotes">
            {intl.formatMessage(intlMessages.sharedNotes)}
          </Styled.NoteTitle>
          {disableNote
            ? (
              <Styled.NoteLock>
                <Icon iconName="lock" />
                <span id="lockedNote">{`${intl.formatMessage(intlMessages.locked)} ${intl.formatMessage(intlMessages.byModerator)}`}</span>
              </Styled.NoteLock>
            ) : null}
        </div>
        {notification}
      </Styled.ListItem>
    );
  }

  render() {
    const { intl } = this.props;

    if (!NoteService.isEnabled()) return null;

    return (
      <Styled.Messages>
        <Styled.Container>
          <Styled.SmallTitle>
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
