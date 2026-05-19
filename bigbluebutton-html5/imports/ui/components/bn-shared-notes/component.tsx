/* eslint-disable import/extensions */
import * as React from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import * as BlockNoteLocales from '@blocknote/core/locales';
import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { Awareness } from 'y-protocols/awareness';
import {
  BasicTextStyleButton,
  BlockNoteViewEditor,
  BlockTypeSelect,
  ColorStyleButton,
  FormattingToolbar,
  NestBlockButton,
  UnnestBlockButton,
  useCreateBlockNote,
} from '@blocknote/react';

import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Extension } from '@tiptap/core';
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
import TextAlignSelect from './text-align-select/component';

// Force-retain `Awareness` against a webpack tree-shaking interaction that
// otherwise drops this class while keeping its `extends Observable` expression,
// producing `ReferenceError: observable is not defined` in the minified bundle.
(globalThis as unknown as Record<string, unknown>).bbbAwarenessKeepalive = Awareness;

const maxDocumentCharsPluginKey = new PluginKey('maxDocumentChars');

const createMaxDocumentCharsExtension = (
  maxChars: number,
  onExceed: (charCount: number) => void,
) => Extension.create({
  name: 'bbbMaxDocumentChars',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: maxDocumentCharsPluginKey,
        filterTransaction(tr) {
          if (!tr.docChanged) return true;
          let charCount = 0;
          tr.doc.descendants((node) => {
            if (node.isText) charCount += node.text?.length ?? 0;
          });
          if (charCount > maxChars) {
            onExceed(charCount);
          }
          return charCount <= maxChars;
        },
      }),
    ];
  },
});

