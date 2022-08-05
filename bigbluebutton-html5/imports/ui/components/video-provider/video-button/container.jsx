import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import JoinVideoButton from './component';
import VideoService from '../service';

const JoinVideoOptionsContainer = (props) => {
  const {
    hasVideoStream,
    disableReason,
    status,
    intl,
    mountModal,
    ...restProps
  } = props;

  const mountVideoPreview = (force, props) => { mountModal(<VideoPreviewContainer forceOpen={force} {...(props || {})} />); };

  return (
    <JoinVideoButton {...{
      mountVideoPreview, hasVideoStream, disableReason, status, ...restProps,
    }}
    />
  );
};

export default withModalMounter(injectIntl(withTracker(() => ({
  hasVideoStream: VideoService.hasVideoStream(),
  disableReason: VideoService.disableReason(),
  status: VideoService.getStatus(),
}))(JoinVideoOptionsContainer)));
