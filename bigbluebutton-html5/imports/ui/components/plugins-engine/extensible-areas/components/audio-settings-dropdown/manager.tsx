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
  ] = useState<PluginSdk.AudioSettingsDropdownInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].audioSettingsDropdownItems = audioSettingsDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedAudioSettingsDropdownItems = ([] as PluginSdk.AudioSettingsDropdownInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.audioSettingsDropdownItems),
    );

    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        audioSettingsDropdownItems: aggregatedAudioSettingsDropdownItems,
      }));
  }, [audioSettingsDropdownItems]);

  pluginApi.setAudioSettingsDropdownItems = (items: PluginSdk.AudioSettingsDropdownInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.AudioSettingsDropdownInterface[];
    setAudioSettingsDropdownItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default AudioSettingsDropdownPluginStateContainer;
