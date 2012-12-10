define [
  'jquery',
  'underscore',
  'backbone',
  'globals'
], ($, _, Backbone, globals) ->

  # The users panel in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the users.
  SessionUsersView = Backbone.View.extend
    events:
      "click #switch-presenter": "switchPresenter"

    # don't need to render anything, the rendering is done by SessionView
    render: ->

    # Switch the current presenter
    switchPresenter: ->
      # Chat.switchPresenter() # TODO

  SessionUsersView
