import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  PluginProvidedStateContainerChildProps, PluginProvidedState,
  PluginProvidedStateContainerChild,
} from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const AudioSettingsDropdownPluginStateContainer = ((
  props: PluginProvidedStateContainerChildProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    audioSettingsDropdownItems,
    setAudioSettingsDropdownItems,
  ] = useState<PluginSdk.AudioSettingsDropdownItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].audioSettingsDropdownItems = audioSettingsDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedAudioSettingsDropdownItems = ([] as PluginSdk.AudioSettingsDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.audioSettingsDropdownItems),
    );

    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        audioSettingsDropdownItems: aggregatedAudioSettingsDropdownItems,
      },
    );
  }, [audioSettingsDropdownItems]);

  pluginApi.setAudioSettingsDropdownItems = (items: PluginSdk.AudioSettingsDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.AudioSettingsDropdownItem[];
    return setAudioSettingsDropdownItems(itemsWithId);
  };
  return null;
}) as PluginProvidedStateContainerChild;

export default AudioSettingsDropdownPluginStateContainer;
