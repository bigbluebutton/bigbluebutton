import { useEffect } from 'react';
import { NotificationEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/notification/enums';
import { SendNotificationCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/notification/types';
import { notify } from '/imports/ui/services/notification';

const PluginNotificationUiCommandsHandler = () => {
  const handleSendNotification = (event: CustomEvent<SendNotificationCommandArguments>) => {
    const { detail: information } = event;
    notify(information.message, information.type,
      information.icon, information.options,
      information.content, information.small);
  };

  useEffect(() => {
    window.addEventListener(
      NotificationEnum.SEND,
      handleSendNotification as EventListener,
    );

    return () => {
      window.removeEventListener(
        NotificationEnum.SEND,
        handleSendNotification as EventListener,
      );
    };
  }, []);
  return null;
};

export default PluginNotificationUiCommandsHandler;
