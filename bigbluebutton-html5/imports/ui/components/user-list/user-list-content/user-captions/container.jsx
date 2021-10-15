import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserCaptionsItem from './component';
import CaptionsService from '/imports/ui/components/captions/service';
import LayoutContext from '/imports/ui/components/layout/context';

const Container = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { input } = layoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;

  return <UserCaptionsItem {...{ sidebarContentPanel, layoutContextDispatch, ...props }} />;
};

export default withTracker(() => ({
  ownedLocales: CaptionsService.getOwnedLocales(),
}))(Container);
