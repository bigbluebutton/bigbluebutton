import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import JoinVideoButton from './component';
import VideoService from '../service';

import {
  validIOSVersion,
} from '/imports/ui/components/app/service';

const JoinVideoOptionsContainer = (props) => {
  const {
    hasVideoStream,
    isDisabled,
    handleJoinVideo,
    handleCloseVideo,
    intl,
    mountModal,
    isMobileNative,
    ...restProps
  } = props;

  const mountPreview = () => { mountModal(<VideoPreviewContainer />); };

  return !isMobileNative && (
  <JoinVideoButton {...{
    handleJoinVideo: mountPreview, handleCloseVideo, hasVideoStream, isDisabled, ...restProps,
  }}
  />
  );
};

export default withModalMounter(injectIntl(withTracker(() => ({
  hasVideoStream: VideoService.hasVideoStream(),
  isDisabled: VideoService.isDisabled() || !Meteor.status().connected,
  isMobileNative: navigator.userAgent.toLowerCase().includes('bbbnative'),
  validIOSVersion,
}))(JoinVideoOptionsContainer)));
