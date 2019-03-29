const request = require('supertest');
const nock = require("nock");
const Logger = require('../logger.js');
const utils = require('../utils.js');
const config = require('config');
const Hook = require('../hook.js');
const Helpers = require('./helpers.js')
const sinon = require('sinon');
const winston = require('winston');

Application = require('../application.js');

const sharedSecret = process.env.SHARED_SECRET || sharedSecret;

let globalHooks = config.get('hooks');

// Block winston from logging
Logger.remove(winston.transports.Console);
describe('bbb-webhooks tests', () => {
  before( (done) => {
    globalHooks.queueSize = 10;
    globalHooks.permanentURLs = [ { url: "http://wh.requestcatcher.com", getRaw: true } ];
    application = new Application();
    application.start( () => {
      done();
    });
  });
  beforeEach( (done) => {
    const hooks = Hook.allGlobalSync();
    Helpers.flushall(Application.redisClient());
    hooks.forEach( hook => {
      Helpers.flushredis(hook);
    })
    done();
  })
  after( () => {
    const hooks = Hook.allGlobalSync();
    Helpers.flushall(Application.redisClient());
    hooks.forEach( hook => {
      Helpers.flushredis(hook);
    })
  });

  describe('GET /hooks/list permanent', () => {
    it('should list permanent hook', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.listUrl, sharedSecret);
      getUrl = Helpers.listUrl + '?checksum=' + getUrl

      request(Helpers.url)
      .get(getUrl)
      .expect('Content-Type', /text\/xml/)
      .expect(200, (res) => {
        const hooks = Hook.allGlobalSync();
        if (hooks && hooks.some( hook => { return hook.permanent }) ) {
          done();
        }
        else {
          done(new Error ("permanent hook was not created"));
        }
      })
    })
  });

  describe('GET /hooks/create', () => {
    after( (done) => {
      const hooks = Hook.allGlobalSync();
      Hook.removeSubscription(hooks[hooks.length-1].id, () => { done(); });
    });
    it('should create a hook', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.createUrl, sharedSecret);
      getUrl = Helpers.createUrl + '&checksum=' + getUrl

      request(Helpers.url)
        .get(getUrl)
        .expect('Content-Type', /text\/xml/)
        .expect(200, (res) => {
          const hooks = Hook.allGlobalSync();
          if (hooks && hooks.some( hook => { return !hook.permanent }) ) {
            done();
          }
          else {
            done(new Error ("hook was not created"));
          }
        })
    })
  });

  describe('GET /hooks/destroy', () => {
    before( (done) => {
      Hook.addSubscription(Helpers.callback,null,false,() => { done(); });
    });
    it('should destroy a hook', (done) => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[hooks.length-1].id;
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.destroyUrl(hook), sharedSecret);
      getUrl = Helpers.destroyUrl(hook) + '&checksum=' + getUrl

      request(Helpers.url)
        .get(getUrl)
        .expect('Content-Type', /text\/xml/)
        .expect(200, (res) => {
          const hooks = Hook.allGlobalSync();
          if(hooks && hooks.every( hook => { return hook.callbackURL != Helpers.callback }))
            done();
        })
    })
  });

  describe('GET /hooks/destroy permanent hook', () => {
    it('should not destroy the permanent hook', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.destroyPermanent, sharedSecret);
      getUrl = Helpers.destroyPermanent + '&checksum=' + getUrl
      request(Helpers.url)
      .get(getUrl)
      .expect('Content-Type', /text\/xml/)
      .expect(200, (res) => {
        const hooks = Hook.allGlobalSync();
        if (hooks && hooks[0].callbackURL == globalHooks.permanentURLs[0].url) {
          done();
        }
        else {
          done(new Error("should not delete permanent"));
        }
      })
    })
  });

  describe('GET /hooks/create getRaw hook', () => {
    after( (done) => {
      const hooks = Hook.allGlobalSync();
      Hook.removeSubscription(hooks[hooks.length-1].id, () => { done(); });
    });
    it('should create a hook with getRaw=true', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.createUrl + Helpers.createRaw, sharedSecret);
      getUrl = Helpers.createUrl + '&checksum=' + getUrl + Helpers.createRaw

      request(Helpers.url)
        .get(getUrl)
        .expect('Content-Type', /text\/xml/)
        .expect(200, (res) => {
          const hooks = Hook.allGlobalSync();
          if (hooks && hooks.some( (hook) => { return hook.getRaw })) {
            done();
          }
          else {
            done(new Error("getRaw hook was not created"))
          }
        })
    })
  });

  describe('Hook queues', () => {
    before( () => {
      Application.redisPubSubClient().psubscribe("test-channel");
      Hook.addSubscription(Helpers.callback,null,false, (err,reply) => {
        const hooks = Hook.allGlobalSync();
        const hook = hooks[0];
        const hook2 = hooks[hooks.length -1];
        sinon.stub(hook, '_processQueue');
        sinon.stub(hook2, '_processQueue');
      });
    });
    after( () => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      const hook2 = hooks[hooks.length -1];

      hook._processQueue.restore();
      hook2._processQueue.restore();
      Hook.removeSubscription(hooks[hooks.length-1].id);
      Application.redisPubSubClient().unsubscribe("test-channel");
    });
    it('should have different queues for each hook', (done) => {
      Application.redisClient().publish("test-channel", JSON.stringify(Helpers.rawMessage));
      const hooks = Hook.allGlobalSync();

      if (hooks && hooks[0].queue != hooks[hooks.length-1].queue) {
        done();
      }
      else {
        done(new Error("hooks using same queue"))
      }
    })
  });
  // reduce queue size, fill queue with requests, try to add another one, if queue does not exceed, OK
  describe('Hook queues', () => {
    before( () => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      sinon.stub(hook, '_processQueue');
    });
    after( () => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      hook._processQueue.restore();
      Helpers.flushredis(hook);
    })
    it('should limit queue size to defined in config', (done) => {
      let hook = Hook.allGlobalSync();
      hook = hook[0];
      for(i=0;i<=9;i++) { hook.enqueue("message" + i); }

      if (hook && hook.queue.length <= globalHooks.queueSize) {
        done();
      }
      else {
        done(new Error("hooks exceeded max queue size"))
      }
    })
  });

  describe('/POST mapped message', () => {
    before( () => {
      Application.redisPubSubClient().psubscribe("test-channel");
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      hook.queue = [];
      Helpers.flushredis(hook);
    });
    after( () => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      Helpers.flushredis(hook);
      Application.redisPubSubClient().unsubscribe("test-channel");
    })
    it('should post mapped message ', (done) => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];

      const getpost = nock(globalHooks.permanentURLs[0].url)
                      .filteringRequestBody( (body) => {
                        let parsed = JSON.parse(body)
                        return parsed[0].data.id ? "mapped" : "not mapped";
                      })
                      .post("/", "mapped")
                      .reply(200, (res) => {
                        done();
                      });
      Application.redisClient().publish("test-channel", JSON.stringify(Helpers.rawMessage));
    })
  });

  describe('/POST raw message', () => {
    before( () => {
      Application.redisPubSubClient().psubscribe("test-channel");
      Hook.addSubscription(Helpers.callback,null,true, (err,hook) => {
        Helpers.flushredis(hook);
      })
    });
    after( () => {
      const hooks = Hook.allGlobalSync();
      Hook.removeSubscription(hooks[hooks.length-1].id);
      Helpers.flushredis(hooks[hooks.length-1]);
      Application.redisPubSubClient().unsubscribe("test-channel");
    });
    it('should post raw message ', (done) => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];

      const getpost = nock(Helpers.callback)
                      .filteringRequestBody( (body) => {
                        if (body.indexOf("PresenterAssignedEvtMsg")) {
                          return "raw message";
                        }
                        else { return "not raw"; }
                      })
                      .post("/", "raw message")
                      .reply(200, () => {
                        done();
                      });
      const permanent = nock(globalHooks.permanentURLs[0].url)
                        .post("/")
                        .reply(200)
      Application.redisClient().publish("test-channel", JSON.stringify(Helpers.rawMessage));
    })
  });

  describe('/POST multi message', () => {
    before( () =>{
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      Helpers.flushredis(hook);
      hook.queue = ["multiMessage1"];
    });
    it('should post multi message ', (done) => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      hook.enqueue("multiMessage2")
      const getpost = nock(globalHooks.permanentURLs[0].url)
                      .filteringPath( (path) => {
                        return path.split('?')[0];
                      })
                      .filteringRequestBody( (body) => {
                        if (body.indexOf("multiMessage1") != -1 && body.indexOf("multiMessage2") != -1) {
                          return "multiMess"
                        }
                        else {
                          return "not multi"
                        }
                      })
                      .post("/", "multiMess")
                      .reply(200, (res) => {
                        done();
                      });
    })
  });
});
