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
import useNotesLastRev from '../../../../notes/hooks/useNotesLastRev';
import useHasUnreadNotes from '../../../../notes/hooks/useHasUnreadNotes';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

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
      // @ts-ignore
      <Styled.ListItem
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
        as={isPinned ? 'button' : 'div'}
        disabled={isPinned}
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
  type PinnedPadData = {
    sharedNotes: Array<{
      sharedNotesExtId: string;
    }>;
  };
  const { userLocks } = props;
  const disableNotes = userLocks.userNotes;
  const [pinnedPadDataState, setPinnedPadDataState] = useState<PinnedPadData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pinnedPadData } = await useDeduplicatedSubscription(
        PINNED_PAD_SUBSCRIPTION,
      );
      setPinnedPadDataState(pinnedPadData || []);
    };

    fetchData();
  }, []);

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;

  const isPinned = !!pinnedPadDataState && pinnedPadDataState.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sidebarContent = layoutSelectInput((i: any) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const rev = useRev(NOTES_CONFIG.id);
  const { setNotesLastRev } = useNotesLastRev();

  const hasUnreadNotes = useHasUnreadNotes();
  const markNotesAsRead = () => setNotesLastRev(rev);
  const isEnabled = NotesService.useIsEnabled();

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

export default lockContextContainer(UserNotesContainerGraphql);
