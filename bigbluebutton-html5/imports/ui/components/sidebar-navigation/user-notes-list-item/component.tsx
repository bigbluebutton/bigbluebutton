import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import NotesService from '/imports/ui/components/notes/service';
import useHasUnreadNotes from '/imports/ui/components/notes/hooks/useHasUnreadNotes';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import { BaseSidebarButtonProps } from '../types';
import { PANELS } from '/imports/ui/components/layout/enums';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';
import { GET_PAD_ID, GetPadIdQueryResponse } from '/imports/ui/components/notes/queries';
import { useQuery } from '@apollo/client';
import logger from '/imports/startup/client/logger';

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

const UserNotesListItemContainerGraphql: React.FC<BaseSidebarButtonProps> = (props) => {
  const { isOpened } = props;
  const intl = useIntl();
  const { userLocks } = useLockContext();
  const disableNotes = userLocks.userNotes;
  const hasUnreadNotes = useHasUnreadNotes({ isNotesPanelOpened: isOpened });

  const {
    data: currentMeeting,
  } = useMeeting((meeting) => ({
    componentsFlags: meeting.componentsFlags,
  }));

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const { data: padIdData, loading: padIdLoading } = useQuery<GetPadIdQueryResponse>(
    GET_PAD_ID,
    { variables: { externalId: NOTES_CONFIG.id } },
  );

  const padId = padIdData?.sharedNotes[0]?.padId;
  const sharedNotesEditor = padIdData?.sharedNotes[0]?.sharedNotesEditor;

  const isPinned = currentMeeting?.componentsFlags?.isSharedNotesPinned ?? false;

  const isEnabled = NotesService.useIsEnabled();

  const notesOpen = isOpened && !isPinned;
  const label = disableNotes
    ? `${intl.formatMessage(intlMessages.locked)} ${intl.formatMessage(intlMessages.byModerator)}`
    : intl.formatMessage(isPinned ? intlMessages.sharedNotesPinned : intlMessages.sharedNotes);
  if (!isEnabled) return null;

  if (!padIdLoading && (!padId || !sharedNotesEditor)) {
    logger.error({
      logCode: 'shared_notes_not_configured',
      extraInfo: {
        padId,
        sharedNotesEditor,
      },
    }, 'No padId or shared-notes editor found, ignoring...');
    return null;
  }
  if (padIdLoading) return null;
  return (
    <SidebarNavigationButton
      panel={PANELS.SHARED_NOTES}
      isOpened={notesOpen}
      iconName="shared_notes"
      label={label}
      id="shared-notes-toggle-button"
      ariaDescribedBy="lockedNotes"
      dataTest="sharedNotesSidebarButton"
      hasNotification={hasUnreadNotes}
      isDisabled={isPinned}
      isLocked={disableNotes}
    />
  );
};

export default memo(UserNotesListItemContainerGraphql);
