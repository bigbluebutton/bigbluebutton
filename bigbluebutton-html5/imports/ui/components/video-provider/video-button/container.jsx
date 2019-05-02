import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import { notify } from '/imports/ui/services/notification';
import JoinVideoButton from './component';
import VideoButtonService from './service';

import {
  validIOSVersion,
} from '/imports/ui/components/app/service';

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
  isDisabled: VideoButtonService.isDisabled(),
  videoShareAllowed: VideoButtonService.videoShareAllowed(),
  isMobileNative: navigator.userAgent.toLowerCase().includes('bbbnative'),
  notify,
  validIOSVersion,
}))(JoinVideoOptionsContainer)));
