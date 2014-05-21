define [
  'jquery',
  'underscore',
  'backbone'
], ($, _, Backbone) ->

  # Application view
  # Used to control the current active view (i.e. the current
  # "page" being seen by the user).
  AppView = Backbone.View.extend
    el: $('#session-container')

    initialize: ->
      @currentView = null

    render: (view) ->
      @_closeCurrentView()
      @currentView = view
      @currentView.render()

      # we want html(), so that all events from the old view are also
      # removed as well as the html content
      @$el.html @currentView.el
      @

    _closeCurrentView: () ->
      @currentView.close() if @currentView?

  # Default close() method for all views
  # More details at:
  # http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
  Backbone.View.prototype.close = ->
    @remove()
    @unbind()

  # Used to render subviews
  # From: http://ianstormtaylor.com/rendering-views-in-backbonejs-isnt-always-simple/
  Backbone.View.prototype.assign = (view, selector) ->
    view.setElement(@$(selector)).render()


  AppView
