# This file's name is set up in such a way that it will always show up second
# in the list of files given to coffee --join, so it can use the
# XMLHttpRequestEventTarget definition and so that the other files can assume
# that XMLHttpRequest was already defined.

http = require 'http'
https = require 'https'
os = require 'os'
url = require 'url'

# The ECMAScript HTTP API.
#
# @see http://www.w3.org/TR/XMLHttpRequest/#introduction
class XMLHttpRequest extends XMLHttpRequestEventTarget
  # Creates a new request.
  #
  # @param {Object} options one or more of the options below
  # @option options {Boolean} anon if true, the request's anonymous flag
  #   will be set
  # @see http://www.w3.org/TR/XMLHttpRequest/#constructors
  # @see http://www.w3.org/TR/XMLHttpRequest/#anonymous-flag
  constructor: (options) ->
    super()
    @onreadystatechange = null

    @_anonymous = options and options.anon

    @readyState = XMLHttpRequest.UNSENT
    @response = null
    @responseText = ''
    @responseType = ''
    @responseURL = ''
    @status = 0
    @statusText = ''
    @timeout = 0
    @upload = new XMLHttpRequestUpload @

    @_method = null  # String
    @_url = null  # Return value of url.parse()
    @_sync = false
    @_headers = null  # Object<String, String>
    @_loweredHeaders = null  # Object<lowercase String, String>
    @_mimeOverride = null
    @_request = null  # http.ClientRequest
    @_response = null  # http.ClientResponse
    @_responseParts = null  # Array<Buffer, String>
    @_responseHeaders = null  # Object<lowercase String, String>
    @_aborting = null
    @_error = null
    @_loadedBytes = 0
    @_totalBytes = 0
    @_lengthComputable = false

  # @property {function(ProgressEvent)} DOM level 0-style handler for the
  #   'readystatechange' event
  onreadystatechange: null

  # @property {Number} the current state of the XHR object
  # @see http://www.w3.org/TR/XMLHttpRequest/#states
  readyState: null

  # @property {String, ArrayBuffer, Buffer, Object} processed XHR response
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-response-attribute
  response: null

  # @property {String} response string, if responseType is '' or 'text'
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-responsetext-attribute
  responseText: null

  # @property {String} sets the parsing method for the XHR response
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-responsetype-attribute
  responseType: null

  # @property {Number} the HTTP
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-status-attribute
  status: null

  # @property {Number} milliseconds to wait for the request to complete
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-timeout-attribute
  timeout: null

  # @property {XMLHttpRequestUpload} the associated upload information
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-upload-attribute
  upload: null

  # Sets the XHR's method, URL, synchronous flag, and authentication params.
  #
  # @param {String} method the HTTP method to be used
  # @param {String} url the URL that the request will be made to
  # @param {?Boolean} async if false, the XHR should be processed
  #   synchronously; true by default
  # @param {?String} user the user credential to be used in HTTP basic
  #   authentication
  # @param {?String} password the password credential to be used in HTTP basic
  #   authentication
  # @return {undefined} undefined
  # @throw {SecurityError} method is not one of the allowed methods
  # @throw {SyntaxError} urlString is not a valid URL
  # @throw {Error} the URL contains an unsupported protocol; the supported
  #   protocols are file, http and https
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-open()-method
  open: (method, url, async, user, password) ->
    method = method.toUpperCase()
    if method of @_restrictedMethods
      throw new SecurityError "HTTP method #{method} is not allowed in XHR"

    xhrUrl = @_parseUrl url
    async = true if async is undefined

    switch @readyState
      when XMLHttpRequest.UNSENT, XMLHttpRequest.OPENED, XMLHttpRequest.DONE
        # Nothing to do here.
        null
      when XMLHttpRequest.HEADERS_RECEIVED, XMLHttpRequest.LOADING
        # TODO(pwnall): terminate abort(), terminate send()
        null

    @_method = method
    @_url = xhrUrl
    @_sync = !async
    @_headers = {}
    @_loweredHeaders = {}
    @_mimeOverride = null
    @_setReadyState XMLHttpRequest.OPENED
    @_request = null
    @_response = null
    @status = 0
    @statusText = ''
    @_responseParts = []
    @_responseHeaders = null
    @_loadedBytes = 0
    @_totalBytes = 0
    @_lengthComputable = false
    undefined

  # Appends a header to the list of author request headers.
  #
  # @param {String} name the HTTP header name
  # @param {String} value the HTTP header value
  # @return {undefined} undefined
  # @throw {InvalidStateError} readyState is not OPENED
  # @throw {SyntaxError} name is not a valid HTTP header name or value is not
  #   a valid HTTP header value
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader()-method
  setRequestHeader: (name, value) ->
    unless @readyState is XMLHttpRequest.OPENED
      throw new InvalidStateError "XHR readyState must be OPENED"

    loweredName = name.toLowerCase()
    if @_restrictedHeaders[loweredName] or /^sec\-/.test(loweredName) or
        /^proxy-/.test(loweredName)
      console.warn "Refused to set unsafe header \"#{name}\""
      return undefined

    value = value.toString()
    if loweredName of @_loweredHeaders
      # Combine value with the existing header value.
      name = @_loweredHeaders[loweredName]
      @_headers[name] = @_headers[name] + ', ' + value
    else
      # New header.
      @_loweredHeaders[loweredName] = name
      @_headers[name] = value

    undefined

  # Initiates the request.
  #
  # @param {?String, ?ArrayBufferView} data the data to be sent; ignored for
  #   GET and HEAD requests
  # @return {undefined} undefined
  # @throw {InvalidStateError} readyState is not OPENED
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-send()-method
  send: (data) ->
    unless @readyState is XMLHttpRequest.OPENED
      throw new InvalidStateError "XHR readyState must be OPENED"

    if @_request
      throw new InvalidStateError "send() already called"

    switch @_url.protocol
      when 'file:'
        @_sendFile data
      when 'http:', 'https:'
        @_sendHttp data
      else
        throw new NetworkError "Unsupported protocol #{@_url.protocol}"

    undefined

  # Cancels the network activity performed by this request.
  #
  # @return {undefined} undefined
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-abort()-method
  abort: ->
    return unless @_request

    @_request.abort()
    @_setError()
    @_dispatchProgress 'abort'
    @_dispatchProgress 'loadend'
    undefined

  # Returns a header value in the HTTP response for this XHR.
  #
  # @param {String} name case-insensitive HTTP header name
  # @return {?String} value the value of the header whose name matches the
  #   given name, or null if there is no such header
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-getresponseheader()-method
  getResponseHeader: (name) ->
    return null unless @_responseHeaders

    loweredName = name.toLowerCase()
    if loweredName of @_responseHeaders
      @_responseHeaders[loweredName]
    else
      null

  # Returns all the HTTP headers in this XHR's response.
  #
  # @return {String} header lines separated by CR LF, where each header line
  #   has the name and value separated by a ": " (colon, space); the empty
  #   string is returned if the headers are not available
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders()-method
  getAllResponseHeaders: ->
    return '' unless @_responseHeaders

    lines = ("#{name}: #{value}" for name, value of @_responseHeaders)
    lines.join "\r\n"

  # Overrides the Content-Type
  #
  # @return {undefined} undefined
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-overridemimetype()-method
  overrideMimeType: (newMimeType) ->
    if @readyState is XMLHttpRequest.LOADING or
       @readyState is XMLHttpRequest.DONE
      throw new InvalidStateError(
          "overrideMimeType() not allowed in LOADING or DONE")

    @_mimeOverride = newMimeType.toLowerCase()
    undefined

  # Network configuration not exposed in the XHR API.
  #
  # Although the XMLHttpRequest specification calls itself "ECMAScript HTTP",
  # it assumes that requests are always performed in the context of a browser
  # application, where some network parameters are set by the browser user and
  # should not be modified by Web applications. This API provides access to
  # these network parameters.
  #
  # NOTE: this is not in the XMLHttpRequest API, and will not work in
  # browsers.  It is a stable node-xhr2 API.
  #
  # @param {Object} options one or more of the options below
  # @option options {?http.Agent} httpAgent the value for the nodejsHttpAgent
  #   property (the agent used for HTTP requests)
  # @option options {?https.Agent} httpsAgent the value for the
  #   nodejsHttpsAgent property (the agent used for HTTPS requests)
  # @return {undefined} undefined
  nodejsSet: (options) ->
    if 'httpAgent' of options
      @nodejsHttpAgent = options.httpAgent
    if 'httpsAgent' of options
      @nodejsHttpsAgent = options.httpsAgent
    if 'baseUrl' of options
      baseUrl = options.baseUrl
      unless baseUrl is null
        parsedUrl = url.parse baseUrl, false, true
        unless parsedUrl.protocol
          throw new SyntaxError("baseUrl must be an absolute URL")
      @nodejsBaseUrl = baseUrl

    undefined

  # Default settings for the network configuration not exposed in the XHR API.
  #
  # NOTE: this is not in the XMLHttpRequest API, and will not work in
  # browsers.  It is a stable node-xhr2 API.
  #
  # @param {Object} options one or more of the options below
  # @option options {?http.Agent} httpAgent the default value for the
  #   nodejsHttpAgent property (the agent used for HTTP requests)
  # @option options {https.Agent} httpsAgent the default value for the
  #   nodejsHttpsAgent property (the agent used for HTTPS requests)
  # @return {undefined} undefined
  # @see XMLHttpRequest.nodejsSet
  @nodejsSet: (options) ->
    # "this" will be set to XMLHttpRequest.prototype, so the instance nodejsSet
    # operates on default property values.
    XMLHttpRequest::nodejsSet options

    undefined

  # readyState value before XMLHttpRequest#open() is called
  UNSENT: 0
  # readyState value before XMLHttpRequest#open() is called
  @UNSENT: 0

  # readyState value after XMLHttpRequest#open() is called, and before
  #   XMLHttpRequest#send() is called; XMLHttpRequest#setRequestHeader() can be
  #   called in this state
  OPENED: 1
  # readyState value after XMLHttpRequest#open() is called, and before
  #   XMLHttpRequest#send() is called; XMLHttpRequest#setRequestHeader() can be
  #   called in this state
  @OPENED: 1

  # readyState value after redirects have been followed and the HTTP headers of
  #   the final response have been received
  HEADERS_RECEIVED: 2
  # readyState value after redirects have been followed and the HTTP headers of
  #   the final response have been received
  @HEADERS_RECEIVED: 2

  # readyState value when the response entity body is being received
  LOADING: 3
  # readyState value when the response entity body is being received
  @LOADING: 3

  # readyState value after the request has been completely processed
  DONE: 4
  # readyState value after the request has been completely processed
  @DONE: 4

  # @property {http.Agent} the agent option passed to HTTP requests
  #
  # NOTE: this is not in the XMLHttpRequest API, and will not work in browsers.
  # It is a stable node-xhr2 API that is useful for testing & going through
  # web-proxies.
  nodejsHttpAgent: http.globalAgent

  # @property {https.Agent} the agent option passed to HTTPS requests
  #
  # NOTE: this is not in the XMLHttpRequest API, and will not work in browsers.
  # It is a stable node-xhr2 API that is useful for testing & going through
  # web-proxies.
  nodejsHttpsAgent: https.globalAgent

  # @property {String} the base URL that relative URLs get resolved to
  #
  # NOTE: this is not in the XMLHttpRequest API, and will not work in browsers.
  # Its browser equivalent is the base URL of the document associated with the
  # Window object. It is a stable node-xhr2 API provided for libraries such as
  # Angular Universal.
  nodejsBaseUrl: null

  # HTTP methods that are disallowed in the XHR spec.
  #
  # @private
  # @see Step 6 in http://www.w3.org/TR/XMLHttpRequest/#the-open()-method
  _restrictedMethods:
      CONNECT: true
      TRACE: true
      TRACK: true

  # HTTP request headers that are disallowed in the XHR spec.
  #
  # @private
  # @see Step 5 in
  #   http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader()-method
  _restrictedHeaders:
      'accept-charset': true
      'accept-encoding': true
      'access-control-request-headers': true
      'access-control-request-method': true
      connection: true
      'content-length': true
      cookie: true
      cookie2: true
      date: true
      dnt: true
      expect: true
      host: true
      'keep-alive': true
      origin: true
      referer: true
      te: true
      trailer: true
      'transfer-encoding': true
      upgrade: true
      'user-agent': true
      via: true

  # HTTP response headers that should not be exposed according to the XHR spec.
  #
  # @private
  # @see Step 3 in
  #     http://www.w3.org/TR/XMLHttpRequest/#the-getresponseheader()-method
  _privateHeaders:
    'set-cookie': true
    'set-cookie2': true

  # The value of the User-Agent header.
  _userAgent: "Mozilla/5.0 (#{os.type()} #{os.arch()}) " +
              "node.js/#{process.versions.node} v8/#{process.versions.v8}"

  # Sets the readyState property and fires the readystatechange event.
  #
  # @private
  # @param {Number} newReadyState the new value of readyState
  # @return {undefined} undefined
  _setReadyState: (newReadyState) ->
    @readyState = newReadyState
    event = new ProgressEvent 'readystatechange'
    @dispatchEvent event
    undefined

  # XMLHttpRequest#send() implementation for the file: protocol.
  #
  # @private
  _sendFile: ->
    unless @_url.method is 'GET'
      throw new NetworkError 'The file protocol only supports GET'

    throw new Error "Protocol file: not implemented"

  # XMLHttpRequest#send() implementation for the http: and https: protocols.
  #
  # @private
  # This method sets the instance variables and calls _sendHxxpRequest(), which
  # is responsible for building a node.js request and firing it off. The code
  # in _sendHxxpRequest() is separated off so it can be reused when handling
  # redirects.
  #
  # @see http://www.w3.org/TR/XMLHttpRequest/#infrastructure-for-the-send()-method
  _sendHttp: (data) ->
    if @_sync
      throw new Error "Synchronous XHR processing not implemented"

    if data? and (@_method is 'GET' or @_method is 'HEAD')
      console.warn "Discarding entity body for #{@_method} requests"
      data = null
    else
      # Send Content-Length: 0
      data or= ''

    # NOTE: this is called before finalizeHeaders so that the uploader can
    #       figure out Content-Length and Content-Type.
    @upload._setData data
    @_finalizeHeaders()

    @_sendHxxpRequest()
    undefined

  # Sets up and fires off a HTTP/HTTPS request using the node.js API.
  #
  # @private
  # This method contains the bulk of the XMLHttpRequest#send() implementation,
  # and is also used to issue new HTTP requests when handling HTTP redirects.
  #
  # @see http://www.w3.org/TR/XMLHttpRequest/#infrastructure-for-the-send()-method
  _sendHxxpRequest: ->
    if @_url.protocol is 'http:'
      hxxp = http
      agent = @nodejsHttpAgent
    else
      hxxp = https
      agent = @nodejsHttpsAgent

    request = hxxp.request
        hostname: @_url.hostname, port: @_url.port, path: @_url.path,
        auth: @_url.auth, method: @_method, headers: @_headers, agent: agent
    @_request = request
    if @timeout
      request.setTimeout @timeout, => @_onHttpTimeout request
    request.on 'response', (response) => @_onHttpResponse request, response
    request.on 'error', (error) => @_onHttpRequestError request, error
    @upload._startUpload request
    if @_request is request  # An http error might have already fired.
      @_dispatchProgress 'loadstart'

    undefined

  # Fills in the restricted HTTP headers with default values.
  #
  # This is called right before the HTTP request is sent off.
  #
  # @private
  # @return {undefined} undefined
  _finalizeHeaders: ->
    @_headers['Connection'] = 'keep-alive'
    @_headers['Host'] = @_url.host
    if @_anonymous
      @_headers['Referer'] = 'about:blank'
    @_headers['User-Agent'] = @_userAgent
    @upload._finalizeHeaders @_headers, @_loweredHeaders
    undefined


  # Called when the headers of an HTTP response have been received.
  #
  # @private
  # @param {http.ClientRequest} request the node.js ClientRequest instance that
  #   produced this response
  # @param {http.ClientResponse} response the node.js ClientResponse instance
  #   passed to
  _onHttpResponse: (request, response) ->
    return unless @_request is request

    # Transparent redirection handling.
    switch response.statusCode
      when 301, 302, 303, 307, 308
        @_url = @_parseUrl response.headers['location']
        @_method = 'GET'
        if 'content-type' of @_loweredHeaders
          delete @_headers[@_loweredHeaders['content-type']]
          delete @_loweredHeaders['content-type']
        # XMLHttpRequestUpload#_finalizeHeaders() sets Content-Type directly.
        if 'Content-Type' of @_headers
          delete @_headers['Content-Type']
        # Restricted headers can't be set by the user, no need to check
        # loweredHeaders.
        delete @_headers['Content-Length']

        @upload._reset()
        @_finalizeHeaders()
        @_sendHxxpRequest()
        return

    @_response = response
    @_response.on 'data', (data) => @_onHttpResponseData response, data
    @_response.on 'end', => @_onHttpResponseEnd response
    @_response.on 'close', => @_onHttpResponseClose response

    @responseURL = @_url.href.split('#')[0]
    @status = @_response.statusCode
    @statusText = http.STATUS_CODES[@status]
    @_parseResponseHeaders response

    if lengthString = @_responseHeaders['content-length']
      @_totalBytes = parseInt(lengthString)
      @_lengthComputable = true
    else
      @_lengthComputable = false

    @_setReadyState XMLHttpRequest.HEADERS_RECEIVED

  # Called when some data has been received on a HTTP connection.
  #
  # @private
  # @param {http.ClientResponse} response the node.js ClientResponse instance
  #   that fired this event
  # @param {String, Buffer} data the data that has been received
  _onHttpResponseData: (response, data) ->
    return unless @_response is response

    @_responseParts.push data
    @_loadedBytes += data.length

    if @readyState isnt XMLHttpRequest.LOADING
      @_setReadyState XMLHttpRequest.LOADING
    @_dispatchProgress 'progress'

  # Called when the HTTP request finished processing.
  #
  # @private
  # @param {http.ClientResponse} response the node.js ClientResponse instance
  #   that fired this event
  _onHttpResponseEnd: (response) ->
    return unless @_response is response

    @_parseResponse()

    @_request = null
    @_response = null
    @_setReadyState XMLHttpRequest.DONE
    @_dispatchProgress 'load'
    @_dispatchProgress 'loadend'

  # Called when the underlying HTTP connection was closed prematurely.
  #
  # If this method is called, it will be called after or instead of
  # onHttpResponseEnd.
  #
  # @private
  # @param {http.ClientResponse} response the node.js ClientResponse instance
  #   that fired this event
  _onHttpResponseClose: (response) ->
    return unless @_response is response

    request = @_request
    @_setError()
    request.abort()
    @_setReadyState XMLHttpRequest.DONE
    @_dispatchProgress 'error'
    @_dispatchProgress 'loadend'

  # Called when the timeout set on the HTTP socket expires.
  #
  # @private
  # @param {http.ClientRequest} request the node.js ClientRequest instance that
  #   fired this event
  _onHttpTimeout: (request) ->
    return unless @_request is request

    @_setError()
    request.abort()
    @_setReadyState XMLHttpRequest.DONE
    @_dispatchProgress 'timeout'
    @_dispatchProgress 'loadend'

  # Called when something wrong happens on the HTTP socket
  #
  # @private
  # @param {http.ClientRequest} request the node.js ClientRequest instance that
  #   fired this event
  # @param {Error} error emitted exception
  _onHttpRequestError: (request, error) ->
    return unless @_request is request

    @_setError()
    request.abort()
    @_setReadyState XMLHttpRequest.DONE
    @_dispatchProgress 'error'
    @_dispatchProgress 'loadend'

  # Fires an XHR progress event.
  #
  # @private
  # @param {String} eventType one of the XHR progress event types, such as
  #   'load' and 'progress'
  _dispatchProgress: (eventType) ->
    event = new ProgressEvent eventType
    event.lengthComputable = @_lengthComputable
    event.loaded = @_loadedBytes
    event.total = @_totalBytes
    @dispatchEvent event
    undefined

  # Sets up the XHR to reflect the fact that an error has occurred.
  #
  # The possible errors are a network error, a timeout, or an abort.
  #
  # @private
  _setError: ->
    @_request = null
    @_response = null
    @_responseHeaders = null
    @_responseParts = null
    undefined

  # Parses a request URL string.
  #
  # @private
  # This method is a thin wrapper around url.parse() that normalizes HTTP
  # user/password credentials. It is used to parse the URL string passed to
  # XMLHttpRequest#open() and the URLs in the Location headers of HTTP redirect
  # responses.
  #
  # @param {String} urlString the URL to be parsed
  # @return {Object} parsed URL
  _parseUrl: (urlString) ->
    if @nodejsBaseUrl is null
      absoluteUrlString = urlString
    else
      absoluteUrlString = url.resolve @nodejsBaseUrl, urlString

    xhrUrl = url.parse absoluteUrlString, false, true
    xhrUrl.hash = null
    if xhrUrl.auth and (user? or password?)
      index = xhrUrl.auth.indexOf ':'
      if index is -1
        user = xhrUrl.auth unless user
      else
        user = xhrUrl.substring(0, index) unless user
        password = xhrUrl.substring(index + 1) unless password
    if user or password
      xhrUrl.auth = "#{user}:#{password}"
    xhrUrl

  # Reads the headers from a node.js ClientResponse instance.
  #
  # @private
  # @param {http.ClientResponse} response the response whose headers will be
  #   imported into this XMLHttpRequest's state
  # @return {undefined} undefined
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-getresponseheader()-method
  # @see http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders()-method
  _parseResponseHeaders: (response) ->
    @_responseHeaders = {}
    for name, value of response.headers
      loweredName = name.toLowerCase()
      continue if @_privateHeaders[loweredName]
      if @_mimeOverride isnt null and loweredName is 'content-type'
        value = @_mimeOverride
      @_responseHeaders[loweredName] = value

    if @_mimeOverride isnt null and !('content-type' of @_responseHeaders)
      @_responseHeaders['content-type'] = @_mimeOverride
    undefined

  # Sets the response and responseText properties when an XHR completes.
  #
  # @private
  # @return {undefined} undefined
  _parseResponse: ->
    if Buffer.concat
      buffer = Buffer.concat @_responseParts
    else
      # node 0.6
      buffer = @_concatBuffers @_responseParts
    @_responseParts = null

    switch @responseType
      when 'text'
        @_parseTextResponse buffer
      when 'json'
        @responseText = null
        try
          @response = JSON.parse buffer.toString('utf-8')
        catch jsonError
          @response = null
      when 'buffer'
        @responseText = null
        @response = buffer
      when 'arraybuffer'
        @responseText = null
        arrayBuffer = new ArrayBuffer buffer.length
        view = new Uint8Array arrayBuffer
        view[i] = buffer[i] for i in [0...buffer.length]
        @response = arrayBuffer
      else
        # TODO(pwnall): content-base detection
        @_parseTextResponse buffer
    undefined

  # Sets response and responseText for a 'text' response type.
  #
  # @private
  # @param {Buffer} buffer the node.js Buffer containing the binary response
  # @return {undefined} undefined
  _parseTextResponse: (buffer) ->
    try
      @responseText = buffer.toString @_parseResponseEncoding()
    catch e
      # Unknown encoding.
      @responseText = buffer.toString 'binary'

    @response = @responseText
    undefined

  # Figures out the string encoding of the XHR's response.
  #
  # This is called to determine the encoding when responseText is set.
  #
  # @private
  # @return {String} a string encoding, e.g. 'utf-8'
  _parseResponseEncoding: ->
    encoding = null
    if contentType = @_responseHeaders['content-type']
      if match = /\;\s*charset\=(.*)$/.exec contentType
        return match[1]
    'utf-8'

  # Buffer.concat implementation for node 0.6.
  #
  # @private
  # @param {Array<Buffer>} buffers the buffers whose contents will be merged
  # @return {Buffer} same as Buffer.concat(buffers) in node 0.8 and above
  _concatBuffers: (buffers) ->
    if buffers.length is 0
      return Buffer.alloc 0
    if buffers.length is 1
      return buffers[0]

    length = 0
    length += buffer.length for buffer in buffers
    target = Buffer.alloc length
    length = 0
    for buffer in buffers
      buffer.copy target, length
      length += buffer.length
    target

# XMLHttpRequest is the result of require('node-xhr2').
module.exports = XMLHttpRequest

# Make node-xhr2 work as a drop-in replacement for libraries that promote the
# following usage pattern:
#     var XMLHttpRequest = require('xhr-library-name').XMLHttpRequest
XMLHttpRequest.XMLHttpRequest = XMLHttpRequest
