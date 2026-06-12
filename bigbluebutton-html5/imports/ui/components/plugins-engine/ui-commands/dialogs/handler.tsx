import { useEffect } from 'react';
import { makeVar } from '@apollo/client';
import { DialogsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/dialogs/enums';
import { SetHideDialogsCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/dialogs/types';

const setHideDialogs = makeVar<boolean>(false);

const PluginDialogsUiCommandsHandler = () => {
  const handleSetHideDialogs = (event: CustomEvent<SetHideDialogsCommandArguments>) => {
    const { hidden } = event.detail;
    setHideDialogs(hidden);
  };

  useEffect(() => {
    window.addEventListener(
      DialogsEnum.SET_HIDE_DIALOGS,
      handleSetHideDialogs as EventListener,
    );

    return () => {
      window.removeEventListener(
        DialogsEnum.SET_HIDE_DIALOGS,
        handleSetHideDialogs as EventListener,
      );
    };
  }, []);
  return null;
};

export { PluginDialogsUiCommandsHandler, setHideDialogs };
