import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import NotesService from '/imports/ui/components/notes/service';
import { ACTIONS, PANELS } from '../../../layout/enums';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import { useQuery } from '@apollo/client';
import { GET_PAD_ID, GetPadIdQueryResponse } from '../../../notes/queries';

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

interface BNSharedNotesItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sidebarContentPanel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layoutContextDispatch: any;
  disableNotes: boolean;
  isEnabled: boolean;
  isPinned: boolean;
}

const BNSharedNotesItem: React.FC<BNSharedNotesItemProps> = ({
  sidebarContentPanel,
  layoutContextDispatch,
  disableNotes,
  isPinned,
  isEnabled,
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

  return (isEnabled &&
    <Styled.Messages>
      <Styled.Container>
        <Styled.SmallTitle data-test="notesTitle">
          {intl.formatMessage(intlMessages.title)}
        </Styled.SmallTitle>
      </Styled.Container>
      <Styled.ScrollableList>
        <Styled.List>
          <Styled.ListItem
            role="button"
            tabIndex={0}
            active={sidebarContentPanel === PANELS.BN_SHARED_NOTES}
            onClick={toggleBlockNotePanel}
            data-test="blockNoteSidebar"
            // @ts-ignore
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                toggleBlockNotePanel();
              }
            }}
            as={isPinned ? 'button' : 'div'}
            disabled={isPinned}
            $disabled={isPinned}
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

interface BNSharedNotesContainerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userLocks: any;
}

const BNSharedNotesContainer: React.FC<BNSharedNotesContainerProps> = (props) => {
  const { userLocks } = props;
  const disableNotes = userLocks?.userNotes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sidebarContent = layoutSelectInput((i: any) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const {
    data: currentMeeting,
  } = useMeeting((meeting) => ({
    componentsFlags: meeting.componentsFlags,
  }));

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;

  const { data: padIdData } = useQuery<GetPadIdQueryResponse>(
    GET_PAD_ID,
    { variables: { externalId: NOTES_CONFIG.id } },
  );
  const sharedNotesType = padIdData?.sharedNotes?.[0]?.sharedNotesType;

  const isBNSharedNotes = sharedNotesType === 'block-note';

  const isEnabled = NotesService.useIsEnabled() && isBNSharedNotes;

  const isPinned = currentMeeting?.componentsFlags?.isSharedNotesPinned ?? false;
  
  return (
    <BNSharedNotesItem {...{
      layoutContextDispatch,
      sidebarContentPanel,
      disableNotes,
      isPinned,
      isEnabled,
    }}
    />
  );
};

export default lockContextContainer(BNSharedNotesContainer);
