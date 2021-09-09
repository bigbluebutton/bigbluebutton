import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserCaptionsItem from './component';
import CaptionsService from '/imports/ui/components/captions/service';
import { LayoutContextFunc } from '../../../layout/context';

const UserCaptionsItemContainer = (props) => {
  const { layoutContextSelector } = LayoutContextFunc;

  const sidebarContent = layoutContextSelector.selectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

  return <UserCaptionsItem {...{ sidebarContentPanel, layoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  ownedLocales: CaptionsService.getOwnedLocales(),
}))(UserCaptionsItemContainer);
