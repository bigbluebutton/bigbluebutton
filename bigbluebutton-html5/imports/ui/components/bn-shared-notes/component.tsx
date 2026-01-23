/* eslint-disable import/extensions */
import * as React from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import { en } from '@blocknote/core/locales';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import Styled from './styles';
import Button from '/imports/ui/components/common/button/component';
import { useCreateBlockNote } from '@blocknote/react';
import { User } from '../../Types/user';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import useHocuspocusProvider from './hooks';
import { useState } from 'react';
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
  console.log('=== BlockNote Document Debug ===');
  console.log('Fragment length:', fragment.length);
  console.log('Fragment toJSON:', JSON.stringify(fragment.toJSON(), null, 2));
  console.log('Fragment toString:', fragment.toString());

  const locale = en;

  const editor = useCreateBlockNote({
    collaboration: {
      provider: hocuspocusProvider,
      fragment,
      user: {
        name: userName || '',
        color: userColor || '',
      },
    },
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        // Override the placeholders to prevent line wrapping in the narrow panel
        emptyDocument: '',
        default: '',
        heading: '',
      },
    },
  });

  const editable = !disableNotes || !currentUserIsLocked || currentUserIsModerator;

  console.log('teste aqui para ver o que acontece ---> ', editable);
  return (
    <div
      style={{
        overflow: 'visible',
        background: 'white',
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <style>
        {`
          .bn-collaboration-cursor__label {
            color: ${colorWhite} !important;
          }
          .bn-mantine .bn-suggestion-menu {
            min-width: 300px;
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
  console.log('teste aqui 123---> ', {
    error, isAuthenticating, hocuspocusProvider, connectionClosed, isSynced, renderBlockNote
  });
  return (
    <Styled.Notes>
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
