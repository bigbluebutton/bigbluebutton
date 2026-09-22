import { useCallback, useEffect } from 'react';
import { CameraEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/enums';
import { SetCameraFocusCommandArguments, SetSelfViewDisableAllDevicesCommandArguments, SetSelfViewDisableCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/types';
import Session from '/imports/ui/services/storage/in-memory';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import { useStreams } from '../../../video-provider/hooks';
import { layoutDispatch } from '../../../layout/context';
import { ACTIONS } from '../../../layout/enums';
import { INITIAL_INPUT_STATE } from '../../../layout/initState';

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
      const { focus, webcamSelector } = event.detail;

      if (!focus) {
        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: INITIAL_INPUT_STATE.cameraDock.focusedId,
        });
        return;
      }

      if (usersCameras.length < 3) return;

      const userId = webcamSelector.find((selector) => 'userId' in selector)?.userId;
      const streamId = webcamSelector.find((selector) => 'streamId' in selector)?.streamId;
      const camera = userId
        ? usersCameras.find((stream) => stream.userId === userId)
        : usersCameras.find((stream) => stream.stream === streamId);

      if (camera) {
        layoutContextDispatch({
          type: ACTIONS.SET_FOCUSED_CAMERA_ID,
          value: camera.stream,
        });
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
  }, [layoutContextDispatch, usersCameras]);

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
