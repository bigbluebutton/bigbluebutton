define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'socket.io',
  'configs',
  'cs!router',
  'jquery.mousewheel',
  'jquery.autosize',
  'jquery.form',
  'jquery.ui'
], ($, _, Backbone, Raphael, io, configs, Router) ->

  configs.router = {}

  initialize = ->
    configs.router = new Router()
    Backbone.history.start()
    configs.router.navigate "/login", {trigger: true, replace: true}

  return {
    initialize: initialize
  }
