import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default async function setCurrentPresentation(meetingId, podId, presentationId) {
  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);

  const oldCurrent = {
    selector: {
      meetingId,
      podId,
      current: true,
      id: {
        $ne: presentationId,
      },
    },
    modifier: {
      $set: { current: false },
    },
    callback: (err) => {
      if (err) {
        Logger.error(`Unsetting the current presentation: ${err}`);
        return;
      }

      Logger.info('Unsetted as current presentation');
    },
  };

  const newCurrent = {
    selector: {
      meetingId,
      podId,
      id: presentationId,
    },
    modifier: {
      $set: { current: true },
    },
    callback: (err) => {
      if (err) {
        Logger.error(`Setting as current presentation id=${presentationId}: ${err}`);
        return;
      }

      Logger.info(`Setted as current presentation id=${presentationId}`);
    },
  };

  const oldPresentation = await Presentations.findOneAsync(oldCurrent.selector);
  const newPresentation = await Presentations.findOneAsync(newCurrent.selector);
// We update it before unset current to avoid the case where theres no current presentation.
  if (newPresentation) {
    try{
      await Presentations.updateAsync(newPresentation._id, newCurrent.modifier);
    } catch(e){
      newCurrent.callback(e);
    }
  }

  if (oldPresentation) {
    try {
      await Presentations.updateAsync(oldCurrent.selector, oldCurrent.modifier, { multi: true });
    } catch (e) {
      oldCurrent.callback(e);
    }
  }

}
