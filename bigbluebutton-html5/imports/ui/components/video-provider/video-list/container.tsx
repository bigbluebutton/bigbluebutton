import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserCameraHelperButton, UserCameraHelperInterface, UserCameraHelperItemPosition } from 'bigbluebutton-html-plugin-sdk';
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
// useIsSharing: true only when the current user is actively broadcasting a screenshare.
// useIsScreenBroadcasting returns true for all users whenever anyone in the meeting shares.
import { useIsSharing, useScreenshares } from '/imports/ui/components/screenshare/service';
import { ScreenshareResponse } from '/imports/ui/components/screenshare/queries';
import SelfScreenshareDockTile from '/imports/ui/components/screenshare/self-screenshare-dock-tile';
import Auth from '/imports/ui/services/auth';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

interface VideoListContainerProps {
  streams: VideoItem[];
  currentVideoPageIndex: number;
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus: (id: string) => void;
  isGridEnabled: boolean;
  overflowCount: number;
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
    overflowCount,
    onVideoItemMount,
    onVideoItemUnmount,
    onVirtualBgDrop,
  } = props;
  const numberOfPages = useNumberOfPages();
  const isSelfSharing = useIsSharing();
  const screenshares = useScreenshares();
  const { data: currentUser } = useCurrentUser((u) => ({ presenter: u.presenter }));
  const ownShare = isSelfSharing ? screenshares.find((s: ScreenshareResponse) => s.userId === Auth.userID) : null;
  const selfScreenshareTile = isSelfSharing ? (
    <SelfScreenshareDockTile
      streamId={ownShare?.stream}
      showAsContent={ownShare?.showAsContent ?? false}
      isPresenter={currentUser?.presenter ?? false}
    />
  ) : undefined;

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
      const currentButton = current as UserCameraHelperButton;
      switch (current.position) {
        case UserCameraHelperItemPosition.TOP_LEFT:
          state.userCameraHelperTopLeft.push(currentButton);
          break;
        case UserCameraHelperItemPosition.BOTTOM_LEFT:
          state.userCameraHelperBottomLeft.push(currentButton);
          break;
        case UserCameraHelperItemPosition.TOP_RIGHT:
          state.userCameraHelperTopRight.push(currentButton);
          break;
        case UserCameraHelperItemPosition.BOTTOM_RIGHT:
          state.userCameraHelperBottomRight.push(currentButton);
          break;
        default:
          break;
      }
      return state;
    }, {
      userCameraHelperTopLeft: [] as UserCameraHelperButton[],
      userCameraHelperTopRight: [] as UserCameraHelperButton[],
      userCameraHelperBottomLeft: [] as UserCameraHelperButton[],
      userCameraHelperBottomRight: [] as UserCameraHelperButton[],
    });
  }

  if (!streams.length && !selfScreenshareTile) return null;

  return (
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
      overflowCount={overflowCount}
      streams={streams}
      onVideoItemMount={onVideoItemMount}
      onVideoItemUnmount={onVideoItemUnmount}
      onVirtualBgDrop={onVirtualBgDrop}
      selfScreenshareTile={selfScreenshareTile}
    />
  );
};

export default VideoListContainer;
