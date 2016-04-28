import { Mongo } from 'meteor/mongo';

export const Users = new Mongo.Collection('bbb_users');

export const Chat = new Meteor.Collection('bbb_chat');

export const Meetings = new Meteor.Collection('meetings');

export const Presentations = new Meteor.Collection('presentations');

export const Cursor = new Meteor.Collection('bbb_cursor');

export const Shapes = new Meteor.Collection('shapes');

export const Slides = new Meteor.Collection('slides');

export const Polls = new Meteor.Collection('bbb_poll');

export const WhiteboardCleanStatus = new Meteor.Collection('whiteboard-clean-status');



