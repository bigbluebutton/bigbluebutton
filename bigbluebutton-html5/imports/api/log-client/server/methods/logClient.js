import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

export default function logClient() {
    const args = Array.prototype.slice.call(arguments, 1);

    Logger.log(arguments[0],`Client Log`,args);
};
