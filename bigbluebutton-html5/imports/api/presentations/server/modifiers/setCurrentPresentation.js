import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

export default function setCurrentPresentation(meetingId, podId, presentationId) {
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

  const oldPresentation = Presentations.findOne(oldCurrent.selector);
  const newPresentation = Presentations.findOne(newCurrent.selector);

  if (oldPresentation) {
    try{
      Presentations.update(oldCurrent.selector, oldCurrent.modifier, {multi: true});
    } catch(e){
      oldCurrent.callback(e);
    }
  }

  if (newPresentation) {
    try{
      Presentations.update(newPresentation._id, newCurrent.modifier);
    } catch(e){
      newCurrent.callback(e);
    }
  }
}
 