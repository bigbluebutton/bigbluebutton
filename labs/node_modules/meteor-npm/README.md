# Complete NPM integration for Meteor [![Build Status](https://travis-ci.org/arunoda/meteor-npm.png?branch=master)](https://travis-ci.org/arunoda/meteor-npm)

See MeteorHacks article on [Complete NPM integration for Meteor](http://meteorhacks.com/complete-npm-integration-for-meteor.html)

#### If you are migrating from Meteor 0.6.5.x to 0.6.6.x, please check this [issue](https://github.com/arunoda/meteor-npm/issues/12).

---

### Adding NPM support to your app

    mrt add npm

### Create packages.json file for listing dependencies.

    {
      "redis": "0.8.2",
      "github": "0.1.8"
    }

### Example on using npm module inside a Meteor method

~~~js
if (Meteor.isClient) {
  getGists = function getGists(user, callback) {
    Meteor.call('getGists', user, callback);
  }
}

if (Meteor.isServer) {
  Meteor.methods({
    'getGists': function getGists(user) {
      var GithubApi = Meteor.require('github');
      var github = new GithubApi({
          version: "3.0.0"
      });

      var gists = Async.runSync(function(done) {
        github.gists.getFromUser({user: 'arunoda'}, function(err, data) {
          done(null, data);
        });
      });

      return gists.result;
    }
  });
}
~~~

## API
> Available in the Server Side only

### Meteor.require(npmModuleName)

This method loads NPM modules you've specified in the `packages.json` file.

~~~
var Github = Meteor.require('github');
~~~

## Async Utilities
> Available in the Server Side only

Meteor APIs are executed synchronously. Most of the NodeJS modules works asynchronously. 
So we need a way to bride the gap. Async Utilities comes to rescue you.

### Async.runSync(function) 

`Async.runSync()` pause the execution until you invoke `done()` callback as shown below.

~~~
var response = Async.runSync(function(done) {
  setTimeout(function() { 
    done(null, 1001);
  }, 100);
});

console.log(response.result); // 1001
~~~

`done()` callback takes 2 arguments. `error` and the `result` object. You can get them as the return value of the `Async.runSync()` as shown as response in the above example.

return value is an object and it has 2 fields. `error` and `result`.

### Meteor.sync(function)

Same as `Async.runSync` but deprecated. 

### Async.wrap(function) 

Wrap an asynchronous function and allow it to be run inside Meteor without callbacks.

~~~

//declare a simple async function
function delayedMessge(delay, message, callback) {
  setTimeout(function() {
    callback(null, message);
  }, delay);
}

//wrapping
var wrappedDelayedMessage = Async.wrap(delayedMessge);

//usage
Meteor.methods({
  'delayedEcho': function(message) {
    var response = wrappedDelayedMessage(500, message);
    return response;
  }
});
~~~

If the callback has a result, it will be returned from the wrapped function. If there is an error, it will be thrown.

> `Async.wrap(function)` is very similar to `Meteor._wrapAsync`. 

### Async.wrap(object, functionName)

Very similar to `Async.wrap(function)`, 
but this API can be used to wrap an instance method of an object.

~~~
var github = new GithubApi({
    version: "3.0.0"
});

//wrapping github.user.getFrom
var wrappedGetFrom = Async.wrap(github.user, 'getFrom');
~~~

### Async.wrap(object, functionNameList)

Very similar to `Async.wrap(object, functionName)`, 
but this API can be used to wrap **multiple** instance methods of an object.

~~~
var github = new GithubApi({
    version: "3.0.0"
});

//wrapping github.user.getFrom and github.user.getEmails
var wrappedGithubUser = Async.wrap(github.user, ['getFrom', 'getEmails']);

//usage
var profile = wrappedGithubUser.getFrom('arunoda');
var emails = wrappedGithubUser.getEmails();
~~~
