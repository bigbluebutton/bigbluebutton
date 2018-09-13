import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import requestPresentationUploadToken from './methods/requestPresentationUploadToken';

Meteor.methods(mapToAcl([
  'methods.requestPresentationUploadToken',
], {
  requestPresentationUploadToken,
}));
