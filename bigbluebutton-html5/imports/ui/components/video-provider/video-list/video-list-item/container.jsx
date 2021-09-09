import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users/';
import VideoListItem from './component';
import { LayoutContextFunc } from '/imports/ui/components/layout/context';

const VideoListItemContainer = (props) => {
  const { cameraId } = props;

  const { layoutContextSelector } = LayoutContextFunc;
  const fullscreen = layoutContextSelector.select((i) => i.fullscreen);
  const { element } = fullscreen;
  const isFullscreenContext = (element === cameraId);
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

  return (
    <VideoListItem
      {...props}
      {...{
        isFullscreenContext,
        layoutContextDispatch,
      }}
    />
  );
};

export default withTracker((props) => {
  const {
    userId,
  } = props;

  return {
    voiceUser: VoiceUsers.findOne({ intId: userId },
      { fields: { muted: 1, listenOnly: 1, talking: 1 } }),
  };
})(VideoListItemContainer);

VideoListItemContainer.propTypes = {
  cameraId: PropTypes.string.isRequired,
};
