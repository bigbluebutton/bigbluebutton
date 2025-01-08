import { useEffect } from 'react';
import {
  makeVar,
} from '@apollo/client';
import {
  LayoutEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/layout/enums';
import {
  ChangeEnforcedLayoutCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/layout/types';
import { PluginUiCommandLayout } from './types';

const changeEnforcedLayout = makeVar<PluginUiCommandLayout>({ pluginEnforcedLayout: null });

const PluginLayoutUiCommandsHandler = () => {
  const handleChangeEnforcedLayout = (event: CustomEvent<ChangeEnforcedLayoutCommandArguments>) => {
    changeEnforcedLayout({ pluginEnforcedLayout: event.detail.layoutType });
  };

  useEffect(() => {
    window.addEventListener(
      LayoutEnum.CHANGE_ENFORCED_LAYOUT, handleChangeEnforcedLayout as EventListener,
    );

    return () => {
      window.removeEventListener(
        LayoutEnum.CHANGE_ENFORCED_LAYOUT, handleChangeEnforcedLayout as EventListener,
      );
    };
  }, []);
  return null;
};

export { PluginLayoutUiCommandsHandler, changeEnforcedLayout };
