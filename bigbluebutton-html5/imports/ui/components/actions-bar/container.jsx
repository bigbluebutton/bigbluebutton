import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import PresentationService from '/imports/ui/components/presentation/service';
import Presentations from '/imports/api/presentations';
import ActionsBar from './component';
import Service from './service';
import VideoService from '../video-provider/service';
import ExternalVideoService from '/imports/ui/components/external-video-player/service';
import CaptionsService from '/imports/ui/components/captions/service';
import ChannelsService from '/imports/ui/components/channels/service';
import Settings from '/imports/ui/services/settings';
import { Session } from 'meteor/session';
import {
  shareScreen,
  unshareScreen,
  isVideoBroadcasting,
  screenShareEndAlert,
  dataSavingSetting,
} from '../screenshare/service';

import MediaService, {
  getSwapLayout,
  shouldEnableSwapLayout,
} from '../media/service';

import AudioManager from '/imports/ui/services/audio-manager';
import AudioModalContainer from '/imports/ui/components/audio/audio-modal/container';
import { withModalMounter } from '/imports/ui/components/modal/service';

const ActionsBarContainer = props => <ActionsBar {...props} />;
const POLLING_ENABLED = Meteor.settings.public.poll.enabled;
const { dataSaving } = Settings;
const { viewParticipantsWebcams, viewScreenshare } = dataSaving;

export default withModalMounter(withTracker(({ mountModal }) => ({
  amIPresenter: Service.amIPresenter(),
  amIModerator: Service.amIModerator(),
  presenter: Service.getPresenter(),
  swapLayout: (getSwapLayout()) && shouldEnableSwapLayout(),
  usersVideo: VideoService.getAllWebcamUsers(),
  singleWebcam: (VideoService.getAllWebcamUsers().length < 2),
  disableVideo: !viewParticipantsWebcams,
  hideOverlay: (VideoService.getAllWebcamUsers().length === 0),
  audioModalIsOpen: Session.get('audioModalIsOpen'),

  inAudio: AudioManager.isConnected && !AudioManager.isEchoTest,
  listenOnly: AudioManager.isConnected && AudioManager.isListenOnly,
  handleJoinAudio: () => (AudioManager.isConnected ? AudioManager.joinListenOnly() : mountModal(<AudioModalContainer />)),
  handleLeaveAudio: () => AudioManager.exitAudio(),

  stopExternalVideoShare: ExternalVideoService.stopWatching,
  handleExitVideo: () => VideoService.exitVideo(),
  handleJoinVideo: () => VideoService.joinVideo(),
  isVideoStreamTransmitting:  VideoService.isVideoStreamTransmitting(),
  isSharingWebCam: VideoService.isSharing(),
  handleShareScreen: onFail => shareScreen(onFail),
  handleUnshareScreen: () => unshareScreen(),
  isVideoBroadcasting: isVideoBroadcasting(),
  screenSharingCheck: getFromUserSettings('bbb_enable_screen_sharing', Meteor.settings.public.kurento.enableScreensharing),
  enableVideo: getFromUserSettings('bbb_enable_video', Meteor.settings.public.kurento.enableVideo),
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
  isThereCurrentPresentation: Presentations.findOne({ meetingId: Auth.meetingID, current: true },
    { fields: {} }),
  allowExternalVideo: Meteor.settings.public.externalVideoPlayer.enabled,
  validateMeetingIsBreakout: ChannelsService.validateMeetingIsBreakout

}))(injectIntl(ActionsBarContainer)));
