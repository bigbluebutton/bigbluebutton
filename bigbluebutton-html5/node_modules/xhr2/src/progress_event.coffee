# http://xhr.spec.whatwg.org/#interface-progressevent
class ProgressEvent
  # Creates a new event.
  #
  # @param {String} type the event type, e.g. 'readystatechange'; must be
  #   lowercased
  constructor: (@type) ->
    @target = null
    @currentTarget = null
    @lengthComputable = false
    @loaded = 0
    @total = 0
    # Getting the time from the OS is expensive, skip on that for now.
    # @timeStamp = Date.now()

  # @property {Boolean} for compatibility with DOM events
  bubbles: false

  # @property {Boolean} for fompatibility with DOM events
  cancelable: false

  # @property {XMLHttpRequest} the request that caused this event
  target: null

  # @property {Number} number of bytes that have already been downloaded or
  #   uploaded
  loaded: null

  # @property {Boolean} true if the Content-Length response header is available
  #   and the value of the event's total property is meaningful
  lengthComputable: null

  # @property {Number} number of bytes that will be downloaded or uploaded by
  #   the request that fired the event
  total: null


# The XHR spec exports the ProgressEvent constructor.
XMLHttpRequest.ProgressEvent = ProgressEvent
