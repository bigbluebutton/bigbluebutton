import * as React from 'react';
import { useContext } from 'react';
import FloatingWindow from './component';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';

const FloatingWindowContainer = () => {
  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let floatingWindowItems = [] as PluginSdk.FloatingWindowItem[];
  if (pluginsExtensibleAreasAggregatedState.floatingWindowItems) {
    floatingWindowItems = [
      ...pluginsExtensibleAreasAggregatedState.floatingWindowItems,
    ];
  }
  return floatingWindowItems.map((item: PluginSdk.FloatingWindowItem) => {
    const itemToRender: PluginSdk.FloatingWindow = item as PluginSdk.FloatingWindow;
    return (
      <FloatingWindow
        key={itemToRender.id}
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
