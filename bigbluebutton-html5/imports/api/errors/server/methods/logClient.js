import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function logClient(credentials, log) {
    const args = Array.prototype.slice.call(arguments, 1);

    Logger[arguments[0]](`Error on the client: ${JSON.stringify(args)}`);
};
