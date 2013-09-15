_ = require("lodash")

EventEmitter = require('events').EventEmitter

# Helper class to register and store modules.
# It stores a list of objects in an object literal indexed by the name of the module.
# Includes methods for a class to ask for a module and wait until it is ready.
#
# This class is used to prevent errors when modules are required in an order that
# would generate a circular dependency. In these cases, the objects might not be loaded
# entirely. See more at http://nodejs.org/api/modules.html#modules_cycles
# With this class, the class requiring a module can wait until the module is properly
# loaded. More than that, it will return an instanced object, not only a reference to
# a class (as usually done when using `require`).
#
# Example:
#
# ```
# modules = new Modules()
# modules.wait ["db"], ->
#   # this callback will only be called when the module "db" is registered
#   db = config.modules.get("db")
# ...
# # calls to register a module can be made anywhere in the application
# modules.register "db", new Database()
# ```
#
module.exports = class Modules extends EventEmitter

  constructor: () ->
    # the list of modules registered:
    @modules = {}
    # list of callbacks waiting for a module to be registered:
    @callbacks = []

  # Registers a new module with the name in `name` and the content in `object`.
  # @param {string}   name the name of the module
  # @param {string}   object the instance of the module
  register: (name, object) ->
    @modules[name] = object
    @_checkCallbacks()
    object

  # Wait for a list of modules to be registered. `names` is an array of strings with
  # the names of all modules that should be waited for. The callback in `callback` will
  # only be called after *all* modules in `names` are registered.
  wait: (names, callback) ->
    @callbacks.push {modules: names, fn: callback}
    @_checkCallbacks()

  # Returns the module with the name in `name`.
  get: (name) ->
    @modules[name]

  # Returns the list of all modules registered.
  all: () ->
    @modules

  # Run through the list of registered callbacks in `@callbacks` to see if any of
  # them are ready to be called (if all modules waited for are available).
  _checkCallbacks: () ->
    toRemove = []
    for cb in @callbacks
      done = true
      for name in cb.modules
        unless @modules[name]?
          done = false
          break
      if done
        cb.fn()
        toRemove.push cb
    @callbacks = _.filter(@callbacks, (i) -> i not in toRemove)
