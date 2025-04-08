import { useEffect } from 'react';
import { NotificationEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/notification/enums';
import { makeVar } from '@apollo/client';
import {
  SendNotificationCommandArguments,
  SetEnableDisplayNotificationsArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/notification/types';
import { notify } from '/imports/ui/services/notification';
import { PluginUiCommandNotificationDisplay } from './types';

const handleIsNotificationEnabled = makeVar<PluginUiCommandNotificationDisplay>({ isNotificationEnabled: true });

const PluginNotificationUiCommandsHandler = () => {
  const handleSendNotification = (event: CustomEvent<SendNotificationCommandArguments>) => {
    const { detail: information } = event;
    notify(information.message, information.type,
      information.icon, information.options,
      information.content, information.small);
  };

  const handleSetDisplayNotification = (event: CustomEvent<SetEnableDisplayNotificationsArguments>) => {
    const { detail: isNotificationDisplaying } = event;
    const { isNotificationDisplayEnabled: isNotificationEnabled } = isNotificationDisplaying;
    handleIsNotificationEnabled({ isNotificationEnabled });
  };

  useEffect(() => {
    window.addEventListener(
      NotificationEnum.SEND,
      handleSendNotification as EventListener,
    );
    window.addEventListener(
      NotificationEnum.SET_ENABLED_DISPLAY,
      handleSetDisplayNotification as EventListener,
    );

    return () => {
      window.removeEventListener(
        NotificationEnum.SEND,
        handleSendNotification as EventListener,
      );
      window.removeEventListener(
        NotificationEnum.SET_ENABLED_DISPLAY,
        handleSetDisplayNotification as EventListener,
      );
    };
  }, []);
  return null;
};

export { handleIsNotificationEnabled, PluginNotificationUiCommandsHandler };
