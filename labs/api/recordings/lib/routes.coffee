Joi         = require 'joi'

handlers    = require './handlers'

createValidation =
  attendeePW: Joi.string().max(20).required()
  checksum: Joi.string().required()
  meetingID: Joi.string().min(3).max(30).required()
  moderatorPW: Joi.string().required()
  name: Joi.string().regex(/[a-zA-Z0-9]{3,30}/)
  record: Joi.boolean()
  voiceBridge: Joi.string()
  welcome: Joi.string()

recordingsValidation =
  meetingid: Joi.string().min(3).max(45).required()

routes = [{
    method: 'GET'
    path: '/'
    config: {
      handler: handlers.index
    }
  }, {
    method: "GET"
    path: "/bigbluebutton/api/create"
    config: {
      handler: handlers.create
      validate: {
        query: createValidation
      }
    }
  }, {
    method: "GET"
    path: "/recordings"
    config: {
      handler: handlers.recordings
      validate: {
        query: recordingsValidation
      }
    }
  }]

exports.routes = routes