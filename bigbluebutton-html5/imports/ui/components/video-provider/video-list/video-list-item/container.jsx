import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/voice-users/';
import Users from '/imports/api/users/';
import { isEmpty } from 'radash';
import VideoListItem from './component';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const VideoListItemContainer = (props) => {
  const { cameraId, user } = props;

  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element } = fullscreen;
  const isFullscreenContext = (element === cameraId);
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i) => i.isRTL);

  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const amIModerator = currentUserData?.isModerator;

  if (!user || isEmpty(user)) return null;

  return (
    <VideoListItem
      {...props}
      {...{
        isFullscreenContext,
        layoutContextDispatch,
        isRTL,
        amIModerator,
      }}
    />
  );
};

export default withTracker((props) => {
  const {
    userId,
    users,
    stream,
  } = props;

  const Settings = getSettingsSingletonInstance();

  return {
    settingsSelfViewDisable: Settings.application.selfViewDisable,
    voiceUser: VoiceUsers.findOne({ userId },
      {
        fields: {
          muted: 1, listenOnly: 1, talking: 1, joined: 1,
        },
      }),
    user: (users?.find((u) => u.userId === userId) || {}),
    disabledCams: Session.get('disabledCams') || [],
    stream,
  };
})(VideoListItemContainer);

VideoListItemContainer.propTypes = {
  cameraId: PropTypes.string.isRequired,
};
