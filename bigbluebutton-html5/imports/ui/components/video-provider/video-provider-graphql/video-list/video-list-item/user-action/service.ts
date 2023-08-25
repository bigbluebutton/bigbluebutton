import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import React from 'react';
import { makeCall } from '/imports/ui/services/api';

export const handleVideoFocus = (id: string, focusedId: string) => {
  const dispatch = layoutDispatch();
  dispatch({
    type: ACTIONS.SET_FOCUSED_CAMERA_ID,
    value: focusedId !== id ? id : false,
  });
};

export const toggleFullscreen = (videoContainer: React.RefObject<HTMLDivElement> | null) => {
  FullscreenService.toggleFullScreen(videoContainer.current);
};

export const toggleVideoPin = (userId: string, userIsPinned: boolean) => {
  makeCall('changePin', userId, !userIsPinned);
};

export default {
  handleVideoFocus,
  toggleFullscreen,
  toggleVideoPin,
};
