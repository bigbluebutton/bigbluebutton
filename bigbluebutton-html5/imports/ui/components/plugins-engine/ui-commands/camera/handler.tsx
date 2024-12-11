import { useEffect } from 'react';
import { CameraEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/enums';
import { SetSelfViewDisableAllDevicesCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/camera/types';
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
  const handleSetSelfViewDisable = (event: CustomEvent<SetSelfViewDisableAllDevicesCommandArguments>) => {
    const { isSelfViewDisabledAllDevices } = event.detail;
    const cameras = currentUserData.data?.cameras;
    if (cameras && cameras.length > 0) {
      cameras.forEach((camera) => {
        handleChangeSelfView(isSelfViewDisabledAllDevices, camera.streamId);
      });
    }
  };

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
  }, [currentUserData, disabledCams]);
  return null;
};

export default PluginCameraUiCommandsHandler;
