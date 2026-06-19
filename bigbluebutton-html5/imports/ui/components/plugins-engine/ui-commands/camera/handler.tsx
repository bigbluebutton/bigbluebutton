import { useCallback, useEffect } from 'react';
import { CameraEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/enums';
import { SetCameraFocusCommandArguments, SetSelfViewDisableAllDevicesCommandArguments, SetSelfViewDisableCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/types';
import Session from '/imports/ui/services/storage/in-memory';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import { useStreams } from '../../../video-provider/hooks';
import { layoutDispatch } from '../../../layout/context';
import { ACTIONS } from '../../../layout/enums';

const DISABLED_CAMS_SESSION_KEY = 'disabledCams';

const PluginCameraUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();
  const currentUserData = useCurrentUser((user) => ({
    userId: user.userId,
    cameras: user.cameras,
  }));

  const usersCameras = useStreams();

  const disabledCams: string[] = (useStorageKey(DISABLED_CAMS_SESSION_KEY, 'session') || []) as string[];

  const handleChangeSelfView = useCallback((isSelfViewDisabled: boolean,
    cameraId: string) => {
    if (isSelfViewDisabled) {
      Session.setItem('disabledCams', [...disabledCams, cameraId]);
    } else {
      Session.setItem('disabledCams', disabledCams.filter((cId: string) => cId !== cameraId));
    }
  }, [disabledCams]);

  useEffect(() => {
    const handleSetSelfViewDisableAllDevices = (event: CustomEvent<SetSelfViewDisableAllDevicesCommandArguments>) => {
      const { isSelfViewDisabledAllDevices } = event.detail;
      const cameras = currentUserData.data?.cameras;
      if (cameras && cameras.length > 0) {
        cameras.forEach((camera) => {
          handleChangeSelfView(isSelfViewDisabledAllDevices, camera.streamId);
        });
      }
    };

    window.addEventListener(
      CameraEnum.SET_SELF_VIEW_DISABLED_ALL_DEVICES,
      handleSetSelfViewDisableAllDevices as EventListener,
    );

    return () => {
      window.removeEventListener(
        CameraEnum.SET_SELF_VIEW_DISABLED_ALL_DEVICES,
        handleSetSelfViewDisableAllDevices as EventListener,
      );
    };
  }, [currentUserData, disabledCams]);

  useEffect(() => {
    const handleSetCameraFocus = (event: CustomEvent<SetCameraFocusCommandArguments>) => {
      const {
        focus,
        webcamSelector,
      } = event.detail;
      const userIds = webcamSelector.filter((selector) => 'userId' in selector).map((selector) => selector.userId);

      const streamIds = webcamSelector.filter((selector) => 'streamId' in selector).map((selector) => selector.streamId);

      if (!focus) {
        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: '',
        });
        return;
      }

      if (userIds.length > 0) {
        const userId = userIds[0];
        const cameras = usersCameras.filter((camera) => camera.userId === userId);
        if (cameras.length > 0 && usersCameras.length >= 3) {
          const camera = cameras[0];
          const cameraId = camera.stream;
          layoutContextDispatch({
            type: ACTIONS.SET_FOCUSED_CAMERA_ID,
            value: cameraId,
          });
        }
      } else if (streamIds.length > 0 && usersCameras.length >= 3) {
        const streamId = streamIds[0];
        const cameras = usersCameras.filter((camera) => camera.stream === streamId);
        if (cameras.length > 0 && usersCameras.length >= 3) {
          const camera = cameras[0];
          const cameraId = camera.stream;
          layoutContextDispatch({
            type: ACTIONS.SET_FOCUSED_CAMERA_ID,
            value: cameraId,
          });
        }
      }
    };

    window.addEventListener(
      CameraEnum.SET_CAMERA_FOCUS,
      handleSetCameraFocus as EventListener,
    );

    return () => {
      window.removeEventListener(
        CameraEnum.SET_CAMERA_FOCUS,
        handleSetCameraFocus as EventListener,
      );
    };
  }, [currentUserData, usersCameras]);

  useEffect(() => {
    const handleSetSelfViewDisable = (event: CustomEvent<SetSelfViewDisableCommandArguments>) => {
      const { isSelfViewDisabled, streamId } = event.detail;
      handleChangeSelfView(isSelfViewDisabled, streamId);
    };

    window.addEventListener(
      CameraEnum.SET_SELF_VIEW_DISABLED,
      handleSetSelfViewDisable as EventListener,
    );

    return () => {
      window.removeEventListener(
        CameraEnum.SET_SELF_VIEW_DISABLED,
        handleSetSelfViewDisable as EventListener,
      );
    };
  }, []);

  return null;
};

export default PluginCameraUiCommandsHandler;
