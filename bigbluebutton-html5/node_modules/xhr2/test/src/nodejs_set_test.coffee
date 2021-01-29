describe 'XMLHttpRequest', ->
  describe '.nodejsSet', ->
    beforeEach ->
      @xhr = new XMLHttpRequest
      @customXhr = new XMLHttpRequest

    describe 'with a httpAgent option', ->
      beforeEach ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.

        @customAgent = { custom: 'httpAgent' }
        @customXhr.nodejsHttpAgent = @customAgent

        @default = XMLHttpRequest::nodejsHttpAgent
        @agent = { mocking: 'httpAgent' }
        XMLHttpRequest.nodejsSet httpAgent: @agent

      it 'sets the default nodejsHttpAgent', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@xhr.nodejsHttpAgent).to.equal @agent

      it 'does not interfere with custom nodejsHttpAgent settings', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@customXhr.nodejsHttpAgent).to.equal @customAgent

      afterEach ->
        XMLHttpRequest.nodejsSet httpAgent: @default

    describe 'with a httpsAgent option', ->
      beforeEach ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.

        @customAgent = { custom: 'httpsAgent' }
        @customXhr.nodejsHttpsAgent = @customAgent

        @default = XMLHttpRequest::nodejsHttpsAgent
        @agent = { mocking: 'httpsAgent' }
        XMLHttpRequest.nodejsSet httpsAgent: @agent

      it 'sets the default nodejsHttpsAgent', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@xhr.nodejsHttpsAgent).to.equal @agent

      it 'does not interfere with custom nodejsHttpsAgent settings', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@customXhr.nodejsHttpsAgent).to.equal @customAgent

      afterEach ->
        XMLHttpRequest.nodejsSet httpsAgent: @default

    describe 'with a baseUrl option', ->
      beforeEach ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.

        @customBaseUrl = 'http://custom.url/base'
        @customXhr.nodejsBaseUrl = @customBaseUrl

        @default = XMLHttpRequest::nodejsBaseUrl
        @baseUrl = 'http://localhost/base'
        XMLHttpRequest.nodejsSet baseUrl: @baseUrl

      it 'sets the default nodejsBaseUrl', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@xhr.nodejsBaseUrl).to.equal @baseUrl

      it 'does not interfere with custom nodejsBaseUrl settings', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@customXhr.nodejsBaseUrl).to.equal @customBaseUrl

      afterEach ->
        XMLHttpRequest.nodejsSet baseUrl: @default

  describe '#nodejsSet', ->
    beforeEach ->
      @xhr = new XMLHttpRequest
      @customXhr = new XMLHttpRequest

    describe 'with a httpAgent option', ->
      beforeEach ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.

        @customAgent = { custom: 'httpAgent' }
        @customXhr.nodejsSet httpAgent: @customAgent

      it 'sets nodejsHttpAgent on the XHR instance', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@customXhr.nodejsHttpAgent).to.equal @customAgent

      it 'does not interfere with default nodejsHttpAgent settings', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@xhr.nodejsHttpAgent).not.to.equal @customAgent

    describe 'with a httpsAgent option', ->
      beforeEach ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.

        @customAgent = { custom: 'httpsAgent' }
        @customXhr.nodejsSet httpsAgent: @customAgent

      it 'sets nodejsHttpsAgent on the XHR instance', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@customXhr.nodejsHttpsAgent).to.equal @customAgent

      it 'does not interfere with default nodejsHttpsAgent settings', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        expect(@xhr.nodejsHttpsAgent).not.to.equal @customAgent

  describe 'base URL parsing', ->
    beforeEach ->
      @xhr = new XMLHttpRequest

    describe 'with null baseUrl', ->
      beforeEach ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        @xhr.nodejsSet baseUrl: null

      it 'parses an absolute URL', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        parsedUrl = @xhr._parseUrl('http://www.domain.com/path')
        expect(parsedUrl).to.be.ok
        expect(parsedUrl).to.have.property 'href'
        expect(parsedUrl.href).to.equal 'http://www.domain.com/path'

    describe 'with a (protocol, domain, filePath) baseUrl', ->
      beforeEach ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        @xhr.nodejsSet baseUrl: 'https://base.url/dir/file.html'

      it 'parses an absolute URL', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        parsedUrl = @xhr._parseUrl('http://www.domain.com/path')
        expect(parsedUrl).to.be.ok
        expect(parsedUrl).to.have.property 'href'
        expect(parsedUrl.href).to.equal 'http://www.domain.com/path'

      it 'parses a path-relative URL', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        parsedUrl = @xhr._parseUrl('path/to.js')
        expect(parsedUrl).to.be.ok
        expect(parsedUrl).to.have.property 'href'
        expect(parsedUrl.href).to.equal 'https://base.url/dir/path/to.js'

      it 'parses a path-relative URL with ..', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        parsedUrl = @xhr._parseUrl('../path/to.js')
        expect(parsedUrl).to.be.ok
        expect(parsedUrl).to.have.property 'href'
        expect(parsedUrl.href).to.equal 'https://base.url/path/to.js'

      it 'parses a host-relative URL', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        parsedUrl = @xhr._parseUrl('/path/to.js')
        expect(parsedUrl).to.be.ok
        expect(parsedUrl).to.have.property 'href'
        expect(parsedUrl.href).to.equal 'https://base.url/path/to.js'

      it 'parses a protocol-relative URL', ->
        return unless XMLHttpRequest.nodejsSet  # Skip in browsers.
        parsedUrl = @xhr._parseUrl('//domain.com/path/to.js')
        expect(parsedUrl).to.be.ok
        expect(parsedUrl).to.have.property 'href'
        expect(parsedUrl.href).to.equal 'https://domain.com/path/to.js'
