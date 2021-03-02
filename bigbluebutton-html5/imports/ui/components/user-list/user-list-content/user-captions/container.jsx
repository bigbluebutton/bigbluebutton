import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserCaptionsItem from './component';
import CaptionsService from '/imports/ui/components/captions/service';
import NewLayoutContext from '../../../layout/context/context';

const UserCaptionsItemContainer = (props) => {
  const { newLayoutContextState, ...rest } = props;
  const { sidebarContentPanel } = newLayoutContextState;
  return <UserCaptionsItem {...{ sidebarContentPanel, ...rest }} />;
};

export default withTracker(() => ({
  ownedLocales: CaptionsService.getOwnedLocales(),
}))(NewLayoutContext.withConsumer(UserCaptionsItemContainer));
