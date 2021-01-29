describe 'XMLHttpRequest', ->
  beforeEach ->
    @xhr = new XMLHttpRequest
    @okUrl = 'http://localhost:8912/test/fixtures/hello.txt'

    @errorUrl = 'http://localhost:8912/_/response'
    @errorJson = JSON.stringify
        code: 401, status: 'Unauthorized',
        body: JSON.stringify(error: 'Credential error'),
        headers:
          'Content-Type': 'application/json', 'Content-Length': '28'

  describe '#status', ->
    it 'is 200 for a normal request', (done) ->
      @xhr.open 'GET', @okUrl
      _done = false
      @xhr.addEventListener 'readystatechange', =>
        return if _done
        if @xhr.readyState < XMLHttpRequest.HEADERS_RECEIVED
          expect(@xhr.status).to.equal 0
          expect(@xhr.statusText).to.equal ''
        else
          expect(@xhr.status).to.equal 200
          expect(@xhr.statusText).to.be.ok
          expect(@xhr.statusText).to.not.equal ''
          if @xhr.readyState is XMLHttpRequest.DONE
            _done = true
            done()
      @xhr.send()

    it 'returns the server-reported status', (done) ->
      @xhr.open 'POST', @errorUrl
      _done = false
      @xhr.addEventListener 'readystatechange', =>
        return if _done
        if @xhr.readyState < XMLHttpRequest.HEADERS_RECEIVED
          expect(@xhr.status).to.equal 0
          expect(@xhr.statusText).to.equal ''
        else
          expect(@xhr.status).to.equal 401
          expect(@xhr.statusText).to.be.ok
          expect(@xhr.statusText).to.not.equal ''
          if @xhr.readyState is XMLHttpRequest.DONE
            _done = true
            done()
      @xhr.send @errorJson

