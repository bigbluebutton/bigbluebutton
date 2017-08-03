import { Meteor } from 'meteor/meteor';
import mapToAcl from '/imports/startup/mapToAcl';
import publishCursorUpdate from './methods/publishCursorUpdate';

Meteor.methods(mapToAcl(['methods.moveCursor'], {
  publishCursorUpdate,
}));
