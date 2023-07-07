import { useEffect, useState, useContext } from 'react';
import { PluginProvidedStateProps, PluginProvidedStateStaticData, PluginObjects } from '../types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '../../components-data/plugin-context/context';
import { ProvidedPlugins } from '../../components-data/plugin-context/types';

const pluginsProvidedState: PluginProvidedStateStaticData = {};

const PluginProvidedStateComponent = (props: PluginProvidedStateProps) => {
    const { 
        uuid, 
    } = props;
    if (!pluginsProvidedState[uuid]) {
        pluginsProvidedState[uuid] = {} as PluginObjects;
    } 
    const pluginApi = PluginSdk.getPluginApi(uuid);

    const [whiteboardToolbarItems, setWhiteboardToolbarItems] = useState<PluginSdk.WhiteboardToolbarItem[]>([]);

    const { setProvidedPlugins } = useContext(PluginsContext);

    useEffect(() => {
        // Change this plugin provided toolbar items
        pluginsProvidedState[uuid].whiteboardToolbarItems = whiteboardToolbarItems;

        // Update context with computed aggregated list of all plugin provided toolbar items
        const pluginsProvidedStateForContext: ProvidedPlugins = {} as ProvidedPlugins;
        pluginsProvidedStateForContext.whiteboardToolbarItems = ([] as PluginSdk.WhiteboardToolbarItem[]).concat(
            ...Object.values(pluginsProvidedState).map((pps: PluginObjects) => {
                console.log
                return pps.whiteboardToolbarItems}));
        setProvidedPlugins( {...pluginsProvidedStateForContext} );

    }, [whiteboardToolbarItems]);

    pluginApi.setWhiteboardToolbarItems = (item) => {
        return setWhiteboardToolbarItems(item)
    };
    return null;
}

export default PluginProvidedStateComponent
