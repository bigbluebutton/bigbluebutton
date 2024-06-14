import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'radash';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import VideoListItem from './component';
import { VideoItem } from '../../types';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useVoiceUsers from '/imports/ui/components/audio/audio-graphql/hooks/useVoiceUsers';

interface VideoListItemContainerProps {
  numOfStreams: number;
  cameraId: string | null;
  userId: string;
  name: string;
  focused: boolean;
  isStream: boolean;
  onHandleVideoFocus: ((id: string) => void) | null;
  stream: VideoItem;
  onVideoItemUnmount: (stream: string) => void;
  onVirtualBgDrop: (type: string, name: string, data: string) => void;
  onVideoItemMount: (ref: HTMLVideoElement) => void;
}

const VideoListItemContainer: React.FC<VideoListItemContainerProps> = (props) => {
  const {
    cameraId,
    focused,
    isStream,
    name,
    numOfStreams,
    onHandleVideoFocus,
    onVideoItemMount,
    onVideoItemUnmount,
    onVirtualBgDrop,
    stream,
    userId,
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

  const disabledCams = useStorageKey('disabledCams') || [];
  const voiceUsers = useVoiceUsers((v) => ({
    muted: v.muted,
    listenOnly: v.listenOnly,
    talking: v.talking,
    joined: v.joined,
    userId: v.userId,
  }));
  const voiceUser = voiceUsers.data?.find((v) => v.userId === userId);

  if (!user || isEmpty(user)) return null;

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
      voiceUser={voiceUser}
    />
  );
};

export default VideoListItemContainer;

VideoListItemContainer.propTypes = {
  cameraId: PropTypes.string.isRequired,
};
