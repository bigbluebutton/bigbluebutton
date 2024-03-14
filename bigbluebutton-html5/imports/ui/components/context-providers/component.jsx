import React from 'react';
import { UsersContextProvider } from '/imports/ui/components/components-data/users-context/context';
import { LayoutContextProvider } from '/imports/ui/components/layout/context';
import { CustomBackgroundsProvider } from '/imports/ui/components/video-preview/virtual-background/context';
import { PluginsContextProvider } from '/imports/ui/components/components-data/plugin-context/context';

const providersList = [
  UsersContextProvider,
  LayoutContextProvider,
  CustomBackgroundsProvider,
  PluginsContextProvider,
];

const ContextProvidersComponent = (props) => providersList.reduce((acc, Component) => (
  <Component>
    {acc}
  </Component>
), props.children);

export default ContextProvidersComponent;
