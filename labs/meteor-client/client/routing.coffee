Meteor.navigateTo = (path) ->
  Router.go path

Router.configure layoutTemplate: 'layout'

Router.map ->
  @route 'main',
  path: '/'