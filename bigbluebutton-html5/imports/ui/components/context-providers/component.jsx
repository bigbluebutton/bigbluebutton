import React from 'react';
import { ChatContextProvider } from '/imports/ui/components/components-data/chat-context/context';
import { UsersContextProvider } from '/imports/ui/components/components-data/users-context/context';
import { GroupChatContextProvider } from '/imports/ui/components/components-data/group-chat-context/context';
import { LayoutContextProvider } from '/imports/ui/components/layout/context';
import { JoinContextProvider } from '/imports/ui/components/components-data/join-context/context';

const providersList = [
  ChatContextProvider,
  GroupChatContextProvider,
  UsersContextProvider,
  LayoutContextProvider,
  JoinContextProvider,
];

const ContextProvidersComponent = (props) => providersList.reduce((acc, Component) => (
  <Component>
    {acc}
  </Component>
), props.children);

export default ContextProvidersComponent;
