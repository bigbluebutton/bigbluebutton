import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings/';

export default function modifyWBMode(meetingId, whiteboardMode) {
  check(meetingId, String);
  //check(whiteboardId, String);
  check(whiteboardMode, Object);

//console.log("API old", meetingId);
//console.log("API old", Meetings.find().fetch());
//console.log("API old", Meetings.find({meetingId}).fetch());
//console.log("API new", meetingId, whiteboardMode);
  const selector = {
    meetingId,
  };

  const modifier = {
    $set: whiteboardMode,
  };

  try {
    //const { insertedId } = WhiteboardMultiUser.upsert(selector, modifier);
    //if (insertedId) {
    //  Logger.info(`Added whiteboard style flag=${whiteboardMode} whiteboardId=${whiteboardId}`);
    //} else {
    //  Logger.info(`Upserted whiteboard style flag=${whiteboardMode} whiteboardId=${whiteboardId}`);
    //}
    //WhiteboardMultiUser.update(selector, modifier);
    Meetings.update(selector, modifier);
    Logger.info(`Updated whiteboard style flag=${whiteboardMode} for meeting=${meetingId}`);
  } catch (err) {
    Logger.error(`Error while adding an entry to whiteboard style collection: ${err}`);
  }
}
