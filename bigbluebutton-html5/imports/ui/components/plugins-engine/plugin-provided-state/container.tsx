import * as React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginProvidedStateContainerProps, PluginsProvidedStateMap, PluginProvidedState } from '../types';
import PresentationToolbarPluginStateContainer from './presentation-toolbar/container';
import UserListDropdownPluginStateContainer from './user-list-dropdown/container';

const pluginProvidedStateMap: PluginsProvidedStateMap = {};

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
  const pluginProvidedStateChildrenProps = {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  };
  return (
    <>
      <PresentationToolbarPluginStateContainer
        { ...pluginProvidedStateChildrenProps}
      />
      <UserListDropdownPluginStateContainer
        { ...pluginProvidedStateChildrenProps}
      />
    </>
  );
};

export default PluginProvidedStateContainer;
