require("../setup")
should = require("should")
sinon = require("sinon")

config = require("../../config")
Modules = require("../../lib/modules")

describe "Modules", ->

  beforeEach (done) ->
    @target = new Modules()
    done()

  describe "#constructor", ->

    it "instantiates @modules as an empty object", (done) ->
      @target.modules.should.be.an.Object
      @target.modules.should.eql({})
      done()

    it "instantiates @callbacks as an empty array", (done) ->
      @target.callbacks.should.be.an.Array
      @target.callbacks.should.eql([])
      done()

  describe "#register", ->

    it "returns the module registered", (done) ->
      module = { any: 1 }
      name = "my-module"
      @target.register(name, module).should.equal(module)
      done()

    it "stores the module in @modules", (done) ->
      module = { any: 1 }
      name = "my-module"
      @target.register(name, module)
      @target.modules.should.have.keys(name)
      @target.modules[name].should.equal(module)
      done()

    it "calls any callbacks that are done", (done) ->
      module = { any: 1 }
      name = "my-module"

      # registers a callback that has to be called when @target.register is called
      spy = @sinonSandbox.spy()
      @target.wait([name], spy)

      @target.register(name, module)

      # the real verification
      spy.calledOnce.should.be.true

      done()

  describe "#wait", ->

    it "registers a new callback", (done) ->
      names = ['first', 'second']
      callback = -> true

      @target.callbacks.length.should.eql(0)
      @target.wait(names, callback)
      @target.callbacks.length.should.eql(1)
      @target.callbacks[0].modules.should.eql(names)
      @target.callbacks[0].fn.should.equal(callback)
      done()

    it "accepts a single module as parameter", (done) ->
      name = 'first'
      callback = -> true

      @target.callbacks.length.should.eql(0)
      @target.wait(name, callback)
      @target.callbacks.length.should.eql(1)
      @target.callbacks[0].modules.should.eql([name])
      @target.callbacks[0].fn.should.equal(callback)
      done()

    it "if the modules are already registered, calls their callbacks", (done) ->
      name = 'first'
      @target.register(name, {})

      spy = @sinonSandbox.spy()
      @target.wait([name], spy)

      spy.calledOnce.should.be.true

      done()

  describe "#get", ->

    it "returns a registered module", (done) ->
      name = 'my-module'
      module = { any: 1 }
      @target.register(name, module)

      @target.get(name).should.equal(module)
      done()

    it "returns undefined if the module is not defined", (done) ->
      name = 'my-module'
      should.strictEqual(undefined, @target.get(name))
      done()

  describe "#all", ->

    it "returns all registered modules", (done) ->
      name = 'my-module-1'
      module = { any: 1 }
      @target.register(name, module)
      name = 'my-module-2'
      module = { any: 2 }
      @target.register(name, module)

      expected = { 'my-module-1': { any: 1 }, 'my-module-2': { any: 2 } }

      @target.all().should.eql(expected)
      done()