// The left margin of the table Block as the first block is buggy when used with static toolbar;
// ideally the fix would come from BlockNote
// (wait for https://github.com/TypeCellOS/BlockNote/issues/2748 to be resolved)
// TODO: After the issue on BlockNote is resolved, update BlockNote and remove the
// fixCursorAtOriginExtension and the fixCursorAtOriginPluginKey
const fixCursorAtOriginPluginKey = new PluginKey('fixCursorAtOrigin');
const fixCursorAtOriginExtension = Extension.create({
  name: 'bbbFixCursorAtOrigin',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: fixCursorAtOriginPluginKey,
        appendTransaction(_transactions, _oldState, newState) {
          const { selection } = newState;
          if (selection.$from.pos > 2 || selection.$to.pos > 2) return null;
          const firstBlockContent = newState.doc.firstChild?.firstChild?.firstChild;
          if (!firstBlockContent || firstBlockContent.type.name !== 'table') return null;
          if (newState.doc.content.size < 1) return null;
          const safeSelection = TextSelection.near(newState.doc.resolve(1), 1);
          if (safeSelection.from === 0) return null;
          return newState.tr.setSelection(safeSelection);
        },
      }),
    ];
  },
});

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

  const STATIC_FORMATTING_TOOLBAR_ENABLED = window.meetingClientSettings
    ?.public?.sharedNotes?.staticFormattingToolbar ?? true;

  const MAX_PASTE_SIZE = MAX_UPDATE_SHARED_NOTES * 1024;

  const intlRef = React.useRef(intl);
  intlRef.current = intl;

  const maxDocumentCharsExtension = React.useMemo(
    () => createMaxDocumentCharsExtension(MAX_DOCUMENT_CHARS, (charCount) => {
      logger.warn({
        logCode: 'max_number_char_typed',
        extraInfo: {
          charCount,
          maxCharCount: MAX_DOCUMENT_CHARS,
        },
      }, 'User typed more characters than allowed');
      notify(intlRef.current.formatMessage(intlMessages.maxCharCountError, {
        maxCharCount: MAX_DOCUMENT_CHARS,
      }), 'warning');
    }),
    [MAX_DOCUMENT_CHARS],
  );

  const editor = useCreateBlockNote({
    tabBehavior: 'prefer-indent',
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
      placeholders: {
        ...BlockNoteLocales[blockNoteLocale as keyof typeof BlockNoteLocales].placeholders,
        // Override the placeholders to allow placeholder only when the document is empty
        emptyDocument: BlockNoteLocales[blockNoteLocale as keyof typeof BlockNoteLocales].placeholders.default,
        default: '',
        heading: '',
      },
    },
    _tiptapOptions: {
      extensions: [maxDocumentCharsExtension, fixCursorAtOriginExtension],
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

  const editable = !disableNotes || !currentUserIsLocked || currentUserIsModerator;

  // When read-only, clear local awareness so the provider's reconnect logic and
  // the 30 s refresh timer do not re-broadcast this user's cursor/presence.
  // setLocalState(null) also makes all future setLocalStateField calls no-ops,
  // so y-prosemirror and BlockNote cannot re-populate the state either.
  //
  // When editable again, restore awareness if it is still null. This handles a
  // race where the new provider syncs before GraphQL delivers the lock-removal
  // update: the useEffect fires with editable=false on the fresh Awareness,
  // nulling it out; later editable flips to true but BlockNote's init already
  // ran, so we must re-seed the state ourselves.
  React.useEffect(() => {
    const { awareness } = hocuspocusProvider;
    if (!awareness) return;
    if (!editable) {
      awareness.setLocalState(null);
    } else if (awareness.getLocalState() === null) {
      awareness.setLocalState({
        user: { name: userName || '', color: userColor || '' },
      });
    }
  }, [editable, hocuspocusProvider.awareness, userName, userColor]);

  // Keep the editor's focus/selection when tapping a toolbar button by
  // cancelling the default focus move on mousedown.
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return undefined;
    const handler = (e: MouseEvent) => e.preventDefault();
    el.addEventListener('mousedown', handler);
    return () => el.removeEventListener('mousedown', handler);
  }, [editable]);

  // Keep editor focus when clicking SideMenu/DragHandleMenu items.
  // Skip draggable="true" elements — preventDefault on mousedown prevents drag.
  React.useEffect(() => {
    const { portalElement } = editor;
    const mousedownHandler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[draggable="true"]')) return;
      e.preventDefault();
      editor.focus();
    };
    // dragend bubbles from the drag handle after the drop — restore focus.
    const dragendHandler = () => editor.focus();
    portalElement.addEventListener('mousedown', mousedownHandler);
    portalElement.addEventListener('dragend', dragendHandler);
    return () => {
      portalElement.removeEventListener('mousedown', mousedownHandler);
      portalElement.removeEventListener('dragend', dragendHandler);
    };
  }, [editor]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>
        {`
          .bn-toolbar-row .mantine-Button-label {
            display: none;
          }
          .bn-toolbar-row .mantine-Button-inner > .mantine-Button-section {
            margin: 0;
          }
          .bn-toolbar-row [data-with-left-section] {
            padding: 0 .25rem
          }
          .bn-collaboration-cursor__label {
            color: ${colorWhite} !important;
          }
          .bn-collaboration-cursor__caret {
            overflow: visible !important;
          }
          .bn-mantine .bn-suggestion-menu {
            min-width: 300px;
          }
          /* Toolbar and editor are siblings inside .bn-container. DOM order matches
             visual order (toolbar first, editor second), so tab order is correct. */
          .bn-container {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .bn-mantine button, .bn-mantine select {
            height: 100%;
          }
          .bn-toolbar-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 4px;
            padding-block: 4px;
            flex-shrink: 0;
            border-bottom: 1px solid #d4d9df;
          }
          .bn-toolbar-row .bn-formatting-toolbar {
            box-shadow: none;
            border: none;
            padding: 0;
          }
          .bn-toolbar-row [data-test="colors"] .bn-color-icon {
            font-weight: 700;
          }
          .bn-toolbar-row [data-test="colors"] .bn-color-icon[data-text-color="default"] {
            color: #2f80ed;
          }

          /* BEGIN TEMPORARY STYLE TO FIX BLOCKNOTE ISSUE */
          */ track https://github.com/TypeCellOS/BlockNote/issues/2732 */
          .bn-color-icon[data-text-color="gray"] { color: var(--bn-colors-highlights-gray-text); }
          .bn-color-icon[data-text-color="brown"] { color: var(--bn-colors-highlights-brown-text); }
          .bn-color-icon[data-text-color="red"] { color: var(--bn-colors-highlights-red-text); }
          .bn-color-icon[data-text-color="orange"] { color: var(--bn-colors-highlights-orange-text); }
          .bn-color-icon[data-text-color="yellow"] { color: var(--bn-colors-highlights-yellow-text); }
          .bn-color-icon[data-text-color="green"] { color: var(--bn-colors-highlights-green-text); }
          .bn-color-icon[data-text-color="blue"] { color: var(--bn-colors-highlights-blue-text); }
          .bn-color-icon[data-text-color="purple"] { color: var(--bn-colors-highlights-purple-text); }
          .bn-color-icon[data-text-color="pink"] { color: var(--bn-colors-highlights-pink-text); }
          .bn-color-icon[data-background-color="gray"]
            { background-color: var(--bn-colors-highlights-gray-background); }
          .bn-color-icon[data-background-color="brown"]
            { background-color: var(--bn-colors-highlights-brown-background); }
          .bn-color-icon[data-background-color="red"]
            { background-color: var(--bn-colors-highlights-red-background); }
          .bn-color-icon[data-background-color="orange"]
            { background-color: var(--bn-colors-highlights-orange-background); }
          .bn-color-icon[data-background-color="yellow"]
            { background-color: var(--bn-colors-highlights-yellow-background); }
          .bn-color-icon[data-background-color="green"]
            { background-color: var(--bn-colors-highlights-green-background); }
          .bn-color-icon[data-background-color="blue"]
            { background-color: var(--bn-colors-highlights-blue-background); }
          .bn-color-icon[data-background-color="purple"]
            { background-color: var(--bn-colors-highlights-purple-background); }
          .bn-color-icon[data-background-color="pink"]
            { background-color: var(--bn-colors-highlights-pink-background); }
          /* END TEMPORARY STYLE TO FIX BLOCKNOTE ISSUE */

          .bn-editor {
            padding-inline: 35px 25px;
            font-size: 1rem;
            box-sizing: border-box;
            cursor: text;
            flex: 1 1 0;
            min-height: 0;
            overflow-y: auto;
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
        formattingToolbar={!STATIC_FORMATTING_TOOLBAR_ENABLED}
        renderEditor={false}
      >
        {STATIC_FORMATTING_TOOLBAR_ENABLED && editable && (
          <div ref={toolbarRef} className="bn-toolbar-row">
            <FormattingToolbar>
              <BlockTypeSelect key="blockTypeSelect" />
              <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
              <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
              <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
              <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
            </FormattingToolbar>
            <FormattingToolbar>
              <ColorStyleButton key="colorStyleButton" />
              <TextAlignSelect key="textAlignSelect" />
              <NestBlockButton key="nestBlockButton" />
              <UnnestBlockButton key="unnestBlockButton" />
            </FormattingToolbar>
          </div>
        )}
        <BlockNoteViewEditor />
      </BlockNoteView>
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
