describe 'XMLHttpRequest', ->
  describe '#responseURL', ->
    beforeEach ->
      @xhr = new XMLHttpRequest

    it 'provies the URL of the response', (done) ->
      @xhr.open 'GET', 'http://localhost:8912/_/method'
      @xhr.onload = =>
        expect(@xhr.responseURL).to.equal("http://localhost:8912/_/method")
        done()
      @xhr.send()

    it 'ignores the hash fragment', (done) ->
      @xhr.open 'GET', 'http://localhost:8912/_/method#foo'
      @xhr.onload = =>
        expect(@xhr.responseURL).to.equal("http://localhost:8912/_/method")
        done()
      @xhr.send()
