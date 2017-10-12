import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import userLogout from './methods/userLogout';
import validateAuthToken from './methods/validateAuthToken';
import setEmojiStatus from './methods/setEmojiStatus';
import assignPresenter from './methods/assignPresenter';
import changeRole from './methods/changeRole';
import kickUser from './methods/kickUser';

Meteor.methods(mapToAcl(['methods.userLogout', 'methods.setEmojiStatus', 'methods.assignPresenter', 'methods.changeRole',
  'methods.kickUser'], {
    userLogout,
    setEmojiStatus,
    assignPresenter,
    changeRole,
    kickUser,
  }));

Meteor.methods({ validateAuthToken, });
