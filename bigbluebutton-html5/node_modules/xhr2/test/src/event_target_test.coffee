describe 'XMLHttpRequestEventTarget', ->
  describe 'dispatchEvent', ->
    beforeEach ->
      @xhr = new XMLHttpRequest
      @loadEvent = new ProgressEvent 'load'

    it 'works with a DOM0 listener', ->
      count = 0
      @xhr.onload = (event) ->
        count += 1
      @xhr.dispatchEvent @loadEvent
      expect(count).to.equal 1

    it 'works with a DOM2 listener', ->
      count = 0
      @xhr.addEventListener 'load', (event) ->
        count += 1
      @xhr.dispatchEvent @loadEvent
      expect(count).to.equal 1

    it 'removes a DOM2 listener correctly', ->
      count = 0
      listener = (event) ->
        count += 1
      @xhr.addEventListener 'load', listener
      @xhr.dispatchEvent @loadEvent
      expect(count).to.equal 1

      count = 0
      @xhr.removeEventListener 'load', listener
      @xhr.dispatchEvent @loadEvent
      expect(count).to.equal 0

    it 'binds this correctly in a DOM0 listener', ->
      eventThis = null
      @xhr.onload = (event) ->
        eventThis = @
      @xhr.dispatchEvent @loadEvent
      expect(eventThis).to.equal @xhr

    it 'binds this correctly in a DOM2 listener', ->
      eventThis = null
      @xhr.addEventListener 'load', (event) ->
        eventThis = @
      @xhr.dispatchEvent @loadEvent
      expect(eventThis).to.equal @xhr

    it 'sets target correctly in a DOM0 listener', ->
      eventTarget = null
      @xhr.onload = (event) ->
        eventTarget = event.target
      @xhr.dispatchEvent @loadEvent
      expect(eventTarget).to.equal @xhr

    it 'sets target correctly in a DOM2 listener', ->
      eventTarget = null
      @xhr.addEventListener 'load', (event) ->
        eventTarget = event.target
      @xhr.dispatchEvent @loadEvent
      expect(eventTarget).to.equal @xhr

    it 'works with a DOM0 and two DOM2 listeners', ->
      count = [0, 0, 0]
      @xhr.addEventListener 'load', (event) ->
        count[1] += 1
      @xhr.onload = (event) ->
        count[0] += 1
      @xhr.addEventListener 'load', (event) ->
        count[2] += 1
      @xhr.dispatchEvent @loadEvent
      expect(count).to.deep.equal [1, 1, 1]

    it 'does not invoke a DOM0 listener for a different event', ->
      count = 0
      @xhr.onerror = (event) ->
        count += 1
      @xhr.dispatchEvent @loadEvent
      expect(count).to.equal 0

    it 'does not invoke a DOM2 listener for a different event', ->
      count = 0
      @xhr.addEventListener 'error', (event) ->
        count += 1
      @xhr.dispatchEvent @loadEvent
      expect(count).to.equal 0
