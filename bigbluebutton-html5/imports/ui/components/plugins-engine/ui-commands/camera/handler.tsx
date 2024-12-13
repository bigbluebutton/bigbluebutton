import { useEffect } from 'react';
import { CameraEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/enums';
import { SetSelfViewDisableAllDevicesCommandArguments, SetSelfViewDisableCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/types';
import Session from '/imports/ui/services/storage/in-memory';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const PluginCameraUiCommandsHandler = () => {
  const currentUserData = useCurrentUser((user) => ({
    userId: user.userId,
    cameras: user.cameras,
  }));
  const disabledCams = (Session.getItem('disabledCams') || []) as string[];
  const handleChangeSelfView = (isSelfViewDisabled: boolean,
    cameraId: string) => {
    if (isSelfViewDisabled) {
      Session.setItem('disabledCams', [...disabledCams, cameraId]);
    } else {
      Session.setItem('disabledCams', disabledCams.filter((cId: string) => cId !== cameraId));
    }
  };
  const handleSetSelfViewDisableAllDevices = (event: CustomEvent<SetSelfViewDisableAllDevicesCommandArguments>) => {
    const { isSelfViewDisabledAllDevices } = event.detail;
    const cameras = currentUserData.data?.cameras;
    if (cameras && cameras.length > 0) {
      cameras.forEach((camera) => {
        handleChangeSelfView(isSelfViewDisabledAllDevices, camera.streamId);
      });
    }
  };

  const handleSetSelfViewDisable = (event: CustomEvent<SetSelfViewDisableCommandArguments>) => {
    const { isSelfViewDisabled, streamId } = event.detail;
    handleChangeSelfView(isSelfViewDisabled, streamId);
  };

  useEffect(() => {
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
