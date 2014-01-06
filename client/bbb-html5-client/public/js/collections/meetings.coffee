define [
  'underscore',
  'backbone',
  'cs!models/meeting'
], (_, Backbone, MeetingModel) ->

  MeetingsCollection = Backbone.Collection.extend
    model: MeetingModel
    url: '/meetings'

  MeetingsCollection
