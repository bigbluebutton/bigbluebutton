import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginProvidedStateChildrenProps, PluginProvidedState } from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const MicrophoneDropdownPluginStateContainer = (
  props: PluginProvidedStateChildrenProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    microphoneDropdownItems,
    setMicrophoneDropdownItems,
  ] = useState<PluginSdk.MicrophoneDropdownItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].microphoneDropdownItems = microphoneDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedMicrophoneDropdownItems = ([] as PluginSdk.MicrophoneDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.microphoneDropdownItems),
    );

    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        microphoneDropdownItems: aggregatedMicrophoneDropdownItems,
      },
    );
  }, [microphoneDropdownItems]);

  pluginApi.setMicrophoneDropdownItems = (items: PluginSdk.MicrophoneDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.MicrophoneDropdownItem[];
    return setMicrophoneDropdownItems(itemsWithId);
  };
  return null;
};

export default MicrophoneDropdownPluginStateContainer;
