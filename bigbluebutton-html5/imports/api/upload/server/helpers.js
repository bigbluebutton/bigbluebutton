import { Meteor } from 'meteor/meteor';

const UPLOAD = Meteor.settings.public.upload;

const isNotificationEnabled = () => UPLOAD.notification;

export {
  isNotificationEnabled,
};
