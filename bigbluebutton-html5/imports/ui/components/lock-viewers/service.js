import { makeCall } from '/imports/ui/services/api';

const updateWebcamsOnlyForModerator = webcamsOnlyForModerator => makeCall('toggleWebcamsOnlyForModerator', webcamsOnlyForModerator);

export {
  updateWebcamsOnlyForModerator,
};
