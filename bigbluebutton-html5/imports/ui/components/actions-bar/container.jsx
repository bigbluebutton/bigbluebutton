import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import PresentationService from '/imports/ui/components/presentation/service';
import ActionsBar from './component';
import Service from './service';
import VideoService from '../video-provider/service';
import ExternalVideoService from '/imports/ui/components/external-video-player/service';
import CaptionsService from '/imports/ui/components/captions/service';
import {
  shareScreen, unshareScreen, isVideoBroadcasting, screenShareEndAlert, dataSavingSetting,
} from '../screenshare/service';

import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '../media/service';

const ActionsBarContainer = props => <ActionsBar {...props} />;

export default withTracker(() => {
  const POLLING_ENABLED = Meteor.settings.public.poll.enabled;

  Meetings.find({ meetingId: Auth.meetingID }, { fields: { recordProp: 1 } }).observeChanges({
    changed: (id, fields) => {
      if (fields.recordProp && fields.recordProp.recording) {
        this.window.parent.postMessage({ response: 'recordingStarted' }, '*');
      }

      if (fields.recordProp && !fields.recordProp.recording) {
        this.window.parent.postMessage({ response: 'recordingStopped' }, '*');
      }
    },
  });

  return {
    isUserPresenter: Service.isUserPresenter(),
    isUserModerator: Service.isUserModerator(),
    stopExternalVideoShare: ExternalVideoService.stopWatching,
    handleExitVideo: () => VideoService.exitVideo(),
    handleJoinVideo: () => VideoService.joinVideo(),
    handleShareScreen: onFail => shareScreen(onFail),
    handleUnshareScreen: () => unshareScreen(),
    isVideoBroadcasting: isVideoBroadcasting(),
    recordSettingsList: Service.recordSettingsList(),
    toggleRecording: Service.toggleRecording,
    screenSharingCheck: getFromUserSettings('enableScreensharing', Meteor.settings.public.kurento.enableScreensharing),
    enableVideo: getFromUserSettings('enableVideo', Meteor.settings.public.kurento.enableVideo),
    isLayoutSwapped: getSwapLayout() && shouldEnableSwapLayout(),
    toggleSwapLayout: MediaService.toggleSwapLayout,
    handleTakePresenter: Service.takePresenterRole,
    currentSlidHasContent: PresentationService.currentSlidHasContent(),
    parseCurrentSlideContent: PresentationService.parseCurrentSlideContent,
    isSharingVideo: Service.isSharingVideo(),
    screenShareEndAlert,
    screenshareDataSavingSetting: dataSavingSetting(),
    isCaptionsAvailable: CaptionsService.isCaptionsAvailable(),
    isMeteorConnected: Meteor.status().connected,
    isPollingEnabled: POLLING_ENABLED,
  };
})(injectIntl(ActionsBarContainer));
