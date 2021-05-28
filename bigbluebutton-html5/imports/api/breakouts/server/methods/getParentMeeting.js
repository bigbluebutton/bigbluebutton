import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Meetings from "/imports/api/meetings";
import  Breakouts from "/imports/api/breakouts";

export default function getParentMeeting() {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    let meeting = Meetings.findOne({ meetingId: meetingId });
    let parentId = meeting.breakoutProps.parentId;
    let parent = Meetings.findOne({ meetingId: parentId});
    return parent;
}
