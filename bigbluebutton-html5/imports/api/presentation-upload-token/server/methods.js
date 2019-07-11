import { Meteor } from 'meteor/meteor';
import requestPresentationUploadToken from './methods/requestPresentationUploadToken';
import setUsedToken from './methods/setUsedToken';

Meteor.methods({
  requestPresentationUploadToken,
  setUsedToken,
});
