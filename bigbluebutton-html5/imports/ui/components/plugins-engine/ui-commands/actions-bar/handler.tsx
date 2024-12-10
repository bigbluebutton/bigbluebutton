import { useEffect } from 'react';
import { ActionsBarEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/actions-bar/enums';
import { SetDisplayActionBarCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/actions-bar/types';
import { layoutDispatch } from '../../../layout/context';
import { ACTIONS } from '../../../layout/enums';

const PluginActionsBarUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();

  const handleSetDisplayActionsBar = (event: CustomEvent<SetDisplayActionBarCommandArguments>) => {
    const { displayActionBar } = event.detail;
    layoutContextDispatch({
      type: ACTIONS.SET_HAS_ACTIONBAR,
      value: displayActionBar,
    });
  };

  useEffect(() => {
    window.addEventListener(
      ActionsBarEnum.SET_DISPLAY_ACTIONS_BAR,
      handleSetDisplayActionsBar as EventListener,
    );

    return () => {
      window.removeEventListener(
        ActionsBarEnum.SET_DISPLAY_ACTIONS_BAR,
        handleSetDisplayActionsBar as EventListener,
      );
    };
  }, []);
  return null;
};

export default PluginActionsBarUiCommandsHandler;
