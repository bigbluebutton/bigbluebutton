import React from 'react';
import VideoList from '/imports/ui/components/video-provider/video-provider-graphql/video-list/component';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import { useNumberOfPages } from '../hooks';
import { StreamUser, VideoItem } from '../types';
import { Layout, Output } from '../../../layout/layoutTypes';

interface VideoListContainerProps {
  streams: VideoItem[];
  swapLayout: boolean;
  currentVideoPageIndex: number;
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus: (id: string) => void;
  isGridEnabled: boolean;
  users: StreamUser[];
  onVideoItemMount: (stream: string, video: HTMLVideoElement) => void;
  onVideoItemUnmount: (stream: string) => void;
  onVirtualBgDrop: (stream: string, type: string, name: string, data: string) => Promise<unknown>;
}

const VideoListContainer: React.FC<VideoListContainerProps> = (props) => {
  const layoutType = layoutSelect((i: Layout) => i.layoutType);
  const layoutContextDispatch = layoutDispatch();
  const {
    streams,
    cameraDock,
    currentVideoPageIndex,
    focusedId,
    handleVideoFocus,
    isGridEnabled,
    swapLayout,
    users,
    onVideoItemMount,
    onVideoItemUnmount,
    onVirtualBgDrop,
  } = props;
  const numberOfPages = useNumberOfPages();

  return (
    !streams.length
      ? null
      : (
        <VideoList
          layoutType={layoutType}
          layoutContextDispatch={layoutContextDispatch}
          numberOfPages={numberOfPages}
          swapLayout={swapLayout}
          currentVideoPageIndex={currentVideoPageIndex}
          cameraDock={cameraDock}
          focusedId={focusedId}
          handleVideoFocus={handleVideoFocus}
          isGridEnabled={isGridEnabled}
          users={users}
          streams={streams}
          onVideoItemMount={onVideoItemMount}
          onVideoItemUnmount={onVideoItemUnmount}
          onVirtualBgDrop={onVirtualBgDrop}
        />
      )
  );
};

export default VideoListContainer;
