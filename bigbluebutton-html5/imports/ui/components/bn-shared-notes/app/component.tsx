/* eslint-disable import/extensions */
import * as React from 'react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { User } from '../../../Types/user';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

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
  } = currentUser || {
    color: '',
    name: '',
    isModerator: false,
  };

  // const editor = useCreateBlockNote({
  //   collaboration: {
  //     provider: hocuspocusProvider,
  //     fragment: hocuspocusProvider.document.getXmlFragment('doc'),
  //     user: {
  //       name: 'Guilherme',
  //       color: '#ff0000',
  //     },
  //   },
  //   resolveUsers: async (userIds) => userIds.map((userId) => ({
  //     id: userId,
  //     username: 'Guilherme',
  //     avatarUrl: 'https://placehold.co/100x100',
  //   })),
  // });

  const editor = useCreateBlockNote({
    collaboration: {
      provider: hocuspocusProvider,
      fragment: hocuspocusProvider.document.getXmlFragment('doc'),
      user: {
        name: userName || '',
        color: userColor || '',
      },
    },
  });

  const editable = !disableNotes || currentUserIsModerator;
  return (
    <div
      style={{
        overflow: 'auto',
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

export default BlockNoteApp;
