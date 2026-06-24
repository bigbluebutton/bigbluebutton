import { useEffect } from 'react';
import {
  makeVar,
} from '@apollo/client';
import {
  LayoutEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/layout/enums';
import {
  ChangeEnforcedLayoutCommandArguments, SetEnforcedLayoutCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/layout/types';
import { PluginUiCommandLayout } from './types';

const setEnforcedLayout = makeVar<PluginUiCommandLayout>({ pluginEnforcedLayout: null });

const PluginLayoutUiCommandsHandler = () => {
  // Change Enforced Layout is deprecated. We maintain its handler only for backwards compatibility
  const handleChangeEnforcedLayout = (event: CustomEvent<ChangeEnforcedLayoutCommandArguments>) => {
    setEnforcedLayout({ pluginEnforcedLayout: event.detail.layoutType });
  };
  const handleSetEnforcedLayout = (event: CustomEvent<SetEnforcedLayoutCommandArguments>) => {
    setEnforcedLayout({ pluginEnforcedLayout: event.detail.layoutType });
  };

  useEffect(() => {
    window.addEventListener(
      LayoutEnum.CHANGE_ENFORCED_LAYOUT, handleChangeEnforcedLayout as EventListener,
    );
    window.addEventListener(
      LayoutEnum.SET_ENFORCED_LAYOUT, handleSetEnforcedLayout as EventListener,
    );

    return () => {
      window.removeEventListener(
        LayoutEnum.CHANGE_ENFORCED_LAYOUT, handleChangeEnforcedLayout as EventListener,
      );
      window.removeEventListener(
        LayoutEnum.SET_ENFORCED_LAYOUT, handleSetEnforcedLayout as EventListener,
      );
    };
  }, []);
  return null;
};

export { PluginLayoutUiCommandsHandler, setEnforcedLayout };
