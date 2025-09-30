import React, { useState, memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import NotesService from '/imports/ui/components/notes/service';
import { notify } from '/imports/ui/services/notification';
import Styled from './styles';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import useHasUnreadNotes from '/imports/ui/components/notes/hooks/useHasUnreadNotes';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import { BaseSidebarButtonProps } from '../types';
import { PANELS } from '/imports/ui/components/layout/enums';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';

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
  const [pinWasNotified, setPinWasNotified] = useState(false);
  const hasUnreadNotes = useHasUnreadNotes({ isNotesPanelOpened: isOpened });
  const {
    data: currentMeeting,
  } = useMeeting((meeting) => ({
    componentsFlags: meeting.componentsFlags,
  }));
  const isPinned = currentMeeting?.componentsFlags?.isSharedNotesPinned ?? false;
  const prevIsPinned = usePreviousValue(isPinned);

  const isEnabled = NotesService.useIsEnabled();
  if (isPinned && !pinWasNotified) {
    notify(intl.formatMessage(intlMessages.pinnedNotification), 'info', 'copy', { pauseOnFocusLoss: false });
    setPinWasNotified(true);
  }

  const notesOpen = isOpened && !isPinned;

  if (prevIsPinned && !isPinned && pinWasNotified) {
    setPinWasNotified(false);
  }

  const label = intl.formatMessage(isPinned ? intlMessages.sharedNotesPinned : intlMessages.sharedNotes);
  if (!isEnabled) return null;
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
      isDisabled={disableNotes}
    >
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
    </SidebarNavigationButton>
  );
};

export default memo(UserNotesListItemContainerGraphql);
