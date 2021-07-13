import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users/';
import VideoListItem from './component';
import { NLayoutContext } from '/imports/ui/components/layout/context/context';

const VideoListItemContainer = (props) => {
  const { cameraId } = props;
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { layoutLoaded: layoutManagerLoaded } = newLayoutContextState;
  const { layoutLoaded, fullscreen } = newLayoutContextState;
  const { element } = fullscreen;
  const isFullscreenContext = (element === cameraId);

  return (
    <VideoListItem
      {...props}
      {...{
        layoutManagerLoaded,
        isFullscreenContext,
        newLayoutContextDispatch,
        layoutLoaded,
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
