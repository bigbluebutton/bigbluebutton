define [
  'underscore',
  'backbone'
], (_, Backbone) ->

  MeetingModel = Backbone.Model.extend
    url: '/meetings'

  MeetingModel
