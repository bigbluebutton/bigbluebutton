import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { UserCameraHelperButton, UserCameraHelperInterface, UserCameraHelperItemPosition } from 'bigbluebutton-html-plugin-sdk';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import { useNumberOfPages, useGridSize } from '/imports/ui/components/video-provider/hooks';
import { GridItem, VideoItem } from '/imports/ui/components/video-provider/types';
import { Layout, Output } from '/imports/ui/components/layout/layoutTypes';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { UpdatedDataForUserCameraDomElement } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DomElementManipulationHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { UserCameraHelperAreas } from '../../plugins-engine/extensible-areas/components/user-camera-helper/types';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { RaisedHandUser } from '/imports/ui/Types/user';
import { Meeting } from '/imports/ui/Types/meeting';
import { RAISED_HAND_USERS } from '/imports/ui/core/graphql/queries/users';
import { filterByMeetingId } from '/imports/ui/core/utils/subscriptionFilters';
import propsEqualIgnoringFloor from './utils';

interface VideoListContainerProps {
  streams: VideoItem[];
  currentVideoPageIndex: number;
  cameraDock: Output['cameraDock'];
  focusedId: string;
  handleVideoFocus: (id: string) => void;
  isGridEnabled: boolean;
  overflowCount: number;
  overflowUsers: GridItem[];
  onVideoItemMount: (stream: string, video: HTMLVideoElement) => void;
  onVideoItemUnmount: (stream: string) => void;
  onVirtualBgDrop: (stream: string, type: string, name: string, data: string) => Promise<unknown>;
}

// A stable projection lets useMeeting reuse its result across renders.
const projectMeeting = (m: Pick<Partial<Meeting>, 'lockSettings' | 'meetingId'>) => ({
  lockSettings: m.lockSettings,
  meetingId: m.meetingId,
});

const VideoListContainer: React.FC<VideoListContainerProps> = (props) => {
  const layoutType = layoutSelect((i: Layout) => i.layoutType);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const layoutContextDispatch = layoutDispatch();
  const {
    streams,
    cameraDock,
    currentVideoPageIndex,
    focusedId,
    handleVideoFocus,
    isGridEnabled,
    overflowCount,
    overflowUsers,
    onVideoItemMount,
    onVideoItemUnmount,
    onVirtualBgDrop,
  } = props;
  const numberOfPages = useNumberOfPages();
  const gridSize = useGridSize();

  // Read once here rather than per tile: a hand toggle then re-renders only the
  // tiles whose position changed, not every tile's container.
  const { data: currentUserData } = useCurrentUser((user) => ({ locked: user.locked }));
  const { data: currentMeeting } = useMeeting(projectMeeting);
  const { data: raisedHandsData } = useDeduplicatedSubscription<{ user: RaisedHandUser[] }>(RAISED_HAND_USERS);
  const hideUserList = currentUserData?.locked && currentMeeting?.lockSettings?.hideUserList;
  const meetingId = currentMeeting?.meetingId;
  const raisedHandPositions = useMemo(() => {
    const positions = new Map<string, number>();
    if (hideUserList || !meetingId) return positions;
    filterByMeetingId(
      raisedHandsData?.user,
      meetingId,
      RAISED_HAND_USERS,
      (u) => ({ mismatchedUserId: u.userId }),
    ).forEach((user, index) => positions.set(user.userId, index + 1));
    return positions;
  }, [raisedHandsData, hideUserList, meetingId]);

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

  const { userCameraHelperItems } = pluginsExtensibleAreasAggregatedState;
  // Every tile takes this object: a new one per render would re-render them all.
  const pluginUserCameraHelperPerPosition = useMemo<UserCameraHelperAreas>(() => {
    if (!userCameraHelperItems) return {} as UserCameraHelperAreas;

    return [
      ...userCameraHelperItems,
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
  }, [userCameraHelperItems]);

  return (
    !streams.length
      ? null
      : (
        <VideoList
          pluginUserCameraHelperPerPosition={pluginUserCameraHelperPerPosition}
          layoutType={layoutType}
          isRTL={isRTL}
          setUserCamerasRequestedFromPlugin={setUserCamerasRequestedFromPlugin}
          layoutContextDispatch={layoutContextDispatch}
          numberOfPages={numberOfPages}
          currentVideoPageIndex={currentVideoPageIndex}
          cameraDock={cameraDock}
          focusedId={focusedId}
          handleVideoFocus={handleVideoFocus}
          isGridEnabled={isGridEnabled}
          overflowCount={overflowCount}
          overflowUsers={overflowUsers}
          streams={streams}
          onVideoItemMount={onVideoItemMount}
          onVideoItemUnmount={onVideoItemUnmount}
          onVirtualBgDrop={onVirtualBgDrop}
          gridSize={gridSize}
          raisedHandPositions={raisedHandPositions}
        />
      )
  );
};

export default React.memo(
  VideoListContainer,
  propsEqualIgnoringFloor<VideoListContainerProps>(['streams', 'overflowUsers']),
);
