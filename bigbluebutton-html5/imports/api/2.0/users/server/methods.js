import { Meteor } from 'meteor/meteor';
// import kickUser from './methods/kickUser';
import listenOnlyToggle from './methods/listenOnlyToggle';
import userLogout from './methods/userLogout';
import validateAuthToken from './methods/validateAuthToken';
import mapToAcl from '/imports/startup/mapToAcl';

Meteor.methods(mapToAcl(['methods.kickUser', 'methods.listenOnlyToggle', 'methods.userLogout',
  'methods.assignPresenter', 'methods.setEmojiStatus', 'methods.muteUser', 'methods.unmuteUser',
  ], {
    // kickUser,
    // listenOnlyToggle,
    // userLogout,
    // assignPresenter,
    // setEmojiStatus,
    // muteUser: (...args) => muteToggle(...args, true),
    // unmuteUser: (...args) => muteToggle(...args, false),
  }));

Meteor.methods({ validateAuthToken2x: validateAuthToken });
