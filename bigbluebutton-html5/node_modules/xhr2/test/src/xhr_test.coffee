describe 'XMLHttpRequest', ->
  beforeEach ->
    @xhr = new XMLHttpRequest

  describe 'constructor', ->
    it 'sets readyState to UNSENT', ->
      expect(@xhr.readyState).to.equal XMLHttpRequest.UNSENT

    it 'sets timeout to 0', ->
      expect(@xhr.timeout).to.equal 0

    it 'sets responseType to ""', ->
      expect(@xhr.responseType).to.equal ''

    it 'sets status to 0', ->
      expect(@xhr.status).to.equal 0

    it 'sets statusText to ""', ->
      expect(@xhr.statusText).to.equal ''

  describe '#open', ->
    it 'throws SecurityError on CONNECT', ->
      expect(=> @xhr.open 'CONNECT', 'http://localhost:8912/test').to.
          throw(SecurityError)

    describe 'with a GET for a local https request', ->
      beforeEach ->
        @xhr.open 'GET', 'https://localhost:8911/test/fixtures/hello.txt'

      it 'sets readyState to OPENED', ->
        expect(@xhr.readyState).to.equal XMLHttpRequest.OPENED

      it 'keeps status 0', ->
        expect(@xhr.status).to.equal 0

      it 'keeps statusText ""', ->
        expect(@xhr.statusText).to.equal ''

  describe '#send', ->
    describe 'on a local http GET', ->
      beforeEach ->
        @xhr.open 'GET', 'http://localhost:8912/test/fixtures/hello.txt'

      it 'kicks off the request', (done) ->
        @xhr.onload = (event) =>
          expect(@xhr.status).to.equal 200
          expect(@xhr.responseText).to.equal 'Hello world!\n'
          done()
        @xhr.send()

    describe 'on a local https GET', ->
      beforeEach ->
        @xhr.open 'GET', 'https://localhost:8911/test/fixtures/hello.txt'

      it 'kicks off the request', (done) ->
        @xhr.onload = (event) =>
          expect(@xhr.status).to.equal 200
          expect(@xhr.responseText).to.equal 'Hello world!\n'
          done()
        @xhr.send()

    describe 'on a local relative GET', ->
      beforeEach ->
        @xhr.open 'GET', '../fixtures/hello.txt'

      it 'kicks off the request', (done) ->
        @xhr.onload = (event) =>
          expect(@xhr.status).to.equal 200
          expect(@xhr.responseText).to.equal 'Hello world!\n'
          done()
        @xhr.send()

  describe 'on a local gopher GET', ->
    describe '#open + #send', ->
      it 'throw a NetworkError', ->
        expect(=>
          @xhr.open 'GET', 'gopher:localhost:8911'
          @xhr.send()
        ).to.throw(NetworkError)

  describe 'readyState constants', ->
    it 'UNSENT < OPENED', ->
      expect(XMLHttpRequest.UNSENT).to.be.below(XMLHttpRequest.OPENED)

    it 'OPENED < HEADERS_RECEIVED', ->
      expect(XMLHttpRequest.OPENED).to.be.
          below(XMLHttpRequest.HEADERS_RECEIVED)

    it 'HEADERS_RECEIVED < LOADING', ->
      expect(XMLHttpRequest.HEADERS_RECEIVED).to.be.
          below(XMLHttpRequest.LOADING)

    it 'LOADING < DONE', ->
      expect(XMLHttpRequest.LOADING).to.be.below(XMLHttpRequest.DONE)

    it 'XMLHttpRequest constants match the instance costants', ->
      expect(XMLHttpRequest.UNSENT).to.equal @xhr.UNSENT
      expect(XMLHttpRequest.OPENED).to.equal @xhr.OPENED
      expect(XMLHttpRequest.HEADERS_RECEIVED).to.equal @xhr.HEADERS_RECEIVED
      expect(XMLHttpRequest.LOADING).to.equal @xhr.LOADING
      expect(XMLHttpRequest.DONE).to.equal @xhr.DONE

