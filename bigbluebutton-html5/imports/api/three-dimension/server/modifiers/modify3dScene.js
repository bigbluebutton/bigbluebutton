import { check } from 'meteor/check';
import Three from '/imports/api/three-dimension';
import Logger from '/imports/startup/server/logger';


export default function modify3dScene(scene) {
  check(scene, {
    id: String,
    content: Object,
  });

  const selector = {

  };


  const modifier = {
    scene,

  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding threeD to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added threeD flag=${multiUser} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted threeD flag=${multiUser} meeting=${meetingId}`);
  };

  return Three.upsert(selector, modifier, cb);
}
