import { useCallback, useEffect } from 'react';
import { CameraEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/enums';
import { SetSelfViewDisableAllDevicesCommandArguments, SetSelfViewDisableCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/types';
import Session from '/imports/ui/services/storage/in-memory';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

const DISABLED_CAMS_SESSION_KEY = 'disabledCams';

const PluginCameraUiCommandsHandler = () => {
  const currentUserData = useCurrentUser((user) => ({
    userId: user.userId,
    cameras: user.cameras,
  }));
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
