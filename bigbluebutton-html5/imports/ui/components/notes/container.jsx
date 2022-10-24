import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Notes from './component';
import Service from './service';
import { layoutSelectInput, layoutDispatch, layoutSelectOutput } from '../layout/context';

const Container = ({ ...props }) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const sharedNotesOutput = layoutSelectOutput((i) => i.sharedNotes);
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();

  return <Notes {...{
    layoutContextDispatch,
    isResizing,
    sidebarContent,
    sharedNotesOutput,
    ...props
  }} />;
};

export default withTracker(() => {
  const hasPermission = Service.hasPermission();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return {
    hasPermission,
    isRTL,
  };
})(Container);
