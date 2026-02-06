/* eslint-disable import/extensions */
import * as React from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import * as BlockNoteLocales from '@blocknote/core/locales';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useCreateBlockNote } from '@blocknote/react';
import Styled from './styles';
import Button from '/imports/ui/components/common/button/component';
import { User } from '../../Types/user';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { useBlockNoteLocaleLanguage, useHocuspocusProvider } from './hooks';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '../../core/hooks/useCurrentUser';

interface BlockNoteAppProps {
  hocuspocusProvider: HocuspocusProvider;
  currentUser: Partial<User> | null;
  disableNotes: boolean;
}

function BlockNoteApp(props: BlockNoteAppProps): React.ReactElement {
  const {
    hocuspocusProvider,
    currentUser,
    disableNotes,
  } = props;

  const blockNoteLocale = useBlockNoteLocaleLanguage();

  // Remove Media block types for now
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    audio, image, file, video, ...remainingBlockSpecs
  } = defaultBlockSpecs;

  const schema = BlockNoteSchema.create({
    blockSpecs: {
      ...remainingBlockSpecs,
    },
  });

  const {
    color: userColor,
    name: userName,
    isModerator: currentUserIsModerator,
    locked: currentUserIsLocked,
  } = currentUser || {
    color: '',
    name: '',
    isModerator: false,
    locked: true,
  };

  const fragment = hocuspocusProvider.document.getXmlFragment('doc');

  const editor = useCreateBlockNote({
    collaboration: {
      provider: hocuspocusProvider,
      fragment,
      user: {
        name: userName || '',
        color: userColor || '',
      },
    },
    schema,
    dictionary: {
      ...BlockNoteLocales[blockNoteLocale],
      placeholders: {
        ...BlockNoteLocales[blockNoteLocale],
        // Override the placeholders to prevent line wrapping in the narrow panel
        emptyDocument: '',
        default: '',
        heading: '',
      },
    },
  }, [blockNoteLocale]);

  const editable = !disableNotes || !currentUserIsLocked || currentUserIsModerator;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>
        {`
          .bn-collaboration-cursor__label {
            color: ${colorWhite} !important;
          }
          .bn-collaboration-cursor__caret {
            overflow: visible !important;
          }
          .bn-mantine .bn-suggestion-menu {
            min-width: 300px;
          }
          .bn-editor {
            padding-inline: 35px 25px;
          }
          /* Make the editor fill the available space so clicks below last line focus it */
          .bn-mantine,
          .bn-editor,
          .bn-editor .ProseMirror {
            height: 100%;
          }
          .bn-editor .ProseMirror {
            box-sizing: border-box;
            cursor: text;
          }
          /* Flip labels to below when near top of scroll container */
          .bn-block-group > .bn-block-outer:first-child
            .bn-collaboration-cursor__label {

            top: 1.5em !important;
            bottom: auto !important;
            transform: translateY(0) !important;
          }
        `}
      </style>
      <BlockNoteView
        editable={editable}
        editor={editor}
        theme="light"
      />
    </div>
  );
}

function BlockNoteContainer(): React.ReactElement {
  const {
    error, isAuthenticating, hocuspocusProvider, connectionClosed, handleRetry, isSynced,
  } = useHocuspocusProvider();

  const { data: currentUser } = useCurrentUser((user) => ({
    color: user.color,
    name: user.name,
    isModerator: user.isModerator,
    locked: user.locked,
    userLockSettings: user.userLockSettings,
    presenter: user.presenter,
  }));

  const { data: currentMeeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));

  const { disableNotes } = currentMeeting?.lockSettings || { disableNotes: false };

  const hasError = !!error;

  const renderBlockNote = !error && !isAuthenticating
    && hocuspocusProvider && !connectionClosed && isSynced;
  return (
    <Styled.Notes id="bn-notes-scroll-container">
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
      {renderBlockNote
        && (
          <BlockNoteApp
            disableNotes={disableNotes}
            hocuspocusProvider={hocuspocusProvider}
            currentUser={currentUser}
          />
        )}
    </Styled.Notes>
  );
}

export default BlockNoteContainer;
