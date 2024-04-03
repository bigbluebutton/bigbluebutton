import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import EmojiRain from './component';
import UserReaction from '/imports/api/user-reaction';
import Auth from '/imports/ui/services/auth';

const EmojiRainContainer = (props) => <EmojiRain {...props} />;

export default withTracker(() => ({
  reactions: UserReaction.find({ meetingId: Auth.meetingID }).fetch(),
}))(EmojiRainContainer);
