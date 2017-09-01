[![Build Status](https://travis-ci.org/webrtc/adapter.svg)](https://travis-ci.org/webrtc/adapter)

# WebRTC adapter #
[adapter.js] is a shim to insulate apps from spec changes and prefix differences. In fact, the standards and protocols used for WebRTC implementations are highly stable, and there are only a few prefixed names. For full interop information, see [webrtc.org/web-apis/interop](http://www.webrtc.org/web-apis/interop).

## Install ##

#### Bower
```bash
bower install webrtc-adapter
```

#### NPM
```bash
npm install webrtc-adapter-test
```

## Inclusion on Browser ##

#### Bower
```html
<script src="bower_components/webrtc-adapter/adapter.js"></script>
```

#### NPM
Copy to desired location in your src tree or use a minify/vulcanize tool (node_modules is usually not published with the code).
See [webrtc/samples repo](https://github.com/webrtc/samples/blob/master/package.json) as an example on how you can do this.

## Development ##
Detailed information on developing in the [webrtc](https://github.com/webrtc) github repo can be found in the [WebRTC GitHub repo developer's guide](https://docs.google.com/document/d/1tn1t6LW2ffzGuYTK3366w1fhTkkzsSvHsBnOHoDfRzY/edit?pli=1#heading=h.e3366rrgmkdk).

Head over to [test/README.md](https://github.com/webrtc/samples/blob/gh-pages/test/README.md) and get started developing.
