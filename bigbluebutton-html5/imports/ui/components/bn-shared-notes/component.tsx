/* eslint-disable import/extensions */
import * as React from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import * as BlockNoteLocales from '@blocknote/core/locales';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useCreateBlockNote } from '@blocknote/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import Button from '/imports/ui/components/common/button/component';
import { User } from '../../Types/user';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { useBlockNoteLocaleLanguage, useHocuspocusProvider } from './hooks';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '../../core/hooks/useCurrentUser';
import logger from '/imports/startup/client/logger';
import { notify } from '../../services/notification';

const maxDocumentCharsPluginKey = new PluginKey('maxDocumentChars');

const intlMessages = defineMessages({
  payloadSizeError: {
    id: 'app.notes.blocknote.payloadSizeError',
    description: 'Error message for when payload is too large',
  },
  maxCharCountError: {
    id: 'app.notes.blocknote.maxCharCountError',
    description: 'Error message for when number of typed characters exceeds the maximum',
  },
});

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

  const intl = useIntl();

  const blockNoteLocale = useBlockNoteLocaleLanguage();
  const [notificationErrorMessage, setNotificationErrorMessage] = React.useState<string | null>(null);

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

  // kB
  const MAX_UPDATE_SHARED_NOTES = window.meetingClientSettings.public.sharedNotes.maxLengthForContentUpdate;

  const MAX_DOCUMENT_CHARS = window.meetingClientSettings?.public?.sharedNotes?.maxDocumentChars || 99999;

  const MAX_PASTE_SIZE = MAX_UPDATE_SHARED_NOTES * 1024;

  const editor = useCreateBlockNote({
    collaboration: {
      provider: { awareness: hocuspocusProvider.awareness || undefined },
      fragment,
      user: {
        name: userName || '',
        color: userColor || '',
      },
    },
    schema,
    dictionary: {
      ...BlockNoteLocales[blockNoteLocale as keyof typeof BlockNoteLocales],
    },
    pasteHandler: ({ event, defaultPasteHandler }) => {
      try {
        // Get the clipboard data
        const { clipboardData } = event;
        if (!clipboardData) {
          return defaultPasteHandler();
        }

        // Get text content from clipboard
        const textSize = new TextEncoder().encode(clipboardData.getData('text/plain')).length;
        const htmlSize = new TextEncoder().encode(clipboardData.getData('text/html')).length;

        // Calculate the size of the pasted content (use the larger of text or html)
        const pasteSize = Math.max(htmlSize, textSize);

        // Check if paste exceeds size limit
        if (pasteSize > MAX_PASTE_SIZE) {
          logger.warn({
            logCode: 'paste_too_large',
            extraInfo: {
              pasteSize,
              maxSize: MAX_PASTE_SIZE,
            },
          }, `Paste size ${pasteSize} bytes exceeds maximum allowed size of ${MAX_PASTE_SIZE} bytes`);

          // Show error to user
          const sizeKB = (pasteSize / 1024).toFixed(2);
          const maxKB = (MAX_PASTE_SIZE / 1024).toFixed(2);
          setNotificationErrorMessage(intl.formatMessage(intlMessages.payloadSizeError, {
            sizeKB,
            maxKB,
          }));

          // Return false to cancel the paste
          return false;
        }

        // Clear any previous errors
        if (notificationErrorMessage) {
          setNotificationErrorMessage(null);
        }

        // Allow the paste
        return defaultPasteHandler();
      } catch (error) {
        logger.error({
          logCode: 'paste_handler_error',
          extraInfo: { error },
        }, 'Error in paste handler');
        return defaultPasteHandler();
      }
    },
  }, [blockNoteLocale, notificationErrorMessage]);

  React.useEffect(() => {
    const tiptapEditor = Reflect.get(editor, '_tiptapEditor') as {
      registerPlugin: (plugin: Plugin) => void;
      unregisterPlugin: (key: PluginKey) => void;
    };
    if (!tiptapEditor) return () => {};
    const plugin = new Plugin({
      key: maxDocumentCharsPluginKey,
      filterTransaction(tr) {
        if (!tr.docChanged) return true;
        let charCount = 0;
        tr.doc.descendants((node) => {
          if (node.isText) charCount += node.text?.length ?? 0;
        });
        if (charCount > MAX_DOCUMENT_CHARS) {
          logger.warn({
            logCode: 'max_number_char_typed',
            extraInfo: {
              charCount,
              maxCharCount: MAX_DOCUMENT_CHARS,
            },
          }, 'User typed more characters than allowed');
          notify(intl.formatMessage(intlMessages.maxCharCountError, {
            maxCharCount: MAX_DOCUMENT_CHARS,
          }), 'warning');
        }
        return charCount <= MAX_DOCUMENT_CHARS;
      },
    });
    tiptapEditor.registerPlugin(plugin);
    return () => {
      tiptapEditor.unregisterPlugin(maxDocumentCharsPluginKey);
    };
  }, [editor]);

  const editable = !disableNotes || !currentUserIsLocked || currentUserIsModerator;

  const [isDocumentEmpty, setIsDocumentEmpty] = React.useState(true);

  React.useEffect(() => {
    const checkEmpty = () => {
      const doc = editor.document;
      const firstContent = doc[0]?.content;
      const empty = doc.length === 1 && Array.isArray(firstContent) && firstContent.length === 0;
      setIsDocumentEmpty(empty);
    };
    const unsubscribe = editor.onChange(checkEmpty);
    checkEmpty();
    return unsubscribe;
  }, [editor]);

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
          ${!isDocumentEmpty ? `
          .bn-block-content[data-is-empty-and-focused]::after {
            content: none !important;
          }
          ` : ''}
        `}
      </style>
      {notificationErrorMessage && (
        <Styled.WarningNotificationContainer data-test="noteSizeError">
          <Styled.WaringMessage>{notificationErrorMessage}</Styled.WaringMessage>
          <Button
            label="Dismiss"
            onClick={() => setNotificationErrorMessage(null)}
            color="primary"
            size="sm"
            dataTest="dismissSizeErrorButton"
          />
        </Styled.WarningNotificationContainer>
      )}
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
      {(connectionClosed && !hasError) && (
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
