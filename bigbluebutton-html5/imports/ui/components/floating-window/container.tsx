import * as React from 'react';
import { useContext } from 'react';
import FloatingWindow from './component';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';

const FloatingWindowContainer = () => {
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let floatingWindows = [] as PluginSdk.FloatingWindowInterface[];
  if (pluginsExtensibleAreasAggregatedState.floatingWindows) {
    floatingWindows = [
      ...pluginsExtensibleAreasAggregatedState.floatingWindows,
    ];
  }
  return floatingWindows.map((item: PluginSdk.FloatingWindowInterface) => {
    const itemToRender: PluginSdk.FloatingWindow = item as PluginSdk.FloatingWindow;
    return (
      <FloatingWindow
        key={itemToRender.id}
        id={itemToRender.id}
        top={itemToRender.top}
        left={itemToRender.left}
        backgroundColor={itemToRender.backgroundColor}
        boxShadow={itemToRender.boxShadow}
        renderFunction={itemToRender.contentFunction}
        isDraggable={itemToRender.movable}
      />
    );
  });
};

export default FloatingWindowContainer;
