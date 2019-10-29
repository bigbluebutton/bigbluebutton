import { makeCall } from '/imports/ui/services/api';

const updateLockSettings = lockProps => makeCall('toggleLockSettings', lockProps);

const updateWebcamsOnlyForModerator = webcamsOnlyForModerator => makeCall('toggleWebcamsOnlyForModerator', webcamsOnlyForModerator);

export {
  updateLockSettings,
  updateWebcamsOnlyForModerator,
};
