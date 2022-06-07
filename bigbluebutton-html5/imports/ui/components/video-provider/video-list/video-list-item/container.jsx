import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users/';
import Users from '/imports/api/users/';
import VideoListItem from './component';
import LayoutContext from '/imports/ui/components/layout/context';

const VideoListItemContainer = (props) => {
  const { cameraId } = props;
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { fullscreen } = layoutContextState;
  const { element } = fullscreen;
  const isFullscreenContext = (element === cameraId);

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
    user: Users.findOne({ intId: userId },
      { fields: { pin: 1, userId: 1 } }),
  };
})(VideoListItemContainer);

VideoListItemContainer.propTypes = {
  cameraId: PropTypes.string.isRequired,
};
