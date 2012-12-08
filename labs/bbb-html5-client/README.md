BBB-HTML5-Client
================

## 1. Install [Node.js](http://www.nodejs.org)

## 2. Install [Redis](http://redis.io/download/)

## 3. Clone this repo
```
git clone https://github.com/ryanseys/bbb-html5-client.git
```
## 4. Install node dependencies
```
cd bbb-html5-client
npm install
```

## 5. Install [ImageMagick](http://www.imagemagick.org/script/binary-releases.php)

## 6. Run the Redis server
```
redis-server
```

## 7. Run the BBB server
```
cd bbb-html5-client
node app.js
```

TODOs
=====

- Allow for change of font size in text tool
- Update the cleanup of Redis to ensure all keys created during a meeting are removed from Redis once the meeting is destroyed
- Update UI to look nicer
- Add mouse events to shapes and slides instead of just cursor so user can move the mouse quickly, and click to pan right away
- Put textbox in a smart place when using the text tool. (such as a popup modal)


Notes
=====

* Raphael.js doesn't work well with Require.js. Currently we're using an alternative version
  of Raphael that can be loaded by Require.js. See: https://github.com/DmitryBaranovskiy/raphael/issues/407.
  Another option is to use [shim config](http://requirejs.org/docs/api.html#config-shim), but wasn't working for Raphael yet.
  Currently using Raphael.js from `pmcelhaney/raphael@pure-amd-2 (9a6125bb518bc)` and eve.js from
  `DmitryBaranovskiy/eve@2243bf22164`.
