import React, { useCallback, useState, memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import NotesService from '/imports/ui/components/notes/service';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import { PANELS } from '/imports/ui/components/layout/enums';
import { notify } from '/imports/ui/services/notification';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import Styled from './styles';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import useHasUnreadNotes from '/imports/ui/components/notes/hooks/useHasUnreadNotes';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sidebarContentPanel: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layoutContextDispatch: any,
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
    let notification = null;
    if (hasUnreadNotes) {
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
      // @ts-ignore
      <Styled.ListItem
        aria-label={showTitle}
        aria-describedby="lockedNotes"
        role="button"
        tabIndex={0}
        active={notesOpen}
        aria-expanded={notesOpen}
        data-test="sharedNotesButton"
        onClick={onClick}
        // @ts-ignore
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onClick();
          }
        }}
        as={isPinned ? 'button' : 'div'}
        $disabled={isPinned}
      >
        {/* @ts-ignore */}
        <Icon iconName="copy" />
        <div aria-hidden>
          <Styled.NotesTitle data-test="sharedNotes">
            { showTitle }
          </Styled.NotesTitle>
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
          {isPinned
            ? (
              <span className="sr-only">{`${intl.formatMessage(intlMessages.disabled)}`}</span>
            ) : null}
        </div>
        {notification}
      </Styled.ListItem>
    );
  };

  if (!isEnabled) return null;

  return (
    <Styled.Messages>
      <Styled.Container>
        <Styled.SmallTitle data-test="notesTitle">
          {intl.formatMessage(intlMessages.title)}
        </Styled.SmallTitle>
      </Styled.Container>
      <Styled.ScrollableList>
        <Styled.List>
          {renderNotes()}
        </Styled.List>
      </Styled.ScrollableList>
    </Styled.Messages>
  );
};

const UserNotesContainerGraphql: React.FC<UserNotesContainerGraphqlProps> = (props) => {
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
      disableNotes={disableNotes}
      isPinned={isPinned}
      layoutContextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
      toggleNotesPanel={NotesService.toggleNotesPanel}
      isEnabled={isEnabled}
    />
  );
};

export default lockContextContainer(memo(UserNotesContainerGraphql));
