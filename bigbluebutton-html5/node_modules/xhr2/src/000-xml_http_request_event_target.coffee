# This file's name is set up in such a way that it will always show up first in
# the list of files given to coffee --join, so that the other files can assume
# that XMLHttpRequestEventTarget was already defined.


# The DOM EventTarget subclass used by XMLHttpRequest.
#
# @see http://xhr.spec.whatwg.org/#interface-xmlhttprequest
class XMLHttpRequestEventTarget
  # @private
  # This is an abstract class and should not be instantiated directly.
  constructor: ->
    @onloadstart = null
    @onprogress = null
    @onabort = null
    @onerror = null
    @onload = null
    @ontimeout = null
    @onloadend = null
    @_listeners = {}

  # @property {function(ProgressEvent)} DOM level 0-style handler
  #   for the 'loadstart' event
  onloadstart: null

  # @property {function(ProgressEvent)} DOM level 0-style handler
  #   for the 'progress' event
  onprogress: null

  # @property {function(ProgressEvent)} DOM level 0-style handler
  #   for the 'abort' event
  onabort: null

  # @property {function(ProgressEvent)} DOM level 0-style handler
  #   for the 'error' event
  onerror: null

  # @property {function(ProgressEvent)} DOM level 0-style handler
  #   for the 'load' event
  onload: null

  # @property {function(ProgressEvent)} DOM level 0-style handler
  #   for the 'timeout' event
  ontimeout: null

  # @property {function(ProgressEvent)} DOM level 0-style handler
  #   for the 'loadend' event
  onloadend: null

  # Adds a new-style listener for one of the XHR events.
  #
  # @see http://www.w3.org/TR/XMLHttpRequest/#events
  #
  # @param {String} eventType an XHR event type, such as 'readystatechange'
  # @param {function(ProgressEvent)} listener function that will be called when
  #   the event fires
  # @return {undefined} undefined
  addEventListener: (eventType, listener) ->
    eventType = eventType.toLowerCase()
    @_listeners[eventType] ||= []
    @_listeners[eventType].push listener
    undefined

  # Removes an event listener added by calling addEventListener.
  #
  # @param {String} eventType an XHR event type, such as 'readystatechange'
  # @param {function(ProgressEvent)} listener the value passed in a previous
  #   call to addEventListener.
  # @return {undefined} undefined
  removeEventListener: (eventType, listener) ->
    eventType = eventType.toLowerCase()
    if @_listeners[eventType]
      index = @_listeners[eventType].indexOf listener
      @_listeners[eventType].splice index, 1 if index isnt -1
    undefined

  # Calls all the listeners for an event.
  #
  # @param {ProgressEvent} event the event to be dispatched
  # @return {undefined} undefined
  dispatchEvent: (event) ->
    event.currentTarget = event.target = @
    eventType = event.type
    if listeners = @_listeners[eventType]
      for listener in listeners
        listener.call @, event
    if listener = @["on#{eventType}"]
      listener.call @, event
    undefined
