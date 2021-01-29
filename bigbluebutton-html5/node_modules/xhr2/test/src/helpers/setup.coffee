if typeof window is 'undefined'
  # node.js
  global.XMLHttpRequest = require '../../../lib/xhr2'
  global.ProgressEvent = XMLHttpRequest.ProgressEvent
  global.NetworkError = XMLHttpRequest.NetworkError
  global.SecurityError = XMLHttpRequest.SecurityError
  global.InvalidStateError = XMLHttpRequest.InvalidStateError

  global.chai = require 'chai'
  global.assert = global.chai.assert
  global.expect = global.chai.expect
  global.sinon = require 'sinon'
  global.sinonChai = require 'sinon-chai'

  xhrServer = require './xhr_server'
  require './xhr2.png.js'

  https = require 'https'
  agent = new https.Agent
  agent.options.rejectUnauthorized = true
  agent.options.ca = xhrServer.https.sslCertificate()
  global.XMLHttpRequest.nodejsSet httpsAgent: agent
  global.XMLHttpRequest.nodejsSet(
      baseUrl: xhrServer.http.testUrl().replace('https://', 'http://'))
else
  # browser

  # HACK(pwnall): the test is first loaded on https so the developer can bypass
  #     the SSL interstitial; however, we need to run the test on http, because
  #     Chrome blocks https -> http XHRs
  if window.location.href.indexOf('https://') is 0
    window.location.href = window.location.href.replace('https://', 'http://').
                                                replace(':8911', ':8912')

  window.NetworkError = window.Error
  window.SecurityError = window.Error
  window.assert = window.chai.assert
  window.expect = window.chai.expect
