define [
  'underscore',
  'backbone'
], (_, Backbone) ->

  AuthenticationModel = Backbone.Model.extend
    url: '/'
    defaults:
      username: "",
      meetingID: "",
      loginAccepted: false

  AuthenticationModel
