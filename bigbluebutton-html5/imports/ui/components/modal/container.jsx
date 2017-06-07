import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { getModal } from './service';

export default createContainer(
  () => ({ modalComponent: getModal() }),
  ({ modalComponent }) => modalComponent,
);
