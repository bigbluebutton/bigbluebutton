import { Meteor } from 'meteor/meteor';

const ScreenReaderAlertCollection = new Mongo.Collection('Screenreader-alert', { connection: null });

export default ScreenReaderAlertCollection;
