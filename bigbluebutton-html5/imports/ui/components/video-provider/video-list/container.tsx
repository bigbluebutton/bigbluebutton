import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserCameraHelperInterface, UserCameraHelperItemPosition } from 'bigbluebutton-html-plugin-sdk';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import { useNumberOfPages } from '/imports/ui/components/video-provider/hooks';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import { Layout, Output } from '/imports/ui/components/layout/layoutTypes';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { UpdatedDataForUserCameraDomElement } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DomElementManipulationHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { UserCameraHelperAreas } from '../../plugins-engine/extensible-areas/components/user-camera-helper/types';

interface VideoListContainerProps {
  streams: VideoItem[];
  currentVideoPageIndex: number;
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus: (id: string) => void;
  isGridEnabled: boolean;
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
    onVideoItemMount,
    onVideoItemUnmount,
    onVirtualBgDrop,
  } = props;
  const numberOfPages = useNumberOfPages();

  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);

  const { domElementManipulationIdentifiers } = useContext(PluginsContext);

  const [userCamerasRequestedFromPlugin, setUserCamerasRequestedFromPlugin] = useState<
    UpdatedDataForUserCameraDomElement[]>([]);
  useEffect(() => {
    const dataToSend = userCamerasRequestedFromPlugin.filter((
      userCamera,
    ) => domElementManipulationIdentifiers.USER_CAMERA?.includes(userCamera.streamId));
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<UpdatedDataForUserCameraDomElement[]>>(HookEvents.BBB_CORE_SENT_NEW_DATA, {
        detail: {
          hook: DomElementManipulationHooks.USER_CAMERA,
          data: dataToSend,
        },
      }),
    );
  }, [domElementManipulationIdentifiers, userCamerasRequestedFromPlugin]);

  let pluginUserCameraHelperPerPosition: UserCameraHelperAreas = {} as UserCameraHelperAreas;
  if (pluginsExtensibleAreasAggregatedState.userCameraHelperItems) {
    pluginUserCameraHelperPerPosition = [
      ...pluginsExtensibleAreasAggregatedState.userCameraHelperItems,
    ].reduce((acc, current: UserCameraHelperInterface) => {
      const state = { ...acc };
      switch (current.position) {
        case UserCameraHelperItemPosition.TOP_LEFT:
          state.userCameraHelperTopLeft.push(current);
          break;
        case UserCameraHelperItemPosition.BOTTOM_LEFT:
          state.userCameraHelperBottomLeft.push(current);
          break;
        case UserCameraHelperItemPosition.TOP_RIGHT:
          state.userCameraHelperTopRight.push(current);
          break;
        case UserCameraHelperItemPosition.BOTTOM_RIGHT:
          state.userCameraHelperBottomRight.push(current);
          break;
        default:
          break;
      }
      return state;
    }, {
      userCameraHelperTopLeft: [] as UserCameraHelperInterface[],
      userCameraHelperTopRight: [] as UserCameraHelperInterface[],
      userCameraHelperBottomLeft: [] as UserCameraHelperInterface[],
      userCameraHelperBottomRight: [] as UserCameraHelperInterface[],
    });
  }

  return (
    !streams.length
      ? null
      : (
        <VideoList
          pluginUserCameraHelperPerPosition={pluginUserCameraHelperPerPosition}
          layoutType={layoutType}
          setUserCamerasRequestedFromPlugin={setUserCamerasRequestedFromPlugin}
          layoutContextDispatch={layoutContextDispatch}
          numberOfPages={numberOfPages}
          currentVideoPageIndex={currentVideoPageIndex}
          cameraDock={cameraDock}
          focusedId={focusedId}
          handleVideoFocus={handleVideoFocus}
          isGridEnabled={isGridEnabled}
          streams={streams}
          onVideoItemMount={onVideoItemMount}
          onVideoItemUnmount={onVideoItemUnmount}
          onVirtualBgDrop={onVirtualBgDrop}
        />
      )
  );
};

export default VideoListContainer;
