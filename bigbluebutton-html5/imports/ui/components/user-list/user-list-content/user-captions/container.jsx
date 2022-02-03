import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserCaptionsItem from './component';
import CaptionsService from '/imports/ui/components/captions/service';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';

const Container = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  return <UserCaptionsItem {...{ sidebarContentPanel, layoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  ownedLocales: CaptionsService.getOwnedLocales(),
}))(Container);
