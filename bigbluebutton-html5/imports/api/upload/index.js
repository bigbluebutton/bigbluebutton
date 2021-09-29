import { Meteor } from 'meteor/meteor';

const UploadRequest = new Mongo.Collection('upload-request');
const UploadedFile = new Mongo.Collection('uploaded-file');

if (Meteor.isServer) {
  UploadRequest._ensureIndex({ meetingId: 1 });
  UploadedFile._ensureIndex({ meetingId: 1 });
}

export {
  UploadRequest,
  UploadedFile,
};
