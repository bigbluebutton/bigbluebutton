import { Meteor } from 'meteor/meteor';
import kickUser from './methods/kickUser';
import listenOnlyRequestToggle from './methods/listenOnlyRequestToggle';

Meteor.methods({
  kickUser,
  listenOnlyRequestToggle,
});
