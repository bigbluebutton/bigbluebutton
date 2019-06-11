import React from 'react';
import LockProvider from './provider';
import LockConsumer from './consumer';

const withProvider = Component => props => (
  <LockProvider {...props}>
    <Component />
  </LockProvider>
);

const withConsumer = Component => LockConsumer(Component);

const withLockContext = Component => withProvider(withConsumer(Component));

export {
  withProvider,
  withConsumer,
  withLockContext,
};
