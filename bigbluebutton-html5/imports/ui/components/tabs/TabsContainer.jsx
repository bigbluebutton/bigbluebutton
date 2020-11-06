import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ExternalVideoService from '/imports/ui/components/external-video-player/service';
import PresentationService from '../presentation/presentation-uploader/service';

import TabsView from './TabsView';

const TabsContainer = props => (
  <TabsView
    {...props}
  />
);

export default withModalMounter(withTracker(() => ({
  amIPresenter: Service.amIPresenter(),
  amIModerator: Service.amIModerator(),
  allowExternalVideo: Meteor.settings.public.externalVideoPlayer.enabled,
  handleTakePresenter: Service.takePresenterRole,
  isSharingVideo: Service.isSharingVideo(),
  stopExternalVideoShare: ExternalVideoService.stopWatching,
  isMeteorConnected: Meteor.status().connected,
  presentations: PresentationService.getPresentations(),
}))(TabsContainer));
