import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import NetworkInformation from '/imports/api/network-information';

function networkInformation(credentials) {
  const { meetingId } = credentials;

  check(meetingId, String);

  return NetworkInformation.find({
    meetingId,
  });
}

function publish(...args) {
  const boundNetworkInformation = networkInformation.bind(this);

  return boundNetworkInformation(...args);
}

Meteor.publish('network-information', publish);
