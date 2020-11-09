import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Meetings from '/imports/api/meetings';

export default function setLanguages(languages) {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    const meeting = Meetings.findOne({
        meetingId: meetingId
    })
    languages = languages.map(function (element,index){
        return {name:element, extension: 100+index, translatorIsSpeaking: false}
    })
    meeting.languages = languages
    Meetings.update({ meetingId: meetingId }, meeting);
    return meeting;
}
