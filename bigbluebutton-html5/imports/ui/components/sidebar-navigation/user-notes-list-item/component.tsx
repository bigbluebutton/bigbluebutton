import React, { useCallback, useState, memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import KEYS from '/imports/utils/keys';
import Icon from '/imports/ui/components/common/icon/component';
import NotesService from '/imports/ui/components/notes/service';
import { PANELS } from '/imports/ui/components/layout/enums';
import { notify } from '/imports/ui/services/notification';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import Styled from './styles';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import useHasUnreadNotes from '/imports/ui/components/notes/hooks/useHasUnreadNotes';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';

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
    toggleNotesPanel,
  } = props;
  const [pinWasNotified, setPinWasNotified] = useState(false);
  const intl = useIntl();
  const prevIsPinned = usePreviousValue(isPinned);

  const hasUnreadNotes = useHasUnreadNotes();

  if (isPinned && !pinWasNotified) {
    notify(intl.formatMessage(intlMessages.pinnedNotification), 'info', 'copy', { pauseOnFocusLoss: false });
    setPinWasNotified(true);
  }

  const notesOpen = sidebarContentPanel === PANELS.SHARED_NOTES && !isPinned;

  if (prevIsPinned && !isPinned && pinWasNotified) {
    setPinWasNotified(false);
  }

  const onClick = useCallback(() => {
    if (!isPinned) {
      toggleNotesPanel(sidebarContentPanel, layoutContextDispatch);
    }
  }, [isPinned, sidebarContentPanel, layoutContextDispatch, toggleNotesPanel]);

  const renderNotes = () => {
    let tooltipMessage = '';
    if (isPinned) {
      tooltipMessage = intl.formatMessage(intlMessages.sharedNotesPinned);
    } else {
      tooltipMessage = intl.formatMessage(intlMessages.sharedNotes);
    }
    return (
      <TooltipContainer
        title={tooltipMessage}
        position="right"
      >
        {/* @ts-ignore */}
        <Styled.ListItem
          id="shared-notes-toggle-button"
          aria-label={tooltipMessage}
          aria-describedby="lockedNotes"
          role="button"
          tabIndex={0}
          active={notesOpen}
          data-test="sharedNotesSidebarButton"
          onClick={onClick}
          // @ts-ignore
          onKeyDown={(e) => {
            if (e.key === KEYS.ENTER) {
              onClick();
            }
          }}
          hasNotification={hasUnreadNotes}
          $disabled={isPinned}
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
          <Icon iconName="shared_notes" />
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

  const {
    data: currentMeeting,
  } = useMeeting((meeting) => ({
    componentsFlags: meeting.componentsFlags,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sidebarContent = layoutSelectInput((i: any) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const isEnabled = NotesService.useIsEnabled();

  const isPinned = currentMeeting?.componentsFlags?.isSharedNotesPinned ?? false;
  return (
    <UserNotesGraphql
      isPinned={isPinned}
      disableNotes={disableNotes}
      layoutContextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
      toggleNotesPanel={NotesService.toggleNotesPanel}
      isEnabled={isEnabled}
    />
  );
};

export default lockContextContainer(memo(UserNotesListItemContainerGraphql));
