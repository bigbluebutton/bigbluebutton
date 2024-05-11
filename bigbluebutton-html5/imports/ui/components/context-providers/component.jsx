import React from 'react';
import { LayoutContextProvider } from '/imports/ui/components/layout/context';
import { CustomBackgroundsProvider } from '/imports/ui/components/video-preview/virtual-background/context';
import { PluginsContextProvider } from '/imports/ui/components/components-data/plugin-context/context';
import CurrentUserProvider from '../../core/providers/current-user';

const providersList = [
  LayoutContextProvider,
  CustomBackgroundsProvider,
  PluginsContextProvider,
  CurrentUserProvider,
];

const ContextProvidersComponent = (props) => providersList.reduce((acc, Component) => (
  <Component>
    {acc}
  </Component>
), props.children);

export default ContextProvidersComponent;
