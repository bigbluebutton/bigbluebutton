define [
  'underscore',
  'backbone'
], (_, Backbone) ->

  AuthenticationModel = Backbone.Model.extend
    url: '/'
    defaults:
      username: null
      meetingID: null
      loginAccepted: false

  AuthenticationModel
