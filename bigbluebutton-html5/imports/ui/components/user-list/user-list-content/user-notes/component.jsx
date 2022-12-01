import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import NotesService from '/imports/ui/components/notes/service';
import Styled from './styles';
import { PANELS } from '/imports/ui/components/layout/enums';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

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
    const { sidebarContentPanel, rev, isPinned } = this.props;
    const { unread } = this.state;

    if (sidebarContentPanel !== PANELS.SHARED_NOTES && !unread) {
      if (prevProps.rev !== rev) this.setUnread(true);
    }

    if (sidebarContentPanel === PANELS.SHARED_NOTES && unread) {
      this.setUnread(false);
    }

    if (!isPinned && prevProps.isPinned && unread) this.setUnread(false);
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
      isPinned,
      compact,
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

    return (
      <TooltipContainer title={intl.formatMessage(intlMessages.sharedNotes)}>
      <Styled.ListItem
        aria-label={intl.formatMessage(intlMessages.sharedNotes)}
        aria-describedby="lockedNotes"
        role="button"
        tabIndex={0}
        onClick={() => NotesService.toggleNotesPanel(sidebarContentPanel, layoutContextDispatch)}
        onKeyPress={() => { }}
        as={isPinned ? 'button' : 'div'}
        disabled={isPinned}
        $disabled={isPinned}
        $compact={compact}
      >
        <Icon iconName="copy" />
        <div aria-hidden>
          {!compact
            ? (
              <Styled.NotesTitle data-test="sharedNotes">
                {intl.formatMessage(intlMessages.sharedNotes)}
              </Styled.NotesTitle>
            ) : null}          
          {disableNotes
            ? (
              <Styled.NotesLock>
                <Icon iconName="lock" />
                <span id="lockedNotes">{`${intl.formatMessage(intlMessages.locked)} ${intl.formatMessage(intlMessages.byModerator)}`}</span>
              </Styled.NotesLock>
            ) : null}
          {isPinned
            ? (
              <span className='sr-only'>{`${intl.formatMessage(intlMessages.disabled)}`}</span>
            ) : null}
        </div>
        {notification}
      </Styled.ListItem>
      </TooltipContainer>
    );
  }

  render() {
    const { intl, compact } = this.props;

    if (!NotesService.isEnabled()) return null;

    return (
      <Styled.Messages>
        {!compact
          ? (
            <Styled.Container>
              <Styled.SmallTitle data-test="notesTitle">
                {intl.formatMessage(intlMessages.title)}
              </Styled.SmallTitle>
            </Styled.Container>
          ) : null}
        <Styled.ScrollableList>
          <Styled.List compact={compact}>
            {this.renderNotes()}
          </Styled.List>
        </Styled.ScrollableList>
      </Styled.Messages>
    );
  }
}

UserNotes.propTypes = propTypes;

export default injectIntl(UserNotes);
