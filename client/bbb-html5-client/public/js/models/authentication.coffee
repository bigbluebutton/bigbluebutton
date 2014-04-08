define [
  'underscore',
  'backbone'
], (_, Backbone) ->

  AuthenticationModel = Backbone.Model.extend
    url: '/auth'
    defaults:
      username: null
      meetingID: null
      loginAccepted: false

  AuthenticationModel
