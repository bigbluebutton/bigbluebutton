import React from 'react';
import { ChatContextProvider } from '/imports/ui/components/chat/chat-context/context';


const providersList = [
  ChatContextProvider,
];

const ContextProvidersComponent = props => providersList.reduce((acc, Component) => (
  <Component>
    {acc}
  </Component>), props.children);

export default ContextProvidersComponent;
