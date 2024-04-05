import React from 'react';
import CurrentUserProvider from './current-user';

const providersList = [CurrentUserProvider];

interface CoreProvidersProps {
  children: React.ReactNode;
}

const CoreProviders: React.FC<CoreProvidersProps> = (props) => providersList.reduce(
  (acc, Component) => <Component>{acc}</Component>,
  props.children,
);

export default CoreProviders;
