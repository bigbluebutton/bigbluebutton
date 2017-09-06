const request = require('supertest');
const nock = require("nock");
const Application = require('../application.js');
const Logger = require('../logger.js');
const utils = require('../utils.js');
const config = require('../config.js');
const Hook = require('../hook.js');
const Helpers = require('./helpers.js')
const sinon = require('sinon');
const winston = require('winston')

// Block winston from logging
Logger.remove(winston.transports.Console);
describe('bbb-webhooks tests', () => {
  before( () => {
    config.hooks.queueSize = 10;
    application = new Application();
    application.start();
    Hook.flushall();
  });
  after( () => {
    Hook.flushall();
  });

  describe('GET /bbb/api', () => {
    it('should reach api on server', (done) => {
      request(Helpers.url)
      .get('/bigbluebutton/api')
      .expect(200, done)
    })
  });

  describe('GET /hooks/list permanent', () => {
    it('should list permanent hook', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.listUrl, config.bbb.sharedSecret);
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
    after( () => {
      const hooks = Hook.allGlobalSync();
      Hook.removeSubscription(hooks[hooks.length-1].id);
    });
    it('should create a hook', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.createUrl, config.bbb.sharedSecret);
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
    before( () => {
      Hook.addSubscription(Helpers.callback,null,false,null);
    });
    it('should destroy a hook', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.destroyUrl, config.bbb.sharedSecret);
      getUrl = Helpers.destroyUrl + '&checksum=' + getUrl
      request(Helpers.url)
      .get(getUrl)
      .expect('Content-Type', /text\/xml/)
      .expect(200, done)
    })
  });

  describe('GET /hooks/destroy permanent hook', () => {
    it('should not destroy the permanent hook', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.destroyPermanent, config.bbb.sharedSecret);
      getUrl = Helpers.destroyPermanent + '&checksum=' + getUrl
      request(Helpers.url)
      .get(getUrl)
      .expect('Content-Type', /text\/xml/)
      .expect(200, (res) => {
        const hooks = Hook.allGlobalSync();
        if (hooks && hooks[0].callbackURL == config.hooks.aggr) {
          done();
        }
        else {
          done(new Error("should not delete permanent"));
        }
      })
    })
  });

  describe('GET /hooks/create getRaw hook', () => {
    after( () => {
      const hooks = Hook.allGlobalSync();
      Hook.removeSubscription(hooks[hooks.length-1].id);
    });
    it('should create a hook with getRaw=true', (done) => {
      let getUrl = utils.checksumAPI(Helpers.url + Helpers.createUrl + Helpers.createRaw, config.bbb.sharedSecret);
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
      Hook.addSubscription(Helpers.callback + 'diff',null,false, (err,reply) => {
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
    });
    it('should have different queues for each hook', (done) => {
      const create = Helpers.createMeeting()
      let getUrl = utils.checksumAPI(Helpers.url + create, config.bbb.sharedSecret)
      getUrl = create + '&checksum=' + getUrl
      request(Helpers.url)
      .get(getUrl)
      .expect('Content-Type', /text\/xml/)
      .expect(200, (res) => {
        const hooks = Hook.allGlobalSync();
        if (hooks && hooks[0].queue != hooks[hooks.length-1].queue) {
          done();
        }
        else {
          done(new Error("hooks using same queue"))
        }
      })
    })
  });
  // reduce queue size, fill queue with requests, try to add another one, if queue does not exceed, OK
  describe('Hook queues', () => {
    it('should limit queue size to defined in config', (done) => {
      let hook = Hook.allGlobalSync();
      hook = hook[0];
      for(i=0;i<=9;i++) { hook.enqueue("message" + i, true); }

      if (hook && hook.queue.length <= config.hooks.queueSize) {
        done();
      }
      else {
        done(new Error("hooks exceeded max queue size"))
      }
    })
  });

  describe('/POST mapped message', () => {
    before( () => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      hook.queue = [];
      hook.flushredis();
    });
    it('should post mapped message ', (done) => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      hook.enqueue(Helpers.mappedMessage);
      const getpost = nock(config.hooks.aggr[0])
      .filteringPath( (path) => {
        return path.split('?')[0];
      })
      .filteringRequestBody( (body) => {
        body = body.split("&timestamp")[0];
        return body;
      })
      .post("/", Helpers.encodedMessage)
      .reply(200, (res) => {
        done();
      });
    })
  });

  describe('/POST raw message', () => {
    before( () => {
      Hook.addSubscription(Helpers.callback,null,true, (err,hook) => {
        hook.flushredis();
      })
    });
    after( () => {
      const hooks = Hook.allGlobalSync();
      Hook.removeSubscription(hooks[hooks.length-1].id);
    });
    it('should post raw message ', (done) => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];

      const getpost = nock(Helpers.callback)
      .filteringPath( (path) => {
        return path.split('?')[0];
      })
      .filteringRequestBody( (body) => {
        if (body.indexOf("payload")) {
          return "raw message";
        }
        else { return "not raw"; }
      })
      .post("/", "raw message")
      .reply(200, () => {
        done();
      });

      const create = Helpers.createMeeting()
      let getUrl = utils.checksumAPI(Helpers.url + create, config.bbb.sharedSecret)
      getUrl = create + '&checksum=' + getUrl
      request(Helpers.url)
      .get(getUrl)
      .expect(200);
    })
  });

  describe('/POST multi message', () => {
    before( () =>{
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      hook.queue = [];
      hook.flushredis();
    });
    it('should post multi message ', (done) => {
      const hooks = Hook.allGlobalSync();
      const hook = hooks[0];
      hook.enqueue("multiMessage1", true);
      hook.enqueue("multiMessage2");
      const getpost = nock(config.hooks.aggr[0])
      .filteringPath( (path) => {
        return path.split('?')[0];
      })
      .filteringRequestBody( (body) => {
        if (body.indexOf("multiMessage1") && body.indexOf("multiMessage2")) {
          return "multiMess"
        }
        else {
          return "not multi"
        }
        return body;
      })
      .post("/", "multiMess")
      .reply(200, (res) => {
        done();
      });
    })
  });
});
