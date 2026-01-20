import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import { ACTIONS, PANELS } from '../../../layout/enums';

// TODO: Add internatioalization

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

const BNSharedNotesItem = ({
  sidebarContentPanel,
  layoutContextDispatch,
  disableNotes,
}) => {
  const intl = useIntl();

  const toggleBlockNotePanel = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== PANELS.BN_SHARED_NOTES,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === PANELS.BN_SHARED_NOTES
        ? PANELS.NONE
        : PANELS.BN_SHARED_NOTES,
    });
  };

  return (
    <Styled.Messages>
      <Styled.ScrollableList>
        <Styled.List>
          <Styled.ListItem
            role="button"
            tabIndex={0}
            active={sidebarContentPanel === PANELS.BN_SHARED_NOTES}
            onClick={toggleBlockNotePanel}
            data-test="blockNoteSidebar"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                toggleBlockNotePanel();
              }
            }}
          >
            <Icon iconName="copy" />
            <div aria-hidden>
              <Styled.BlockNoteTitle>
                Block Note
              </Styled.BlockNoteTitle>
              {disableNotes
                ? (
                  <Styled.NotesLock>
                    {/* @ts-ignore */}
                    <span id="lockedNotes">
                      <Icon iconName="lock" />
                      &nbsp;
                      {`${intl.formatMessage(intlMessages.locked)} ${intl.formatMessage(intlMessages.byModerator)}`}
                    </span>
                  </Styled.NotesLock>
                ) : null}
            </div>
          </Styled.ListItem>
        </Styled.List>
      </Styled.ScrollableList>
    </Styled.Messages>
  );
};

export default BNSharedNotesItem;

BNSharedNotesItem.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};
