import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import NotesService from '/imports/ui/components/notes/service';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import { PANELS } from '/imports/ui/components/layout/enums';
import { notify } from '/imports/ui/services/notification';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import {
  PINNED_PAD_SUBSCRIPTION,
} from '/imports/ui/components/notes/queries';
import Styled from './styles';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import useRev from '/imports/ui/components/pads/pads-graphql/hooks/useRev';
import useNotesLastRev from '../../notes/hooks/useNotesLastRev';
import useHasUnreadNotes from '../../notes/hooks/useHasUnreadNotes';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import TooltipContainer from '../../common/tooltip/container';
import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';

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

interface UserNotesGraphqlProps {
  isPinned: boolean,
  disableNotes: boolean,
  sidebarContentPanel: string,
  layoutContextDispatch: DispatcherFunction,
  hasUnreadNotes: boolean,
  markNotesAsRead: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggleNotesPanel: (sidebarContentPanel: any, layoutContextDispatch: any) => void,
  isEnabled: boolean,
}

interface UserNotesContainerGraphqlProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userLocks: any;
}

const UserNotesGraphql: React.FC<UserNotesGraphqlProps> = (props) => {
  const {
    isPinned,
    disableNotes,
    sidebarContentPanel,
    layoutContextDispatch,
    isEnabled,
    hasUnreadNotes,
    markNotesAsRead,
    toggleNotesPanel,
  } = props;
  const [unread, setUnread] = useState(false);
  const [pinWasNotified, setPinWasNotified] = useState(false);
  const intl = useIntl();
  const prevSidebarContentPanel = usePreviousValue(sidebarContentPanel);
  const prevIsPinned = usePreviousValue(isPinned);

  useEffect(() => {
    setUnread(hasUnreadNotes);
  }, []);

  if (isPinned && !pinWasNotified) {
    notify(intl.formatMessage(intlMessages.pinnedNotification), 'info', 'copy', { pauseOnFocusLoss: false });
    setPinWasNotified(true);
  }

  const notesOpen = sidebarContentPanel === PANELS.SHARED_NOTES && !isPinned;
  const notesClosed = (prevSidebarContentPanel === PANELS.SHARED_NOTES
    && sidebarContentPanel !== PANELS.SHARED_NOTES)
    || (prevIsPinned && !isPinned);

  if ((notesOpen || notesClosed) && unread) {
    markNotesAsRead();
  }
  if (!unread && hasUnreadNotes) {
    setUnread(true);
  }
  if (unread && !hasUnreadNotes) {
    setUnread(false);
  }
  if (prevIsPinned && !isPinned && pinWasNotified) {
    setPinWasNotified(false);
  }

  const renderNotes = () => {
    const showTitle = isPinned ? intl.formatMessage(intlMessages.sharedNotesPinned)
      : intl.formatMessage(intlMessages.sharedNotes);
    return (
      <TooltipContainer
        title={showTitle}
        position="right"
      >
        {/* @ts-ignore */}
        <Styled.ListItem
          id="shared-notes-toggle-button"
          aria-label={showTitle}
          aria-describedby="lockedNotes"
          role="button"
          tabIndex={0}
          active={notesOpen}
          data-test="sharedNotesButton"
          onClick={() => toggleNotesPanel(sidebarContentPanel, layoutContextDispatch)}
          // @ts-ignore
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              toggleNotesPanel(sidebarContentPanel, layoutContextDispatch);
            }
          }}
          hasNotification={unread && !isPinned}
          as={isPinned ? 'button' : 'div'}
          disabled={isPinned || disableNotes}
          $disabled={isPinned || disableNotes}
        >
          <Icon iconName="copy" />
        </Styled.ListItem>
      </TooltipContainer>
    );
  };

  if (!isEnabled) return null;

  return renderNotes();
};

const UserNotesListItemContainerGraphql: React.FC<UserNotesContainerGraphqlProps> = (props) => {
  const { userLocks } = props;
  const disableNotes = userLocks.userNotes;
  const { data: pinnedPadData } = useDeduplicatedSubscription(
    PINNED_PAD_SUBSCRIPTION,
  );
  const NOTES_CONFIG = window.meetingClientSettings.public.notes;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sidebarContent = layoutSelectInput((i: any) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const rev = useRev(NOTES_CONFIG.id);
  const { setNotesLastRev } = useNotesLastRev();

  const hasUnreadNotes = useHasUnreadNotes();
  const markNotesAsRead = () => setNotesLastRev(rev);
  const isEnabled = NotesService.useIsEnabled();
  if (!pinnedPadData) return null;

  const isPinned = !!pinnedPadData && pinnedPadData?.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;
  return (
    <UserNotesGraphql
      disableNotes={disableNotes}
      isPinned={isPinned}
      layoutContextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
      hasUnreadNotes={hasUnreadNotes}
      markNotesAsRead={markNotesAsRead}
      toggleNotesPanel={NotesService.toggleNotesPanel}
      isEnabled={isEnabled}
    />
  );
};

export default lockContextContainer(UserNotesListItemContainerGraphql);
