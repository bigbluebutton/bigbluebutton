import { useEffect, useState, useContext } from 'react';
import { PluginProvidedStateProps, PluginsProvidedStateMap, PluginProvidedState } from '../types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '../../components-data/plugin-context/context';

const pluginProvidedStateMap: PluginsProvidedStateMap = {};

function mapItemWithId<T extends PluginSdk.PluginProvidedUiItemDescriptor>(item: T, index: number) {
    item.setItemId(`${index}`);
    return item;
}

const PluginProvidedStateComponent = (props: PluginProvidedStateProps) => {
    const { 
        uuid, 
    } = props;
    if (!pluginProvidedStateMap[uuid]) {
        pluginProvidedStateMap[uuid] = {} as PluginProvidedState;
    } 
    const pluginApi: PluginSdk.PluginApi = PluginSdk.getPluginApi(uuid);

    const [presentationToolbarItems, setPresentationToolbarItems] = useState<PluginSdk.PresentationToolbarItem[]>([]);

    const { setProvidedPlugins } = useContext(PluginsContext);

    useEffect(() => {
        // Change this plugin provided toolbar items
        pluginProvidedStateMap[uuid].presentationToolbarItems = presentationToolbarItems;

        // Update context with computed aggregated list of all plugin provided toolbar items
        const pluginsProvidedStateForContext: PluginProvidedState = {} as PluginProvidedState;
        pluginsProvidedStateForContext.presentationToolbarItems = ([] as PluginSdk.PresentationToolbarItem[]).concat(
            ...Object.values(pluginProvidedStateMap).map((pps: PluginProvidedState) => {
                return pps.presentationToolbarItems}));
        setProvidedPlugins( {...pluginsProvidedStateForContext} );

    }, [presentationToolbarItems]);

    pluginApi.setPresentationToolbarItems = (item) => {
        const mappedItem = item.map(mapItemWithId)
        return setPresentationToolbarItems(mappedItem)
    };
    return null;
}

export default PluginProvidedStateComponent
