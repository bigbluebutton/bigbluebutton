describe 'XMLHttpRequest', ->
  beforeEach ->
    @xhr = new XMLHttpRequest
    @dripUrl = 'http://localhost:8912/_/drip'
    @dripJson = drips: 3, size: 1000, ms: 50, length: true

  describe 'level 2 events', ->
    beforeEach ->
      @events = []
      @endFired = false
      @events.check = -> null  # replaced by tests
      @xhr.addEventListener 'loadstart', (event) =>
        expect(event.type).to.equal 'loadstart'
        expect(@endFired).to.equal false
        @events.push event
      @xhr.addEventListener 'progress', (event) =>
        expect(event.type).to.equal 'progress'
        expect(@endFired).to.equal false
        @events.push event
      @xhr.addEventListener 'load', (event) =>
        expect(event.type).to.equal 'load'
        expect(@endFired).to.equal false
        @events.push event
      @xhr.addEventListener 'loadend', (event) =>
        expect(event.type).to.equal 'loadend'
        expect(@endFired).to.equal false
        @endFired = 'loadend already fired'
        @events.push event
        @events.check()
      @xhr.addEventListener 'error', (event) =>
        expect(event.type).to.equal 'error'
        expect(@endFired).to.equal false
        @events.push event
      @xhr.addEventListener 'abort', (event) =>
        expect(event.type).to.equal 'abort'
        expect(@endFired).to.equal false
        @events.push event

    describe 'for a successful fetch with Content-Length set', ->
      beforeEach ->
        @xhr.open 'POST', @dripUrl
        @xhr.send JSON.stringify(@dripJson)

      it 'events have the correct target', (done) ->
        @events.check = =>
          for event in @events
            expect(event.target).to.equal @xhr
          done()

      it 'events have the correct bubbling setup', (done) ->
        @events.check = =>
          for event in @events
            expect(event.bubbles).to.equal false
            expect(event.cancelable).to.equal false
          done()

      it 'events have the correct progress info', (done) ->
        @events.check = =>
          for event in @events
            switch event.type
              when 'loadstart'
                expect(event.loaded).to.equal 0
                expect(event.lengthComputable).to.equal false
                expect(event.total).to.equal 0
              when 'load', 'loadend'
                expect(event.loaded).to.equal 3000
                expect(event.lengthComputable).to.equal true
                expect(event.total).to.equal 3000
              when 'progress'
                if event.lengthComputable
                  expect(event.loaded).to.be.gte 0
                  expect(event.loaded).to.be.lte 3000
                  expect(event.total).to.equal 3000
                else
                  expect(event.loaded).to.be.gte 0
                  expect(event.total).to.equal 0
          done()

      it 'events include at least one intermediate progress event', (done) ->
        @events.check = =>
          found = 'no suitable progress event emitted'
          for event in @events
            continue unless event.type is 'progress'
            continue unless event.loaded > 0
            continue unless event.loaded < event.total
            found = true
          expect(found).to.equal true
          done()

    describe 'for a successful fetch without Content-Length set', ->
      beforeEach ->
        @xhr.open 'POST', @dripUrl
        @dripJson.length = false
        @xhr.send JSON.stringify(@dripJson)

      it 'events have the correct progress info', (done) ->
        @events.check = =>
          for event in @events
            expect(event.lengthComputable).to.equal false
            expect(event.total).to.equal 0
            switch event.type
              when 'loadstart'
                expect(event.loaded).to.equal 0
              when 'load', 'loadend'
                expect(event.loaded).to.equal 3000
              when 'progress'
                expect(event.loaded).to.be.gte 0
          done()

      it 'events include at least one intermediate progress event', (done) ->
        @events.check = =>
          found = 'no suitable progress event emitted'
          for event in @events
            continue unless event.type is 'progress'
            continue if event.loaded is 0
            continue if event.loaded is 3000
            found = true
          expect(found).to.equal true
          done()

    describe 'for a network error due to bad DNS', (done) ->
      beforeEach ->
        @xhr.open 'GET', 'https://broken.to.cause.an.xhrnetworkerror.com'
        @xhr.send()

      it 'no progress or load is emitted', (done) ->
        @events.check = =>
          for event in @events
            expect(event.type).not.to.equal 'load'
            expect(event.type).not.to.equal 'progress'
          done()

      it 'events include an error event', (done) ->
        @events.check = =>
          found = 'no suitable error emitted'
          for event in @events
            continue unless event.type is 'error'
            found = true
          expect(found).to.equal true
          done()

  describe 'readystatechange', ->
    beforeEach ->
      @events = []
      @states = []
      @doneFired = false
      @events.check = -> null  # replaced by tests
      @xhr.addEventListener 'readystatechange', (event) =>
        expect(event.type).to.equal 'readystatechange'
        expect(@doneFired).to.equal false
        @events.push event
        @states.push event.target.readyState
        if event.target.readyState is XMLHttpRequest.DONE
          @doneFired = 'DONE already fired'
          @events.check()

    describe 'for a successful fetch with Content-Length set', ->
      beforeEach ->
        @xhr.open 'POST', @dripUrl
        @xhr.send JSON.stringify(@dripJson)

      it 'events have the correct target', (done) ->
        @events.check = =>
          for event in @events
            expect(event.target).to.equal @xhr
          done()

      it 'events have the correct bubbling setup', (done) ->
        @events.check = =>
          for event in @events
            expect(event.bubbles).to.equal false
            expect(event.cancelable).to.equal false
          done()

      it 'events states are in the correct order', (done) ->
        @events.check = =>
          expect(@states).to.deep.equal [XMLHttpRequest.OPENED,
              XMLHttpRequest.HEADERS_RECEIVED,
              XMLHttpRequest.LOADING, XMLHttpRequest.DONE]
          done()

    describe 'for a successful fetch without Content-Length set', ->
      beforeEach ->
        @xhr.open 'POST', @dripUrl
        @dripJson.length = false
        @xhr.send JSON.stringify(@dripJson)

      it 'events states are in the correct order', (done) ->
        @events.check = =>
          expect(@states).to.deep.equal [XMLHttpRequest.OPENED,
              XMLHttpRequest.HEADERS_RECEIVED, XMLHttpRequest.LOADING,
              XMLHttpRequest.DONE]
          done()

    describe 'for a network error due to bad DNS', (done) ->
      beforeEach ->
        @xhr.open 'GET', 'https://broken.to.cause.an.xhrnetworkerror.com'
        @xhr.send()

      it 'events states are in the correct order', (done) ->
        @events.check = =>
          expect(@states).to.deep.equal [XMLHttpRequest.OPENED,
              XMLHttpRequest.DONE]
          done()
