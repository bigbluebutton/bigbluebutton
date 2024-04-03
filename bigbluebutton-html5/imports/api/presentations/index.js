import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

export const UploadingPresentations = Meteor.isClient ? new Mongo.Collection('uploadingPresentations', collectionOptions) : null;

export default UploadingPresentations;
