/*
  Stub the logger
*/

Logger = {};
Logger.prototype = {
  constructor: Logger
}
Logger.info = function() {};
Meteor.log = Logger;

