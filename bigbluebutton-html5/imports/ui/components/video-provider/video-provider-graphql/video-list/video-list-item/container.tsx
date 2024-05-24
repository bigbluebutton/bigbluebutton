import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import VoiceUsers from '/imports/api/voice-users/';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import VideoListItem from './component';
import { StreamUser, VideoItem } from '../../types';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

type TrackerData = {
  disabledCams: string[];
  user: Partial<StreamUser>;
  stream: VideoItem | undefined;
  voiceUser: {
    muted: boolean;
    listenOnly: boolean;
    talking: boolean;
    joined: boolean;
  };
}

type TrackerProps = {
  user: Partial<StreamUser>;
  numOfStreams: number;
  cameraId: string | null;
  userId: string;
  name: string;
  focused: boolean;
  isStream: boolean;
  onHandleVideoFocus: ((id: string) => void) | null;
  stream: VideoItem;
  onVideoItemUnmount: (stream: string) => void;
  swapLayout: boolean;
  onVirtualBgDrop: (type: string, name: string, data: string) => void;
  onVideoItemMount: (ref: HTMLVideoElement) => void;
}

type VideoListItemContainerProps = TrackerData & Omit<TrackerProps, 'userId'>;

const VideoListItemContainer: React.FC<VideoListItemContainerProps> = (props) => {
  const {
    cameraId,
    disabledCams,
    focused,
    isStream,
    name,
    numOfStreams,
    onHandleVideoFocus,
    onVideoItemMount,
    onVideoItemUnmount,
    onVirtualBgDrop,
    stream,
    user,
    voiceUser,
  } = props;

  const fullscreen = layoutSelect((i: Layout) => i.fullscreen);
  const { element } = fullscreen;
  const isFullscreenContext = (element === cameraId);
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  // @ts-ignore Untyped object
  const { selfViewDisable: settingsSelfViewDisable } = useSettings(SETTINGS.APPLICATION);

  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const amIModerator = currentUserData?.isModerator;

  return (
    <VideoListItem
      {...{
        isFullscreenContext,
        layoutContextDispatch,
        isRTL,
        amIModerator,
      }}
      cameraId={cameraId}
      disabledCams={disabledCams}
      focused={focused}
      isStream={isStream}
      name={name}
      numOfStreams={numOfStreams}
      onHandleVideoFocus={onHandleVideoFocus}
      onVideoItemMount={onVideoItemMount}
      onVideoItemUnmount={onVideoItemUnmount}
      onVirtualBgDrop={onVirtualBgDrop}
      settingsSelfViewDisable={settingsSelfViewDisable}
      stream={stream}
      user={user}
      voiceUser={voiceUser}
    />
  );
};

export default withTracker<TrackerData, TrackerProps>((props) => {
  const {
    userId,
  } = props;

  return {
    voiceUser: VoiceUsers.findOne({ userId },
      {
        fields: {
          muted: 1, listenOnly: 1, talking: 1, joined: 1,
        },
      }),
    disabledCams: Session.get('disabledCams') || [],
  };
})(VideoListItemContainer);

VideoListItemContainer.propTypes = {
  cameraId: PropTypes.string.isRequired,
};
