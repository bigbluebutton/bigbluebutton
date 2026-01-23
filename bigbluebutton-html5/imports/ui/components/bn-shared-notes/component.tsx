import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import {
  screenshareHasEnded,
} from '/imports/ui/components/screenshare/service';
import browserInfo from '/imports/utils/browserInfo';
import Button from '/imports/ui/components/common/button/component';
import {
  PANELS, ACTIONS,
} from '/imports/ui/components/layout/enums';
import { layoutSelectInput, layoutDispatch, layoutSelectOutput } from '/imports/ui/components/layout/context';
import Styled from './styles';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useMeeting from '../../core/hooks/useMeeting';
import BlockNoteApp from './app/component';
import useCurrentUser from '../../core/hooks/useCurrentUser';
import { User } from '../../Types/user';
import { Meeting } from '../../Types/meeting';
import NotesDropdownContainerGraphql from './dropdown/component';
import { PIN_NOTES } from '../notes/mutations';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import { useIsScreenBroadcasting } from '../screenshare/service';
import injectWbResizeEvent from '../presentation/resize-wrapper/component';
import useHocuspocusProvider from './hooks';

const intlMessages = defineMessages({
  hide: {
    id: 'app.notes.hide',
    description: 'Label for hiding shared notes button',
  },
  title: {
    id: 'app.notes.title',
    description: 'Title for the shared notes',
  },
  unpinNotes: {
    id: 'app.notes.notesDropdown.unpinNotes',
    description: 'Label for unpin shared notes button',
  },
});

interface NotesContainerGraphqlProps {
  isToSharedNotesBeShow: boolean;
  area: 'media' | undefined;
}

interface NotesGraphqlProps extends NotesContainerGraphqlProps {
  handlePinSharedNotes: (pinned: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layoutContextDispatch: (action: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sidebarContent: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharedNotesOutput: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shouldShowSharedNotesOnPresentationArea: boolean;
  currentUser: Partial<User> | null;
  currentMeeting?: Partial<Meeting>;
  isRTL: boolean;
  amIPresenter: boolean;
  isResizing: boolean;
}

const sidebarContentToIgnoreDelay = ['captions'];


const NotesGraphql: React.FC<NotesGraphqlProps> = (props) => {
  const {
    layoutContextDispatch,
    sidebarContent,
    isToSharedNotesBeShow,
    shouldShowSharedNotesOnPresentationArea,
    currentUser,
    currentMeeting,
    handlePinSharedNotes,
    area,
    sharedNotesOutput,
    isRTL,
    amIPresenter,
    isResizing,
  } = props;
  const [shouldRenderNotes, setShouldRenderNotes] = useState(false);
  const intl = useIntl();

  const { disableNotes } = currentMeeting?.lockSettings || { disableNotes: false };

  const { isChrome } = browserInfo;
  const isOnMediaArea = area === 'media';

  const DELAY_UNMOUNT_SHARED_NOTES = window.meetingClientSettings.public.app.delayForUnmountOfSharedNote;

  const style = isOnMediaArea ? {
    position: 'absolute',
    ...sharedNotesOutput,
  } : {};

  const isHidden = (isOnMediaArea && (style.width === 0 || style.height === 0))
    || (!isToSharedNotesBeShow
      && !sidebarContentToIgnoreDelay.includes(sidebarContent.sidebarContentPanel))
    || shouldShowSharedNotesOnPresentationArea;

  if (isHidden && !isOnMediaArea) {
    style.padding = 0;
    style.display = 'none';
  }

  let timoutRef: NodeJS.Timeout | undefined;
  useEffect(() => {
    if (isToSharedNotesBeShow || shouldShowSharedNotesOnPresentationArea) {
      setShouldRenderNotes(true);
      clearTimeout(timoutRef!);
    } else {
      timoutRef = setTimeout(() => {
        setShouldRenderNotes(false);
      }, (sidebarContentToIgnoreDelay.includes(sidebarContent.sidebarContentPanel)
        || shouldShowSharedNotesOnPresentationArea)
        ? 0 : DELAY_UNMOUNT_SHARED_NOTES);
    }
    return () => clearTimeout(timoutRef!);
  }, [isToSharedNotesBeShow, shouldShowSharedNotesOnPresentationArea, sidebarContent.sidebarContentPanel]);

  const {
    error, isAuthenticating, hocuspocusProvider, connectionClosed, handleRetry, isSynced,
  } = useHocuspocusProvider();

  const renderBlockNote = shouldRenderNotes && !error && !isAuthenticating
    && hocuspocusProvider && !connectionClosed && isSynced;

  const hasError = !!error;

  useEffect(() => {
    const hasError = !!error;
    if (hasError) hocuspocusProvider?.destroy();
  }, [error]);

  const renderHeaderOnMedia = () => {
    return amIPresenter ? (
      <Styled.Header
        rightButtonProps={{
          'aria-label': intl.formatMessage(intlMessages.unpinNotes),
          'data-test': 'unpinNotes',
          icon: 'close',
          label: intl.formatMessage(intlMessages.unpinNotes),
          onClick: () => {
            handlePinSharedNotes(false);
          },
        }}
      />
    ) : null;
  };

  return (shouldRenderNotes || shouldShowSharedNotesOnPresentationArea) && (
    <Styled.Notes
      data-test="notes"
      isChrome={isChrome}
      style={style}
    >
      {!isOnMediaArea ? (
        <>
          <h2 className="sr-only">{intl.formatMessage(intlMessages.title)}</h2>
          <Styled.Header
            leftButtonProps={{
              onClick: () => {
                layoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                  value: false,
                });
                layoutContextDispatch({
                  type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                  value: PANELS.NONE,
                });
              },
              'data-test': 'hideNotesLabel',
              'aria-label': intl.formatMessage(intlMessages.hide),
              label: intl.formatMessage(intlMessages.title),
            }}
            customRightButton={(
              <NotesDropdownContainerGraphql
                handlePinSharedNotes={handlePinSharedNotes}
              />
            )}
            data-test="notesHeader"
            rightButtonProps={null}
          />
        </>
      ) : renderHeaderOnMedia()}
      {((isAuthenticating || !isSynced) && !hasError && !connectionClosed)
        && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading shared notes...
          </div>
        )}
      {renderBlockNote
        && (
          <BlockNoteApp
            disableNotes={disableNotes}
            hocuspocusProvider={hocuspocusProvider}
            currentUser={currentUser}
          />
        )}
      {(hasError) && (
        <Styled.WarningNotificationContainer data-test="notesError">
          <Styled.ErrorMessage>{error}</Styled.ErrorMessage>
          <Button
            label="Retry"
            onClick={handleRetry}
            color="primary"
            size="md"
            dataTest="notesRetryButton"
          />
        </Styled.WarningNotificationContainer>
      )}
      {(connectionClosed) && (
        <Styled.WarningNotificationContainer data-test="notesError">
          <Styled.WaringMessage>Connection closed.</Styled.WaringMessage>
          <Button
            label="Retry"
            onClick={handleRetry}
            color="primary"
            size="md"
            dataTest="notesRetryButton"
          />
        </Styled.WarningNotificationContainer>
      )}
    </Styled.Notes>
  );
};

