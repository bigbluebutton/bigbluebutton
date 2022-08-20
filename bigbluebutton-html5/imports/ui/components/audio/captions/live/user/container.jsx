import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import User from './component';

const MODERATOR = Meteor.settings.public.user.role_moderator;

const Container = (props) => <User {...props} />;

const getUser = (userId) => {
  const user = Users.findOne(
    { userId },
    {
      fields: {
        avatar: 1,
        color: 1,
        role: 1,
        name: 1,
      },
    },
  );

  if (user) {
    return {
      avatar: user.avatar,
      color: user.color,
      moderator: user.role === MODERATOR,
      name: user.name,
    };
  }

  return {
    avatar: '',
    color: '',
    moderator: false,
    name: '',
  };
};

export default withTracker(({ transcriptId }) => {
  const userId = transcriptId.split('-')[0];

  return getUser(userId);
})(Container);
