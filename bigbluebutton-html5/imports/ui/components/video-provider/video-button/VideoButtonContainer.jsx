import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import VideoButtonView from './VideoButtonView';
import VideoService from '../service';

const JoinVideoOptionsContainer = (props) => {
  const {
    hasVideoStream,
    isDisabled,
    intl,
    mountModal,
    ...restProps
  } = props;

  const mountVideoPreview = () => { mountModal(<VideoPreviewContainer fromInterface />); };

  return (
    <VideoButtonView {...{
      mountVideoPreview, hasVideoStream, isDisabled, ...restProps,
    }}
    />
  );
};

export default withModalMounter(injectIntl(withTracker(() => ({
  hasVideoStream: VideoService.hasVideoStream(),
  isDisabled: VideoService.isDisabled() || !Meteor.status().connected,
}))(JoinVideoOptionsContainer)));
