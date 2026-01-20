import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation, useQuery } from '@apollo/client';
import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import browserInfo from '/imports/utils/browserInfo';
import Header from '/imports/ui/components/common/control-header/component';
import Button from '/imports/ui/components/common/button/component';
import {
  PANELS, ACTIONS,
} from '/imports/ui/components/layout/enums';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import Styled from './styles';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useMeeting from '../../core/hooks/useMeeting';
import BlockNoteApp from './app/component';
import logger from '/imports/startup/client/logger';
import useCurrentUser from '../../core/hooks/useCurrentUser';
import { User } from '../../Types/user';
import { Meeting } from '../../Types/meeting';
import NotesDropdownContainerGraphql from './dropdown/component';

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
}

interface NotesGraphqlProps extends NotesContainerGraphqlProps {
  handlePinSharedNotes: (pinned: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layoutContextDispatch: (action: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sidebarContent: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shouldShowSharedNotesOnPresentationArea: boolean;
  currentUser: Partial<User> | null;
  currentMeeting?: Partial<Meeting>;
  sessionToken: string | null;
  currentMeetingLoading: boolean;
  currentUserLoading: boolean;
}

const sidebarContentToIgnoreDelay = ['captions'];

const hasSessionToken = (sessionToken?: string | null) => sessionToken !== undefined || sessionToken !== null;
const checkLockReason = (reason: string): boolean => reason === 'Lock rules changed.';

const NotesGraphql: React.FC<NotesGraphqlProps> = (props) => {
  const {
    layoutContextDispatch,
    sidebarContent,
    isToSharedNotesBeShow,
    shouldShowSharedNotesOnPresentationArea,
    currentUser,
    currentMeeting,
    sessionToken,
    currentMeetingLoading,
    currentUserLoading,
    handlePinSharedNotes,
  } = props;
  const [shouldRenderNotes, setShouldRenderNotes] = useState(false);
  const intl = useIntl();

  const { meetingId } = currentMeeting || { meetingId: '' };

  const { disableNotes } = currentMeeting?.lockSettings || { disableNotes: false };

  const { isChrome } = browserInfo;

  const DELAY_UNMOUNT_SHARED_NOTES = window.meetingClientSettings.public.app.delayForUnmountOfSharedNote;

  let timoutRef: NodeJS.Timeout | undefined;
  useEffect(() => {
    if (isToSharedNotesBeShow) {
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
  }, [isToSharedNotesBeShow, sidebarContent.sidebarContentPanel]);

  const [hocuspocusProvider, setHocuspocusProvider] = useState<HocuspocusProvider>();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionClosed, setConnectionClosed] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const handleRetry = () => {
    setError(null);
    setConnectionClosed(false);
    setHocuspocusProvider(undefined);
    setRetryTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    console.log('teste aqui ---> 123', {
      hocuspocusProvider,
      currentMeeting,
      currentUser,
      sessionToken,
      isAuthenticating,
      currentMeetingLoading,
      currentUserLoading,
    });

    if (!hocuspocusProvider
      && !currentMeetingLoading
      && !currentUserLoading
      && hasSessionToken(sessionToken)
      && !isAuthenticating
    ) {
      const documentName = `bn-document__${meetingId}`;
      const blockNoteToken = sessionToken;

      const wsProvider = new HocuspocusProviderWebsocket({
        url: 'wss://bbb30.bbb.imdt.dev/hocuspocus/collaboration',
        maxAttempts: 1,
        parameters: {
          sessionToken,
        },
      });
      console.log('teste aqui --->(abcd) ', blockNoteToken);

      setIsAuthenticating(true);
      const provider = new HocuspocusProvider({
        name: documentName,
        token: blockNoteToken,
        websocketProvider: wsProvider,
        onConnect: () => {
          console.log('teste aquiii --->>asdas', provider);
          setHocuspocusProvider(provider);
          setIsAuthenticating(false);
        },
        onAuthenticated: () => {
          console.log('teste aquiii --->>asdas (1)', provider);
          setIsAuthenticating(false);
        },
        onAuthenticationFailed: (data) => {
          setError('Authentication failed');
          logger.error({
            logCode: 'hocuspocus_authentication_failed',
            extraInfo: {
              reason: data.reason,
              documentId: documentName,
            },
          }, `Authentication failed while trying to connect to hocuspocus server [${data.reason}]`);
        },
        onClose: (data) => {
          logger.debug({
            logCode: 'hocuspocus_closed_connection',
            extraInfo: {
              code: data.event.code,
              reason: data.event.reason,
              documentId: documentName,
            },
          }, `Hocuspocus server closed websocket connection, reason: ${data.event.reason}`);

          const {
            code,
            reason,
          } = data.event;

          if (code === 1008 && checkLockReason(reason)) {
            handleRetry();
          } else {
            setConnectionClosed(true);
            setIsAuthenticating(false);
          }
        },
      });
    }
  }, [retryTrigger, sessionToken, currentMeetingLoading, currentUserLoading]);

  const renderBlockNote = shouldRenderNotes && !error && !isAuthenticating
    && hocuspocusProvider && !connectionClosed;

  const hasError = !!error;

  useEffect(() => {
    const hasError = !!error;
    if (hasError) hocuspocusProvider?.destroy();
  }, [error]);

  return (isToSharedNotesBeShow) && (
    <Styled.Notes
      data-test="notes"
      isChrome={isChrome}
    >
      <>
        <h2 className="sr-only">Block Note</h2>
        <Header
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
      {(isAuthenticating && !hasError)
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
  const { isToSharedNotesBeShow } = props;

  const { data: currentMeeting, loading: currentMeetingLoading } = useMeeting((meeting) => ({
    meetingId: meeting.meetingId,
    componentsFlags: meeting.componentsFlags,
    lockSettings: meeting.lockSettings,
  }));

  const { data: currentUser, loading: currentUserLoading } = useCurrentUser((user) => ({
    color: user.color,
    name: user.name,
    isModerator: user.isModerator,
    userLockSettings: user.userLockSettings,
  }));

  // @ts-ignore Until everything in Typescript
  // @ts-ignore Until everything in Typescript
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();

  const { isOpen: isSidebarContentOpen } = sidebarContent;
  const isGridLayout = useStorageKey('isGridEnabled');

  const shouldShowSharedNotesOnPresentationArea = isGridLayout ? !!currentMeeting?.componentsFlags?.isSharedNotesPinned
    && isSidebarContentOpen : !!currentMeeting?.componentsFlags?.isSharedNotesPinned;

  const urlParams = new URLSearchParams(window.location.search);
  const sessionToken = urlParams.get('sessionToken');

  const handlePinSharedNotes = (pinned: boolean) => {
    // TODO: Handle pin flow
    // if (pinned) {
    //   stopExternalVideoShare();
    //   if (isScreenBroadcasting) screenshareHasEnded();
    // }
    // pinSharedNotes({ variables: { pinned, padId } });
    // layoutContextDispatch({
    //   type: ACTIONS.SET_NOTES_IS_PINNED,
    //   value: pinned,
    // });
  };
  return (
    <NotesGraphql
      layoutContextDispatch={layoutContextDispatch}
      sidebarContent={sidebarContent}
      shouldShowSharedNotesOnPresentationArea={shouldShowSharedNotesOnPresentationArea}
      isToSharedNotesBeShow={isToSharedNotesBeShow}
      currentUser={currentUser}
      currentMeeting={currentMeeting}
      handlePinSharedNotes={handlePinSharedNotes}
      currentMeetingLoading={currentMeetingLoading}
      currentUserLoading={currentUserLoading}
      sessionToken={sessionToken}
    />
  );
};

export default BlockNoteContainer;
