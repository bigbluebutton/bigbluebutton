import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import listenOnlyToggle from './methods/listenOnlyToggle';

Meteor.methods(mapToAcl(['methods.listenOnlyToggle',
], {
  listenOnlyToggle,
}));
