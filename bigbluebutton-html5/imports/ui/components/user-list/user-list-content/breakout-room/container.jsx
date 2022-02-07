import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from '/imports/ui/components/user-list/service';
import BreakoutRoomItem from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';

const BreakoutRoomContainer = ({ hasBreakoutRoom }) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  return <BreakoutRoomItem {...{ layoutContextDispatch, sidebarContentPanel, hasBreakoutRoom }} />;
};

export default withTracker(() => ({
  hasBreakoutRoom: Service.hasBreakoutRoom(),
}))(BreakoutRoomContainer);
