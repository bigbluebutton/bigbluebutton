import { Mongo } from 'meteor/mongo';

export const Users = new Mongo.Collection('bbb_users');

export const Chat = new Mongo.Collection('bbb_chat');

export const Meetings = new Mongo.Collection('meetings');

export const Presentations = new Mongo.Collection('presentations');

export const Cursor = new Mongo.Collection('bbb_cursor');

export const Shapes = new Mongo.Collection('shapes');

export const Slides = new Mongo.Collection('slides');

export const Polls = new Mongo.Collection('bbb_poll');

export const WhiteboardCleanStatus = new Mongo.Collection('whiteboard-clean-status');
