ReconnectingWebSocket
=====================

A small JavaScript library that decorates the WebSocket API to provide a WebSocket connection that will automatically reconnect if the connection is dropped.

It is API compatible, so when you have:

```javascript
var ws = new WebSocket('ws://....');
```

you can replace with:

```javascript
var ws = new ReconnectingWebSocket('ws://....');
```

Minified library with gzip compression is less than 600 bytes.

How reconnections occur
-----------------------

With the standard `WebSocket` API, the events you receive from the WebSocket instance are typically:

    onopen
    onmessage
    onmessage
    onmessage
    onclose // At this point the WebSocket instance is dead.

With a `ReconnectingWebSocket`, after an `onclose` event is called it will automatically attempt to reconnect. In addition, a connection is attempted repeatedly (with a small pause) until it succeeds. So the events you receive may look something more like:

    onopen
    onmessage
    onmessage
    onmessage
    onclose
    // ReconnectingWebSocket attempts to reconnect
    onopen
    onmessage
    onmessage
    onmessage
    onclose
    // ReconnectingWebSocket attempts to reconnect
    onopen
    onmessage
    onmessage
    onmessage
    onclose

This is all handled automatically for you by the library.

## Parameters

```javascript
var socket = new ReconnectingWebSocket(url, protocols, options);
```

#### `url`
- The URL you are connecting to.
- http://dev.w3.org/html5/websockets/#the-websocket-interface

#### `protocols`
- Optional string or array of protocols per the WebSocket spec.
- [http://dev.w3.org/html5/websockets/#refsWSP

#### `options`
- Options (see below)

## Options

Options can either be passed as the 3rd parameter upon instantiation or set directly on the object after instantiation:

```javascript
var socket = new ReconnectingWebSocket(url, null, {debug: true, reconnectInterval: 3000});
```

or

```javascript
var socket = new ReconnectingWebSocket(url);
socket.debug = true;
socket.timeoutInterval = 5400;
```

#### `debug`
- Whether this instance should log debug messages or not. Debug messages are printed to `console.debug()`.
- Accepts `true` or `false`
- Default value: `false`

#### `automaticOpen`
- Whether or not the websocket should attempt to connect immediately upon instantiation. The socket can be manually opened or closed at any time using ws.open() and ws.close().
- Accepts `true` or `false`
- Default value: `true`

#### `reconnectInterval`
- The number of milliseconds to delay before attempting to reconnect.
- Accepts `integer`
- Default: `1000`

#### `maxReconnectInterval`
- The maximum number of milliseconds to delay a reconnection attempt.
- Accepts `integer`
- Default: `30000`

####`reconnectDecay`
- The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist.
- Accepts `integer` or `float`
- Default: `1.5`

#### `timeoutInterval`
- The maximum time in milliseconds to wait for a connection to succeed before closing and retrying.
- Accepts `integer`
- Default: `2000`

#### `maxReconnectAttempts`
- The maximum number of reconnection attempts that will be made before giving up. If null, reconnection attempts will be continue to be made forever.
- Accepts `integer` or `null`.
- Default: `null`

---

## Methods

#### `ws.open()`
- Open the Reconnecting Websocket

#### `ws.close(code, reason)`
- Closes the WebSocket connection or connection attempt, if any. If the connection is already CLOSED, this method does nothing.
- `code` is optional the closing code (default value 1000). [https://tools.ietf.org/html/rfc6455#section-7.4.1](https://tools.ietf.org/html/rfc6455#section-7.4.1)
- `reason` is the optional reason that the socket is being closed. [https://tools.ietf.org/html/rfc6455#section-7.1.6](https://tools.ietf.org/html/rfc6455#section-7.1.6)

#### `ws.refresh()`
- Refresh the connection if still open (close and then re-open it).

#### `ws.send(data)`
- Transmits data to the server over the WebSocket connection.
- Accepts @param data a text string, ArrayBuffer or Blob

Like this? Check out [websocketd](https://github.com/joewalnes/websocketd) for the simplest way to create WebSocket backends from any programming language.

[Follow @joewalnes](https://twitter.com/joewalnes)

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/joewalnes/reconnecting-websocket/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
