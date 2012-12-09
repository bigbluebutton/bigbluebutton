define [
  'jquery',
  'underscore',
  'backbone'
], ($, _, Backbone) ->

  AppView = Backbone.View.extend
    el: $('#container')

    initialize: ->
      @currentView = null

    closeCurrentView: () ->
      @currentView.close() if @currentView?

    render: (view) ->
      @closeCurrentView()
      @currentView = view
      @currentView.render()
      this.$el.html @currentView.el
      this

  # Default close() method for all views
  # More details at:
  # http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
  Backbone.View.prototype.close = ->
    this.remove()
    this.unbind()

  AppView
