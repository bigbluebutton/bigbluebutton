import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { notify } from '/imports/ui/services/notification';
import JoinVideoButton from './component';
import VideoButtonService from './service';

import {
  validIOSVersion,
} from '/imports/ui/components/app/service';


const KURENTO_CONFIG = Meteor.settings.public.kurento;
const SKIP_VIDEO_PREVIEW = KURENTO_CONFIG.skipVideoPreview;

const JoinVideoOptionsContainer = (props) => {
  const {
    isSharingVideo,
    isDisabled,
    handleJoinVideo,
    handleCloseVideo,
    baseName,
    intl,
    mountModal,
    isMobileNative,
    ...restProps
  } = props;

  const mountPreview = () => { mountModal(<VideoPreviewContainer />); };

  return !isMobileNative && (
  <JoinVideoButton {...{
    handleJoinVideo: mountPreview, handleCloseVideo, isSharingVideo, isDisabled, ...restProps,
  }}
  />
  );
};

export default withModalMounter(injectIntl(withTracker(() => ({
  baseName: VideoButtonService.baseName,
  isSharingVideo: VideoButtonService.isSharingVideo(),
  isDisabled: VideoButtonService.isDisabled() || !Meteor.status().connected,
  videoShareAllowed: VideoButtonService.videoShareAllowed(),
  isMobileNative: navigator.userAgent.toLowerCase().includes('bbbnative'),
  notify,
  validIOSVersion,
  skipVideoPreviewSettings: SKIP_VIDEO_PREVIEW,
  skipVideoPreviewParameter: getFromUserSettings('bbb_skip_video_preview', false),
}))(JoinVideoOptionsContainer)));
