describe 'XMLHttpRequest', ->
  describe '#responseType', ->
    beforeEach ->
      @xhr = new XMLHttpRequest
      @jsonUrl = 'http://localhost:8912/test/fixtures/hello.json'
      @jsonString = '{"hello": "world", "answer": 42}\n'
      @imageUrl = 'http://localhost:8912/test/fixtures/xhr2.png'

    describe 'text', ->
      it 'reads a JSON file into a String', (done) ->
        @xhr.addEventListener 'load', =>
          expect(@xhr.response).to.equal @jsonString
          expect(@xhr.responseText).to.equal @jsonString
          done()
        @xhr.open 'GET', @jsonUrl
        @xhr.responseType = 'text'
        @xhr.send()

    describe 'json', ->
      it 'reads a JSON file into a parsed JSON object', (done) ->
        _done = false
        @xhr.addEventListener 'readystatechange', =>
          return if _done or @xhr.readyState isnt XMLHttpRequest.DONE
          _done = true
          expect(@xhr.response).to.deep.equal hello: 'world', answer: 42
          done()
        @xhr.open 'GET', @jsonUrl
        @xhr.responseType = 'json'
        @xhr.send()

      it 'produces null when reading a non-JSON file ', (done) ->
        @xhr.addEventListener 'loadend', =>
          expect(@xhr.response).to.equal null
          done()
        @xhr.open 'GET', 'http://localhost:8912/test/fixtures/hello.txt'
        @xhr.responseType = 'json'
        @xhr.send()

    describe 'arraybuffer', ->
      it 'reads a JSON file into an ArrayBuffer', (done) ->
        @xhr.addEventListener 'loadend', =>
          expect(@xhr.response).to.be.instanceOf ArrayBuffer
          view = new Uint8Array @xhr.response
          string = (String.fromCharCode(view[i]) for i in [0...view.length]).
              join ''
          expect(string).to.equal @jsonString
          done()
        @xhr.open 'GET', @jsonUrl
        @xhr.responseType = 'arraybuffer'
        @xhr.send()

      it 'reads a binary file into an ArrayBuffer', (done) ->
        @xhr.addEventListener 'loadend', =>
          expect(@xhr.response).to.be.instanceOf ArrayBuffer
          view = new Uint8Array @xhr.response
          bytes = (view[i] for i in [0...view.length])
          expect(bytes).to.deep.equal xhr2PngBytes
          done()
        @xhr.open 'GET', @imageUrl
        @xhr.responseType = 'arraybuffer'
        @xhr.send()


    describe 'buffer', ->
      it 'reads a JSON file into a node.js Buffer', (done) ->
        return done() if typeof Buffer is 'undefined'
        @xhr.addEventListener 'loadend', =>
          buffer = @xhr.response
          expect(buffer).to.be.instanceOf Buffer
          stringChars = for i in [0...buffer.length]
            String.fromCharCode buffer.readUInt8(i)
          expect(stringChars.join('')).to.equal @jsonString
          done()
        @xhr.open 'GET', @jsonUrl
        @xhr.responseType = 'buffer'
        @xhr.send()

      it 'reads a binary file into a node.js Buffer', (done) ->
        return done() if typeof Buffer is 'undefined'
        @xhr.addEventListener 'loadend', =>
          buffer = @xhr.response
          expect(buffer).to.be.instanceOf Buffer
          bytes = (buffer.readUInt8(i) for i in [0...buffer.length])
          expect(bytes).to.deep.equal xhr2PngBytes
          done()
        @xhr.open 'GET', @imageUrl
        @xhr.responseType = 'buffer'
        @xhr.send()
