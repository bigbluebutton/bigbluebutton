import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Meetings from "/imports/api/meetings";

export default function createTranslationChannel(meetingId) {
  const breakouts = Meetings.find();
  let rooms = breakouts.fetch();
  console.log(rooms.length)
  return rooms;
}
