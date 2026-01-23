import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useMutation } from '@apollo/client';
import { UserCameraHelperButton, UserCameraHelperInterface, UserCameraHelperItemPosition } from 'bigbluebutton-html-plugin-sdk';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import { layoutSelect, layoutDispatch, layoutSelectInput } from '/imports/ui/components/layout/context';
import { useNumberOfPages } from '/imports/ui/components/video-provider/hooks';
import { VideoItem } from '/imports/ui/components/video-provider/types';
import { Layout, Output } from '/imports/ui/components/layout/layoutTypes';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { UpdatedDataForUserCameraDomElement } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/user-camera/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DomElementManipulationHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { UserCameraHelperAreas } from '../../plugins-engine/extensible-areas/components/user-camera-helper/types';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { CAMERA_SET_SHOW_AS_CONTENT } from '/imports/ui/core/graphql/mutations/userMutations';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION, CurrentPresentationPagesSubscriptionResponse } from '/imports/ui/components/whiteboard/queries';

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
  screenShare: unknown;
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
    screenShare,
  } = props;
  
  const {
    data: meeting,
    loading: meetingLoading,
  } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));

  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    isModerator: u.isModerator,
    userId: u.userId,
    presenter: u.presenter,
  }));
  const {
    data: presentationPageData,
  } = useDeduplicatedSubscription<CurrentPresentationPagesSubscriptionResponse>(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );
  const presentationInput = layoutSelectInput((i) => i.presentation);
  const isPresentationOpen = presentationInput?.isOpen ?? true;
  const hasPresentation = !!presentationPageData?.pres_page_curr?.[0]?.presentationId;
  const isPresentationAvailable = hasPresentation && isPresentationOpen;
  const viewersCanSeeViewersScreenShares = meeting?.lockSettings?.viewersCanSeeViewersScreenShares !== false;
  const [cameraSetShowAsContent] = useMutation(CAMERA_SET_SHOW_AS_CONTENT);
  const handleSetStreamAsContent = useCallback((streamId: string, showAsContent: boolean) => {
    if (!streamId) return;
    cameraSetShowAsContent({
      variables: {
        streamId,
        showAsContent,
      },
    });
  }, [cameraSetShowAsContent]);

  const filteredStreams = streams.filter((stream) => {
    const streamUserRole = stream?.user?.role;
    if (stream.userId === currentUser?.userId) return true;
    // Always allow non-screenshare or moderator screenshare or streams without user metadata
    if (stream.contentType !== 'screenshare' || streamUserRole === 'MODERATOR' || !streamUserRole) return true;

    const viewersCanSee = meeting?.lockSettings?.viewersCanSeeViewersScreenShares;

    // Remove viewer→viewer screenshares ONLY if disabled
    if (!viewersCanSee && streamUserRole === 'VIEWER' && !currentUser?.isModerator) {
      return false;
    }

    return true;
  });
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

  return (
    !filteredStreams.length
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
          streams={filteredStreams}
          overflowCount={overflowCount}
          onVideoItemMount={onVideoItemMount}
          onVideoItemUnmount={onVideoItemUnmount}
          onVirtualBgDrop={onVirtualBgDrop}
          screenShare={screenShare}
          currentUserId={currentUser?.userId || ''}
          isCurrentUserPresenter={currentUser?.presenter || false}
          onSetStreamAsContent={handleSetStreamAsContent}
          isPresentationAvailable={isPresentationAvailable}
          viewersCanSeeViewersScreenShares={viewersCanSeeViewersScreenShares}
        />
      )
  );
};

export default VideoListContainer;
