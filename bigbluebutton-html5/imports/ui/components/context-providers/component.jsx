import React from 'react';
import { ChatContextProvider } from '/imports/ui/components/components-data/chat-context/context';
import { UsersContextProvider } from '/imports/ui/components/components-data/users-context/context';


const providersList = [
  ChatContextProvider,
  UsersContextProvider,
];

const ContextProvidersComponent = props => providersList.reduce((acc, Component) => (
  <Component>
    {acc}
  </Component>), props.children);

export default ContextProvidersComponent;
