import { ChangeEnforcedLayoutTypeEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/layout/enums';

export interface PluginUiCommandLayout {
  pluginEnforcedLayout: ChangeEnforcedLayoutTypeEnum | null;
}
