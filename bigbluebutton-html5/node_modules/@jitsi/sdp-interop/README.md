[![Build Status](https://travis-ci.org/jitsi/sdp-interop.svg?branch=master)](https://travis-ci.org/jitsi/sdp-interop)

## Introduction

(or _Unified Plan, Plan B and the answer to life, the universe and eveything!_)

If somebody wants to talk about interoperability between Firefox and Chome when
doing multi-party video conferences, it is impossible to not talk a little bit
(or a lot!) about [Unified
Plan](https://tools.ietf.org/html/draft-roach-mmusic-unified-plan-00) and [Plan
B](https://tools.ietf.org/html/draft-uberti-rtcweb-plan-00). Unified Plan and
Plan B were two competing IETF drafts for the negotiation and exchange of
multiple media sources (AKA MediaStreamTracks, or MSTs) between two WebRTC
endpoints. Unified Plan is being incorporated in the [JSEP
draft](https://tools.ietf.org/html/draft-ietf-rtcweb-jsep-09) and is on its way
to becoming an IETF standard while Plan B has expired in 2013 and nobody should
care about it anymore, right? Wrong!

Plan B lives on in the Chrome and its derivatives, like Chromium and Opera.
There's actually an issue in the Chromium bug tracker to add support for
[Unified Plan in
Chromium](https://code.google.com/p/chromium/issues/detail?id=465349), but
that'll take some time. Firefox, on the other hand, has, [as of
recently](https://hacks.mozilla.org/2015/03/webrtc-in-firefox-38-multistream-and-renegotiation/),
implemented Unified Plan.

Developers that want to support both Firefox and Chrome have to deal with this
situation and implement some kind of _interoperability_ layer between Chrome and
it derivatives and Firefox.

The most substantial difference between Unified Plan and Plan B is how they
represent media stream tracks. Unified Plan extends the standard way of
encoding this information in SDP which is to have each RTP flow (i.e., SSRC)
appear on its own m-line. So, each media stream track is represented by its own
unique m-line.  This is a strict one-to-one mapping; a single media stream
track cannot be spread across several m-lines, nor may a single m-line
represent multiple media stream tracks.

Plan B takes a different approach, and creates a hierarchy within SDP; a m=
line defines an "envelope", specifying codec and transport parameters, and
a=ssrc lines are used to describe individual media sources within that
envelope. So, typically, a Plan B SDP has three channels, one for audio, one
for video and one for the data.

### Installation

Install locally from npm:

```bash
$ npm install sdp-interop
```

## Implementation

This module gives a general solution to the problem of SDP interoperability
described in the previous section and deals with it at the lowest level. The idea
is to build a PeerConnection adapter that will feed the right SDP to the browser,
i.e. Unified Plan to Firefox and Plan B to Chrome and that would give a Plan B SDP
to the application.

### The SDP interoperability layer

sdp-interop is a reusable npm module that offers the two simple methods:

* `toUnifiedPlan(sdp)` that takes an SDP string and transforms it into a
  Unified Plan SDP.
* `toPlanB(sdp)` that, not surprisingly, takes an SDP string and transforms it
  to Plan B SDP.

The PeerConnection adapter wraps the `setLocalDescription()`,
`setRemoteDescription()` methods and the success callbacks of the
`createAnswer()` and `createOffer()` methods. If the browser is Chrome, the
adapter does nothing. If, on the other hand, the browser is Firefox the
PeerConnection adapter...

* calls the `toUnifiedPlan()` method of the sdp-interop module prior to calling
  the `setLocalDescription()` or the `setRemoteDescription()` methods, thus
  converting the Plan B SDP from the application to a Unified Plan SDP that
  Firefox can understand.
* calls the `toPlanB()` method prior to calling the `createAnswer()` or the
  `createOffer()` success callback, thus converting the Unified Plan SDP from
  Firefox to a Plan B SDP that the application can understand.

Here's a sample PeerConnection adapter:

```javascript
function PeerConnectionAdapter(ice_config, constraints) {
    var RTCPeerConnection = navigator.mozGetUserMedia
      ? mozRTCPeerConnection : webkitRTCPeerConnection;
    this.peerconnection = new RTCPeerConnection(ice_config, constraints);
    this.interop = new require('sdp-interop').Interop();
}

PeerConnectionAdapter.prototype.setLocalDescription
  = function (description, successCallback, failureCallback) {
    // if we're running on FF, transform to Unified Plan first.
    if (navigator.mozGetUserMedia)
        description = this.interop.toUnifiedPlan(description);

    var self = this;
    this.peerconnection.setLocalDescription(description,
        function () { successCallback(); },
        function (err) { failureCallback(err); }
    );
};

PeerConnectionAdapter.prototype.setRemoteDescription
  = function (description, successCallback, failureCallback) {
    // if we're running on FF, transform to Unified Plan first.
    if (navigator.mozGetUserMedia)
        description = this.interop.toUnifiedPlan(description);

    var self = this;
    this.peerconnection.setRemoteDescription(description,
        function () { successCallback(); },
        function (err) { failureCallback(err); }
    );
};

PeerConnectionAdapter.prototype.createAnswer
  = function (successCallback, failureCallback, constraints) {
    var self = this;
    this.peerconnection.createAnswer(
        function (answer) {
            if (navigator.mozGetUserMedia)
                answer = self.interop.toPlanB(answer);
            successCallback(answer);
        },
        function(err) {
            failureCallback(err);
        },
        constraints
    );
};

PeerConnectionAdapter.prototype.createOffer
  = function (successCallback, failureCallback, constraints) {
    var self = this;
    this.peerconnection.createOffer(
        function (offer) {
            if (navigator.mozGetUserMedia)
                offer = self.interop.toPlanB(offer);
            successCallback(offer);
        },
        function(err) {
            failureCallback(err);
        },
        constraints
    );
};
```

### Beyond the basics

Like everything in life, sdp-interop is not "perfect", it makes certain
assumptions and it has some limitations. First and foremost, unfortunately, a
Plan B offer/answer does not have enough information to rebuild an equivalent
Unified Plan offer/answer. So, while it is easy to go from Plan B to Unified
Plan, the opposite is not possible without keeping some state.

Suppose, for example, that a Firefox client gets an offer from the Focus to
join a large call. In the _native_ create answer success callback you get a
Unified Plan answer that contains multiple m-lines. You convert it in a Plan B
answer using the sdp-interop module and hand it over to the app to do its
thing. At some point later-on, the app calls the adapter's
`setLocalDescription()` method. The adapter will have to convert the Plan B
answer back to a Unified Plan one to pass it to Firefox.

That's the tricky part because you can't naively put any SSRC in any m-line,
each SSRC has to be put back into the same m-line that it was in the original
answer from the native create answer success callback. The order of the m-lines
is important too, so each m-line has to be in the same position it was in the
original answer from the native create answer success callback (which matches
the position of the m-line in the Unified Plan offer). It is also forbidden to
remove an m-line, instead they must be marked as inactive, if they're no longer
used.  Similar considerations have to be taken into account when converting a
Plan B offer to a Unified Plan one when doing renegotiation, for example.

We solved this issue by caching both the most recent Unified Plan offer and the
most recent Unified Plan answer. When we go from Plan B to Unified Plan we use
the cached Unified Plan offer/answer and add the missing information from
there. You can see
[here](https://github.com/jitsi/sdp-interop/blob/d4569a12875a7180004726633793430eccd7f47b/lib/interop.js#L175)
how we do this exactly.

Another soft limitation (in the sense that it can be removed given enough
effort) is that we require bundle and rtcp-mux for both Chrome and Firefox
endpoints, so all the media whatever the channel is, go through a single port. This is tracked in [issue #3](https://github.com/jitsi/sdp-interop/issues/3).

One last soft limitation is that we have currently tested the interoperability
layer only when Firefox answers a call and not when it offers one because in
our architecture endpoints always get invited to join a call and never offer
one. This is tracked in [issue #4](https://github.com/jitsi/sdp-interop/issues/4).

## Copyright notice

Copyright @ 2015 Atlassian Pty Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
