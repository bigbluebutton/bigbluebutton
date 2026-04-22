import { useEffect } from 'react';
import { CreatePrivateChatCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/chat/types';
import { useMutation } from '@apollo/client';
import {
  ChatCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/chat/enum';
import { CHAT_CREATE_WITH_USER } from '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/user-actions/mutations';

const PluginCreatePrivateChatServerCommandsManager = () => {
  const [chatCreateWithUser] = useMutation(CHAT_CREATE_WITH_USER);

  const handleCreatePrivateChat = ((
    event: CustomEvent<CreatePrivateChatCommandArguments>,
  ) => {
    const { userId } = event.detail;
    chatCreateWithUser({
      variables: {
        userId,
      },
    });
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(ChatCommandsEnum.CREATE_PRIVATE_CHAT, handleCreatePrivateChat);

    return () => {
      window.removeEventListener(ChatCommandsEnum.CREATE_PRIVATE_CHAT, handleCreatePrivateChat);
    };
  }, []);

  return null;
};

export default PluginCreatePrivateChatServerCommandsManager;
