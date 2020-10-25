import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Meetings from '/imports/api/meetings';

export default function setLanguages(meetings) {
    const credentials = extractCredentials(this.userId);
    Meetings.insert({ text: 'Hello, world!' });
    return credentials;
}
