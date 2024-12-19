import { useEffect } from 'react';
import { NavBarEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/nav-bar/enums';
import { SetDisplayNavBarCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/nav-bar/types';
import { layoutDispatch } from '../../../layout/context';
import { ACTIONS } from '../../../layout/enums';

const PluginNavBarUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();

  const handleSetDisplayNavBar = (event: CustomEvent<SetDisplayNavBarCommandArguments>) => {
    const { displayNavBar } = event.detail;
    layoutContextDispatch({
      type: ACTIONS.SET_HAS_NAVBAR,
      value: displayNavBar,
    });
  };

  useEffect(() => {
    window.addEventListener(
      NavBarEnum.SET_DISPLAY_NAV_BAR,
      handleSetDisplayNavBar as EventListener,
    );

    return () => {
      window.removeEventListener(
        NavBarEnum.SET_DISPLAY_NAV_BAR,
        handleSetDisplayNavBar as EventListener,
      );
    };
  }, []);
  return null;
};

export default PluginNavBarUiCommandsHandler;
