import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import JoinVideoOptions from './component';
import VideoMenuService from './service';

const intlMessages = defineMessages({
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
  swapCam: {
    id: 'app.video.swapCam',
    description: 'Swap cam button label',
  },
  swapCamDesc: {
    id: 'app.video.swapCamDesc',
    description: 'Swap cam button description',
  },
});

const JoinVideoOptionsContainer = (props) => {
  const {
    isSharingVideo,
    isDisabled,
    handleJoinVideo,
    handleCloseVideo,
    toggleSwapLayout,
    swapLayoutAllowed,
    baseName,
    intl,
    mountModal,
    ...restProps
  } = props;

  const mountPreview = () => { mountModal(<VideoPreviewContainer />); };

  return <JoinVideoOptions {...{ handleJoinVideo: mountPreview, handleCloseVideo, isSharingVideo, ...restProps }} />;
};

export default withModalMounter(injectIntl(withTracker(() => ({
  baseName: VideoMenuService.baseName,
  isSharingVideo: VideoMenuService.isSharingVideo(),
  isDisabled: VideoMenuService.isDisabled(),
  videoShareAllowed: VideoMenuService.videoShareAllowed(),
  toggleSwapLayout: VideoMenuService.toggleSwapLayout,
  swapLayoutAllowed: VideoMenuService.swapLayoutAllowed(),
}))(JoinVideoOptionsContainer)));
