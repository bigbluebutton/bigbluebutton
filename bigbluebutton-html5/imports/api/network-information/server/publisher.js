import { Meteor } from 'meteor/meteor';
import NetworkInformation from '/imports/api/network-information';
import { extractCredentials } from '/imports/api/common/server/helpers';

function networkInformation() {
  if (!this.userId) {
    return NetworkInformation.find({ meetingId: '' });
  }
  const { meetingId } = extractCredentials(this.userId);

  return NetworkInformation.find({
    meetingId,
  });
}

function publish(...args) {
  const boundNetworkInformation = networkInformation.bind(this);

  return boundNetworkInformation(...args);
}

Meteor.publish('network-information', publish);
