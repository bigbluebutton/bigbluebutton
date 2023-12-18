import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const AudioSettingsDropdownPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    audioSettingsDropdownItems,
    setAudioSettingsDropdownItems,
  ] = useState<PluginSdk.AudioSettingsDropdownItem[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].audioSettingsDropdownItems = audioSettingsDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedAudioSettingsDropdownItems = ([] as PluginSdk.AudioSettingsDropdownItem[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.audioSettingsDropdownItems),
    );

    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        audioSettingsDropdownItems: aggregatedAudioSettingsDropdownItems,
      },
    );
  }, [audioSettingsDropdownItems]);

  pluginApi.setAudioSettingsDropdownItems = (items: PluginSdk.AudioSettingsDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.AudioSettingsDropdownItem[];
    return setAudioSettingsDropdownItems(itemsWithId);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default AudioSettingsDropdownPluginStateContainer;
