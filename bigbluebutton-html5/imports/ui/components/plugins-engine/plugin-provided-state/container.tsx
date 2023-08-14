import { useEffect, useState, useContext } from 'react';
import { PluginProvidedStateContainerProps, PluginsProvidedStateMap, PluginProvidedState } from '../types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '../../components-data/plugin-context/context';

const pluginProvidedStateMap: PluginsProvidedStateMap = {};

function setItemId<T extends PluginSdk.PluginProvidedUiItemDescriptor>(item: T, index: number) {
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

    const [presentationToolbarItems, setPresentationToolbarItems] = useState<PluginSdk.PresentationToolbarItem[]>([]);

    const { setPluginProvidedState } = useContext(PluginsContext);

    useEffect(() => {
        // Change this plugin provided toolbar items
        pluginProvidedStateMap[uuid].presentationToolbarItems = presentationToolbarItems;

        // Update context with computed aggregated list of all plugin provided toolbar items
        const pluginsProvidedStateForContext: PluginProvidedState = {} as PluginProvidedState;
        pluginsProvidedStateForContext.presentationToolbarItems = ([] as PluginSdk.PresentationToolbarItem[]).concat(
            ...Object.values(pluginProvidedStateMap).map((pps: PluginProvidedState) => {
                return pps.presentationToolbarItems}));
        setPluginProvidedState( {...pluginsProvidedStateForContext} );

    }, [presentationToolbarItems]);

    pluginApi.setPresentationToolbarItems = (item) => {
        const itemWithId = item.map(setItemId)
        return setPresentationToolbarItems(itemWithId)
    };
    return null;
}

export default PluginProvidedStateContainer
