import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import JoinVideoButton from './component';
import VideoService from '../service';

const JoinVideoOptionsContainer = (props) => {
  const {
    hasVideoStream,
    disableReason,
    status,
    intl,
    ...restProps
  } = props;

  return (
    <JoinVideoButton {...{
      hasVideoStream, disableReason, status, ...restProps,
    }}
    />
  );
};

export default injectIntl(withTracker(() => ({
  hasVideoStream: VideoService.hasVideoStream(),
  disableReason: VideoService.disableReason(),
  status: VideoService.getStatus(),
}))(JoinVideoOptionsContainer));
