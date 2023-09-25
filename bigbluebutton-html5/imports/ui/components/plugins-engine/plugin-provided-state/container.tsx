import * as React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  PluginProvidedStateContainerProps, PluginsProvidedStateMap,
  PluginProvidedState, PluginProvidedStateContainerChild,
} from '../types';
import PresentationToolbarPluginStateContainer from './presentation-toolbar/container';
import UserListDropdownPluginStateContainer from './user-list-dropdown/container';
import ActionButtonDropdownPluginStateContainer from './action-button-dropdown/container';
import AudioSettingsDropdownPluginStateContainer from './audio-settings-dropdown/container';
import ActionBarPluginStateContainer from './action-bar/container';

const pluginProvidedStateMap: PluginsProvidedStateMap = {};

const pluginProvidedStateContainers: PluginProvidedStateContainerChild[] = [
  PresentationToolbarPluginStateContainer,
  UserListDropdownPluginStateContainer,
  ActionButtonDropdownPluginStateContainer,
  AudioSettingsDropdownPluginStateContainer,
  ActionBarPluginStateContainer,
];

function generateItemWithId<T extends PluginSdk.PluginProvidedUiItemDescriptor>(
  item: T, index: number,
): T {
  item.setItemId(`${index}`);
  return item;
}

const PluginProvidedStateContainer = (props: PluginProvidedStateContainerProps) => {
  const {
    uuid,
  } = props;
  if (!pluginProvidedStateMap[uuid]) {
    pluginProvidedStateMap[uuid] = {} as PluginProvidedState;
  }
  const pluginApi: PluginSdk.PluginApi = PluginSdk.getPluginApi(uuid);
  return (
    <>
      {
        pluginProvidedStateContainers.map(
          (PluginProvidedStateContainerChildComponent: PluginProvidedStateContainerChild, index: number) => (
            <PluginProvidedStateContainerChildComponent
              {
                ...{
                  key: `${uuid}-${index}`,
                  uuid,
                  generateItemWithId,
                  pluginProvidedStateMap,
                  pluginApi,
                }
              }
            />
          ),
        )
      }
    </>
  );
};

export default PluginProvidedStateContainer;