const BlockNoteContainer: React.FC<NotesContainerGraphqlProps> = (props) => {
  const { isToSharedNotesBeShow, area } = props;
  const { data: currentMeeting } = useMeeting((meeting) => ({
    meetingId: meeting.meetingId,
    componentsFlags: meeting.componentsFlags,
    lockSettings: meeting.lockSettings,
  }));

  const { data: currentUser } = useCurrentUser((user) => ({
    color: user.color,
    name: user.name,
    isModerator: user.isModerator,
    locked: user.locked,
    userLockSettings: user.userLockSettings,
    presenter: user.presenter,
  }));

  const [pinSharedNotes] = useMutation(PIN_NOTES);
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);
  const isScreenBroadcasting = useIsScreenBroadcasting();

  // @ts-ignore Until everything in Typescript
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  // @ts-ignore Until everything in Typescript
  const sharedNotesOutput = layoutSelectOutput((i) => i.sharedNotes);
  // @ts-ignore Until everything in Typescript
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const amIPresenter = !!currentUser?.presenter;

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const { isOpen: isSidebarContentOpen } = sidebarContent;
  const isGridLayout = useStorageKey('isGridEnabled');

  const shouldShowSharedNotesOnPresentationArea = isGridLayout ? !!currentMeeting?.componentsFlags?.isSharedNotesPinned
    && isSidebarContentOpen : !!currentMeeting?.componentsFlags?.isSharedNotesPinned;

  const handlePinSharedNotes = (pinned: boolean) => {
    if (pinned) {
      stopExternalVideoShare();
      if (isScreenBroadcasting) screenshareHasEnded();
    }
    pinSharedNotes({ variables: { pinned } });
    layoutContextDispatch({
      type: ACTIONS.SET_NOTES_IS_PINNED,
      value: pinned,
    });
  };
  return (
    <NotesGraphql
      layoutContextDispatch={layoutContextDispatch}
      sidebarContent={sidebarContent}
      sharedNotesOutput={sharedNotesOutput}
      area={area}
      shouldShowSharedNotesOnPresentationArea={shouldShowSharedNotesOnPresentationArea}
      isToSharedNotesBeShow={isToSharedNotesBeShow}
      currentUser={currentUser}
      currentMeeting={currentMeeting}
      handlePinSharedNotes={handlePinSharedNotes}
      isRTL={isRTL}
      amIPresenter={amIPresenter}
      isResizing={isResizing}
    />
  );
};

export default injectWbResizeEvent(BlockNoteContainer);
