import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserCaptionsItem from './component';
import Service from '/imports/ui/components/user-list/service';
import CaptionsService from '/imports/ui/components/captions/service';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';

const Container = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const { roving } = Service;
  return <UserCaptionsItem {...{ sidebarContentPanel, layoutContextDispatch, roving, ...props }} />;
};

export default withTracker(() => ({
  ownedLocales: CaptionsService.getOwnedLocales(),
}))(Container);
