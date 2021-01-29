describe 'XMLHttpRequest', ->
  beforeEach ->
    @xhr = new XMLHttpRequest

  describe '#setRequestHeader', ->
    beforeEach ->
      @xhr.open 'POST', 'http://localhost:8912/_/headers'
      @xhr.responseType = 'text'

    describe 'with allowed headers', ->
      beforeEach ->
        @xhr.setRequestHeader 'Authorization', 'lol'
        @xhr.setRequestHeader 'X-Answer', '42'
        @xhr.setRequestHeader 'X-Header-Name', 'value'

      it 'should send the headers', (done) ->
        @xhr.onload = =>
          expect(@xhr.responseText).to.match(/^\{.*\}$/)
          headers = JSON.parse @xhr.responseText
          expect(headers).to.have.property 'authorization'
          expect(headers['authorization']).to.equal 'lol'
          expect(headers).to.have.property 'x-answer'
          expect(headers['x-answer']).to.equal '42'
          expect(headers).to.have.property 'x-header-name'
          expect(headers['x-header-name']).to.equal 'value'
          done()
        @xhr.send ''

    describe 'with a mix of allowed and forbidden headers', ->
      beforeEach ->
        @xhr.setRequestHeader 'Authorization', 'lol'
        @xhr.setRequestHeader 'Proxy-Authorization', 'evil:kitten'
        @xhr.setRequestHeader 'Sec-Breach', 'yes please'
        @xhr.setRequestHeader 'Host', 'www.google.com'
        @xhr.setRequestHeader 'Origin', 'https://www.google.com'
        @xhr.setRequestHeader 'X-Answer', '42'

      it 'should only send the allowed headers', (done) ->
        @xhr.onloadend = =>
          expect(@xhr.responseText).to.match(/^\{.*\}$/)
          headers = JSON.parse @xhr.responseText
          expect(headers).to.have.property 'authorization'
          expect(headers['authorization']).to.equal 'lol'
          expect(headers).not.to.have.property 'proxy-authorization'
          expect(headers).not.to.have.property 'sec-breach'
          expect(headers['origin']).not.to.match /www\.google\.com/
          expect(headers['host']).not.to.match /www\.google\.com/
          expect(headers).to.have.property 'x-answer'
          expect(headers['x-answer']).to.equal '42'
          done()
        @xhr.send ''

    describe 'with repeated headers', ->
      beforeEach ->
        @xhr.setRequestHeader 'Authorization', 'trol'
        @xhr.setRequestHeader 'Authorization', 'lol'
        @xhr.setRequestHeader 'Authorization', 'lol'
        @xhr.setRequestHeader 'X-Answer', '42'

      it 'should only send the allowed headers', (done) ->
        _done = false
        @xhr.onreadystatechange = =>
          return if _done or @xhr.readyState isnt XMLHttpRequest.DONE
          _done = true
          expect(@xhr.responseText).to.match(/^\{.*\}$/)
          headers = JSON.parse @xhr.responseText
          expect(headers).to.have.property 'authorization'
          expect(headers['authorization']).to.equal 'trol, lol, lol'
          expect(headers).to.have.property 'x-answer'
          expect(headers['x-answer']).to.equal '42'
          done()
        @xhr.send ''

  describe 'with no headers', ->
    beforeEach ->
      @xhr.open 'POST', 'http://localhost:8912/_/headers'
      @xhr.responseType = 'text'

    it 'should set the protected headers correctly', (done) ->
      @xhr.onload = =>
        expect(@xhr.responseText).to.match(/^\{.*\}$/)
        headers = JSON.parse @xhr.responseText
        expect(headers).to.have.property 'connection'
        expect(headers['connection']).to.equal 'keep-alive'
        expect(headers).to.have.property 'host'
        expect(headers['host']).to.equal 'localhost:8912'
        expect(headers).to.have.property 'user-agent'
        expect(headers['user-agent']).to.match(/^Mozilla\//)
        done()
      @xhr.send ''

  describe '#getResponseHeader', ->
    beforeEach ->
      @xhr.open 'POST', 'http://localhost:8912/_/get_headers'
      @headerJson =
          '''
          {"Accept-Ranges": "bytes",
           "Content-Type": "application/xhr2; charset=utf-1337",
           "Set-Cookie": "UserID=JohnDoe; Max-Age=3600; Version=1",
           "X-Header": "one, more, value"}
          '''

    it 'returns accessible headers', (done) ->
      @xhr.onloadend = =>
        expect(@xhr.getResponseHeader('AccEPt-RANgeS')).to.equal 'bytes'
        expect(@xhr.getResponseHeader('content-Type')).to.
            equal 'application/xhr2; charset=utf-1337'
        expect(@xhr.getResponseHeader('X-Header')).to.equal "one, more, value"
        done()
      @xhr.send @headerJson

    it 'returns null for private headers', (done) ->
      @xhr.onloadend = =>
        expect(@xhr.getResponseHeader('set-cookie')).to.equal null
        done()
      @xhr.send @headerJson

    it 'returns headers when the XHR enters HEADERS_RECEIVED', (done) ->
      _done = false
      @xhr.onreadystatechange = =>
        return if _done or @xhr.readyState isnt XMLHttpRequest.HEADERS_RECEIVED
        _done = true
        expect(@xhr.getResponseHeader('AccEPt-RANgeS')).to.equal 'bytes'
        done()
      @xhr.send @headerJson

  describe '#getAllResponseHeaders', ->
    beforeEach ->
      @xhr.open 'POST', 'http://localhost:8912/_/get_headers'
      @headerJson =
          '''
          {"Accept-Ranges": "bytes",
           "Content-Type": "application/xhr2; charset=utf-1337",
           "Set-Cookie": "UserID=JohnDoe; Max-Age=3600; Version=1",
           "X-Header": "one, more, value"}
          '''

    it 'contains accessible headers', (done) ->
      @xhr.onloadend = =>
        headers = @xhr.getAllResponseHeaders()
        expect(headers).to.match(/(\A|\r\n)accept-ranges: bytes(\r\n|\Z)/mi)
        expect(headers).to.match(
            /(\A|\r\n)content-type: application\/xhr2; charset=utf-1337(\r\n|\Z)/mi)
        expect(headers).to.match(/(\A|\r\n)X-Header: one, more, value(\r\n|\Z)/mi)
        done()
      @xhr.send @headerJson

    it 'does not contain private headers', (done) ->
      @xhr.onloadend = =>
        headers = @xhr.getAllResponseHeaders()
        expect(headers).not.to.match(/(\A|\r\n)set-cookie:/mi)
        done()
      @xhr.send @headerJson

    it 'returns headers when the XHR enters HEADERS_RECEIVED', (done) ->
      _done = false
      @xhr.onreadystatechange = =>
        return if _done or @xhr.readyState isnt XMLHttpRequest.HEADERS_RECEIVED
        _done = true
        headers = @xhr.getAllResponseHeaders()
        expect(headers).to.match(/(\A|\r\n)accept-ranges: bytes(\r\n|\Z)/mi)
        done()
      @xhr.send @headerJson


