import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

//  Indicates whether a function was called
//  as it toggles on each call
let updateIndicator = true;

const toggleIndicator = () => { updateIndicator = !updateIndicator; };

export default function updateRandomUser(meetingId, choice, requesterId) {
  check(meetingId, String);
  check(choice, String);
  check(requesterId, String);

  toggleIndicator();

  const chosenUser = { choice, updateIndicator, requesterId };

  const selector = { meetingId };

  const modifier = {
    $set: { randomlySelectedUser: chosenUser },
  };

  try {
    const { insertedId } = Meetings.upsert(selector, modifier);
    if (insertedId) {
      Logger.info(`Set randomly selected user as ${JSON.stringify(chosenUser)} in meeitingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting randomly selected user as ${JSON.stringify(chosenUser)} in meetingId=${meetingId}`);
  }
}
