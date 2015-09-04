/*
 * Verto HTML5/Javascript Telephony Signaling and Control Protocol Stack for FreeSWITCH
 * Copyright (C) 2005-2014, Anthony Minessale II <anthm@freeswitch.org>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Verto HTML5/Javascript Telephony Signaling and Control Protocol Stack for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Anthony Minessale II <anthm@freeswitch.org>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Anthony Minessale II <anthm@freeswitch.org>
 *
 * jquery.FSRTC.js - WebRTC Glue code
 *
 */


var iceTimerSent = 0;
var iceTimerCompleted = 0;
var iceTimer;

(function($) {

    // Find the line in sdpLines that starts with |prefix|, and, if specified,
    // contains |substr| (case-insensitive search).
    function findLine(sdpLines, prefix, substr) {
        return findLineInRange(sdpLines, 0, -1, prefix, substr);
    }

    // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
    // and, if specified, contains |substr| (case-insensitive search).
    function findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
        var realEndLine = (endLine != -1) ? endLine : sdpLines.length;
        for (var i = startLine; i < realEndLine; ++i) {
            if (sdpLines[i].indexOf(prefix) === 0) {
                if (!substr || sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
                    return i;
                }
            }
        }
        return null;
    }

    // Gets the codec payload type from an a=rtpmap:X line.
    function getCodecPayloadType(sdpLine) {
        var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
        var result = sdpLine.match(pattern);
        return (result && result.length == 2) ? result[1] : null;
    }

    // Returns a new m= line with the specified codec as the first one.
    function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = [];
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) { // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            }
            if (elements[i] !== payload) newLine[index++] = elements[i];
        }
        return newLine.join(' ');
    }

    $.FSRTC = function(options) {
        this.options = $.extend({
            useVideo: null,
            useStereo: false,
            userData: null,
	    localVideo: null,
	    screenShare: false,
	    useCamera: "any",
            iceServers: false,
            videoParams: {},
            audioParams: {},
            callbacks: {
                onICEComplete: function() {},
                onICE: function() {},
                onOfferSDP: function() {}
            },
        }, options);

	this.enabled = true;

        this.mediaData = {
            SDP: null,
            profile: {},
            candidateList: []
        };


	if (moz) {
            this.constraints = {
		offerToReceiveAudio: true,
		offerToReceiveVideo: this.options.useVideo ? true : false,
            };
	} else {
            this.constraints = {
		optional: [{
		    'DtlsSrtpKeyAgreement': 'true'
		}],mandatory: {
		    OfferToReceiveAudio: true,
		    OfferToReceiveVideo: this.options.useVideo ? true : false,
		}
            };
	}

        if (self.options.useVideo) {
            self.options.useVideo.style.display = 'none';
        }

        setCompat();
        checkCompat();
    };

    $.FSRTC.prototype.useVideo = function(obj, local) {
        var self = this;

        if (obj) {
            self.options.useVideo = obj;
	    self.options.localVideo = local;
	    if (moz) {
		self.constraints.offerToReceiveVideo = true;
	    } else {
		self.constraints.mandatory.OfferToReceiveVideo = true;
	    }
        } else {
            self.options.useVideo = null;
	    self.options.localVideo = null;
            if (moz) {
		self.constraints.offerToReceiveVideo = false;
	    } else {
		self.constraints.mandatory.OfferToReceiveVideo = false;
	    }
        }

        if (self.options.useVideo) {
            self.options.useVideo.style.display = 'none';
        }
    };

    $.FSRTC.prototype.useStereo = function(on) {
        var self = this;
        self.options.useStereo = on;
    };

    // Sets Opus in stereo if stereo is enabled, by adding the stereo=1 fmtp param.
    $.FSRTC.prototype.stereoHack = function(sdp) {
        var self = this;

        if (!self.options.useStereo) {
            return sdp;
        }

        var sdpLines = sdp.split('\r\n');

        // Find opus payload.
        var opusIndex = findLine(sdpLines, 'a=rtpmap', 'opus/48000'),
        opusPayload;
        if (opusIndex) {
            opusPayload = getCodecPayloadType(sdpLines[opusIndex]);
        }

        // Find the payload in fmtp line.
        var fmtpLineIndex = findLine(sdpLines, 'a=fmtp:' + opusPayload.toString());
        if (fmtpLineIndex === null) return sdp;

        // Append stereo=1 to fmtp line.
        sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat('; stereo=1');

        sdp = sdpLines.join('\r\n');
        return sdp;
    };

    function setCompat() {
        $.FSRTC.moz = !!navigator.mozGetUserMedia;
        //navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;
        }
    }

    function checkCompat() {
        if (!navigator.getUserMedia) {
            alert('This application cannot function in this browser.');
            return false;
        }
        return true;
    }

    function onStreamError(self, e) {
        console.log('There has been a problem retrieving the streams - did you allow access? Check Device Resolution', e);
        doCallback(self, "onError", e);
    }

    function onStreamSuccess(self, stream) {
        console.log("Stream Success");
        doCallback(self, "onStream", stream);
    }

    function onICE(self, candidate) {
        self.mediaData.candidate = candidate;
        self.mediaData.candidateList.push(self.mediaData.candidate);

        doCallback(self, "onICE");
    }

    function doCallback(self, func, arg) {
        if (func in self.options.callbacks) {
            self.options.callbacks[func](self, arg);
        }
    }

    function onICEComplete(self, candidate) {
        console.log("ICE Complete");
        doCallback(self, "onICEComplete");
    }

    function onChannelError(self, e) {
        console.error("Channel Error", e);
        doCallback(self, "onError", e);
    }

    function onICESDP(self, sdp) {
        self.mediaData.SDP = self.stereoHack(sdp.sdp);
        console.log("ICE SDP");
        doCallback(self, "onICESDP");
    }

    function onAnswerSDP(self, sdp) {
        self.answer.SDP = self.stereoHack(sdp.sdp);
        console.log("ICE ANSWER SDP");
        doCallback(self, "onAnswerSDP", self.answer.SDP);
    }

    function onMessage(self, msg) {
        console.log("Message");
        doCallback(self, "onICESDP", msg);
    }

    function onRemoteStream(self, stream) {
        if (self.options.useVideo) {
            self.options.useVideo.style.display = 'block';
        }

        var element = self.options.useAudio;
        console.log("REMOTE STREAM", stream, element);

        if (typeof element.srcObject !== 'undefined') {
            element.srcObject = stream;
        } else if (typeof element.mozSrcObject !== 'undefined') {
            element.mozSrcObject = stream;
        } else if (typeof element.src !== 'undefined') {
            element.src = URL.createObjectURL(stream);
        } else {
            console.error('Error attaching stream to element.');
        }

        self.options.useAudio.play();
        self.remoteStream = stream;
    }

    function onOfferSDP(self, sdp) {
        self.mediaData.SDP = self.stereoHack(sdp.sdp);
        console.log("Offer SDP");
        doCallback(self, "onOfferSDP");
    }

    $.FSRTC.prototype.answer = function(sdp, onSuccess, onError) {
        this.peer.addAnswerSDP({
            type: "answer",
            sdp: sdp
        },
        onSuccess, onError);
    };

    $.FSRTC.prototype.stop = function() {
        var self = this;

        if (self.options.useVideo) {
            self.options.useVideo.style.display = 'none';
	    self.options.useVideo[moz ? 'mozSrcObject' : 'src'] = null;
        }

        if (self.localStream) {
            self.localStream.stop();
            self.localStream = null;
        }

        if (self.options.localVideo) {
            self.options.localVideo.style.display = 'none';
	    self.options.localVideo[moz ? 'mozSrcObject' : 'src'] = null;
        }

	if (self.options.localVideoStream) {
	    self.options.localVideoStream.stop();
        }

        if (self.peer) {
            console.log("stopping peer");
            self.peer.stop();
        }
    };

    $.FSRTC.prototype.getMute = function() {
	var self = this;
	return self.enabled;
    }

    $.FSRTC.prototype.setMute = function(what) {
	var self = this;
	var audioTracks = self.localStream.getAudioTracks();	

	for (var i = 0, len = audioTracks.length; i < len; i++ ) {
	    switch(what) {
	    case "on":
		audioTracks[i].enabled = true;
		break;
	    case "off":
		audioTracks[i].enabled = false;
		break;
	    case "toggle":
		audioTracks[i].enabled = !audioTracks[i].enabled;
	    default:
		break;
	    }

	    self.enabled = audioTracks[i].enabled;
	}

	return !self.enabled;
    }

    $.FSRTC.prototype.createAnswer = function(params) {
        var self = this;
        self.type = "answer";
        self.remoteSDP = params.sdp;
        console.debug("inbound sdp: ", params.sdp);

	self.options.useCamera = params.useCamera || "any";
	self.options.useMic = params.useMic || "any";
	self.options.useSpeak = params.useSpeak || "any";

        function onSuccess(stream) {
            self.localStream = stream;

            self.peer = RTCPeerConnection({
                type: self.type,
                attachStream: self.localStream,
                onICE: function(candidate) {
                    return onICE(self, candidate);
                },
                onICEComplete: function() {
                    return onICEComplete(self);
                },
                onRemoteStream: function(stream) {
                    return onRemoteStream(self, stream);
                },
                onICESDP: function(sdp) {
                    return onICESDP(self, sdp);
                },
                onChannelError: function(e) {
                    return onChannelError(self, e);
                },
                constraints: self.constraints,
                iceServers: self.options.iceServers,
                offerSDP: {
                    type: "offer",
                    sdp: self.remoteSDP
                }
            });

            onStreamSuccess(self);
        }

        function onError(e) {
            onStreamError(self, e);
        }

	var mediaParams = getMediaParams(self);

	console.log("Audio constraints", mediaParams.audio);
	console.log("Video constraints", mediaParams.video);

	if (self.options.useVideo && self.options.localVideo) {
            getUserMedia({
		constraints: {
                    audio: false,
                    video: {
			mandatory: self.options.videoParams,
			optional: []
                    },
		},
		localVideo: self.options.localVideo,
		onsuccess: function(e) {self.options.localVideoStream = e; console.log("local video ready");},
		onerror: function(e) {console.error("local video error!");}
            });
	}

        getUserMedia({
            constraints: {
		audio: mediaParams.audio,
		video: mediaParams.video
            },
            video: mediaParams.useVideo,
            onsuccess: onSuccess,
            onerror: onError
        });



    };

    function getMediaParams(obj) {

	var audio;

	if (obj.options.videoParams && obj.options.screenShare) {//obj.options.videoParams.chromeMediaSource == 'desktop') {

	    //obj.options.videoParams = {
	//	chromeMediaSource: 'screen',
	//	maxWidth:screen.width,
	//	maxHeight:screen.height
	//	chromeMediaSourceId = sourceId;
	  //  };

	    console.error("SCREEN SHARE");
	    audio = false;
	} else {
	    audio = {
		mandatory: obj.options.audioParams,
		optional: []
	    };

	    if (obj.options.useMic !== "any") {
		audio.optional = [{sourceId: obj.options.useMic}]
	    }

	}

	if (obj.options.useVideo && obj.options.localVideo) {
            getUserMedia({
		constraints: {
                    audio: false,
                    video: {
			mandatory: obj.options.videoParams,
			optional: []
                    },
		},
		localVideo: obj.options.localVideo,
		onsuccess: function(e) {self.options.localVideoStream = e; console.log("local video ready");},
		onerror: function(e) {console.error("local video error!");}
            });
	}

	var video = {};
	var bestFrameRate = obj.options.videoParams.vertoBestFrameRate;
	delete obj.options.videoParams.vertoBestFrameRate;

	if (window.moz) {
	    video = obj.options.videoParams;
	    if (!video.width) video.width = video.minWidth;
	    if (!video.height) video.height = video.minHeight;
	    if (!video.frameRate) video.frameRate = video.minFrameRate;
	} else {
	    video = {
		mandatory: obj.options.videoParams,
		optional: []
            }	    	    
	}
	
	var useVideo = obj.options.useVideo;

	if (useVideo && obj.options.useCamera && obj.options.useCamera !== "none") {
	    if (!video.optional) {
		video.optional = [];
	    }

	    if (obj.options.useCamera !== "any") {
		video.optional.push({sourceId: obj.options.useCamera});
	    }

	    if (bestFrameRate && !window.moz) {
		 video.optional.push({minFrameRate: bestFrameRate});
	    }

	} else {
	    video = null;
	    useVideo = null;
	}

	return {audio: audio, video: video, useVideo: useVideo};
    }
    


    $.FSRTC.prototype.call = function(profile) {
        checkCompat();
	
        var self = this;
	var screen = false;

        self.type = "offer";

	if (self.options.videoParams && self.options.screenShare) { //self.options.videoParams.chromeMediaSource == 'desktop') {
	    screen = true;
	}

        function onSuccess(stream) {
	    self.localStream = stream;

            self.peer = RTCPeerConnection({
                type: self.type,
                attachStream: self.localStream,
                onICE: function(candidate) {
                    return onICE(self, candidate);
                },
                onICEComplete: function() {
                    return onICEComplete(self);
                },
                onRemoteStream: screen ? function(stream) {console.error("SKIP");} : function(stream) {
                    return onRemoteStream(self, stream);
                },
                onOfferSDP: function(sdp) {
                    return onOfferSDP(self, sdp);
                },
                onICESDP: function(sdp) {
                    return onICESDP(self, sdp);
                },
                onChannelError: function(e) {
                    return onChannelError(self, e);
                },
                constraints: self.constraints,
                iceServers: self.options.iceServers,
            });

            onStreamSuccess(self, stream);
        }

        function onError(e) {
            onStreamError(self, e);
        }

	var mediaParams = getMediaParams(self);

	console.log("Audio constraints", mediaParams.audio);
	console.log("Video constraints", mediaParams.video);


        getUserMedia({
            constraints: {
                audio: mediaParams.audio,
                video: mediaParams.video
            },
            video: mediaParams.useVideo,
            onsuccess: onSuccess,
            onerror: onError
        });




        /*
        navigator.getUserMedia({
            video: self.options.useVideo,
            audio: true
        }, onSuccess, onError);
        */

    };

    // DERIVED from RTCPeerConnection-v1.5
    // 2013, @muazkh - github.com/muaz-khan
    // MIT License - https://www.webrtc-experiment.com/licence/
    // Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection
    window.moz = !!navigator.mozGetUserMedia;

    function RTCPeerConnection(options) {

        var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

        var STUN = {
            url: !moz ? 'stun:stun.l.google.com:19302' : 'stun:23.21.150.121'
        };

        var iceServers = null;

        if (options.iceServers) {
            var tmp = options.iceServers;

            if (typeof(tmp) === "boolean") {
                tmp = null;
            }

            if (tmp && !(typeof(tmp) == "object" && tmp.constructor === Array)) {
                console.warn("iceServers must be an array, reverting to default ice servers");
                tmp = null;
            }

            iceServers = {
                iceServers: tmp || [STUN]
            };

            if (!moz && !tmp) {
                iceServers.iceServers = [STUN];
            }
        }

        var optional = {
            optional: []
        };

        if (!moz) {
            optional.optional = [{
                DtlsSrtpKeyAgreement: true
            },
            {
                RtpDataChannels: options.onChannelMessage ? true : false
            }];
        }

        var peer = new PeerConnection(iceServers, optional);

        openOffererChannel();
        var x = 0;

        peer.onicecandidate = function(event) {
            if (event.candidate) {
                options.onICE(event.candidate);
		clearTimeout(iceTimer);
		iceTimer = setTimeout(function() {
		    iceTimerSent = 1;

		    if (iceTimerCompleted == 0) {

			if (options.onICEComplete) {
			    options.onICEComplete();
			}

			if (options.type == "offer") {
			    /* new mozilla now tries to be like chrome but it takes them 10 seconds to complete the ICE 
			       Booooooooo! This trickle thing is a waste of time...... We'll all have to re-code our engines 
			       to handle partial setups to maybe save 100m
			    */
			    if ((!moz || (!options.sentICESDP && peer.localDescription.sdp.match(/a=candidate/)) && !x && options.onICESDP)) {
				options.onICESDP(peer.localDescription);
				//x = 1;
				/*
				  x = 1;
				  peer.createOffer(function(sessionDescription) {
				  sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
				  peer.setLocalDescription(sessionDescription);
				  if (options.onICESDP) {
                                  options.onICESDP(sessionDescription);
				  }
				  }, onSdpError, constraints);
				*/
			    }
			} else {
			    if (!x && options.onICESDP) {
				options.onICESDP(peer.localDescription);
				//x = 1;
				/*
				  x = 1;
				  peer.createAnswer(function(sessionDescription) {
				  sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
				  peer.setLocalDescription(sessionDescription);
				  if (options.onICESDP) {
                                  options.onICESDP(sessionDescription);
				  }
				  }, onSdpError, constraints);
				*/
			    }
			}
		    }
		}, 1000);
            } else {
		if (iceTimerSent == 0) {
		    clearTimeout(iceTimer);
		    iceTimerCompleted = 1;

                    if (options.onICEComplete) {
			options.onICEComplete();
                    }

                    if (options.type == "offer") {
			/* new mozilla now tries to be like chrome but it takes them 10 seconds to complete the ICE 
			   Booooooooo! This trickle thing is a waste of time...... We'll all have to re-code our engines 
			   to handle partial setups to maybe save 100m
			*/
			if ((!moz || (!options.sentICESDP && peer.localDescription.sdp.match(/a=candidate/)) && !x && options.onICESDP)) {
                            options.onICESDP(peer.localDescription);
                            //x = 1;
                            /*
                              x = 1;
                              peer.createOffer(function(sessionDescription) {
                              sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
                              peer.setLocalDescription(sessionDescription);
                              if (options.onICESDP) {
                              options.onICESDP(sessionDescription);
                              }
                              }, onSdpError, constraints);
                            */
			}
                    } else {
			if (!x && options.onICESDP) {
                            options.onICESDP(peer.localDescription);
                            //x = 1;
                            /*
                              x = 1;
                              peer.createAnswer(function(sessionDescription) {
                              sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
                              peer.setLocalDescription(sessionDescription);
                              if (options.onICESDP) {
                              options.onICESDP(sessionDescription);
                              }
                              }, onSdpError, constraints);
                            */
			}
                    }
		}
            }
        };
	
        // attachStream = MediaStream;
        if (options.attachStream) peer.addStream(options.attachStream);

        // attachStreams[0] = audio-stream;
        // attachStreams[1] = video-stream;
        // attachStreams[2] = screen-capturing-stream;
        if (options.attachStreams && options.attachStream.length) {
            var streams = options.attachStreams;
            for (var i = 0; i < streams.length; i++) {
                peer.addStream(streams[i]);
            }
        }

        peer.onaddstream = function(event) {
            var remoteMediaStream = event.stream;

            // onRemoteStreamEnded(MediaStream)
            remoteMediaStream.onended = function() {
                if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
            };

            // onRemoteStream(MediaStream)
            if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

            //console.debug('on:add:stream', remoteMediaStream);
        };

        var constraints = options.constraints || {
	    offerToReceiveAudio: true,
	    offerToReceiveVideo: true   
        };

        // onOfferSDP(RTCSessionDescription)
        function createOffer() {
            if (!options.onOfferSDP) return;

            peer.createOffer(function(sessionDescription) {
                sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                options.onOfferSDP(sessionDescription);
		/* old mozilla behaviour the SDP was already great right away */
                if (moz && options.onICESDP && sessionDescription.sdp.match(/a=candidate/)) {
                    options.onICESDP(sessionDescription);
		    options.sentICESDP = 1;
                }
            },
            onSdpError, constraints);
        }

        // onAnswerSDP(RTCSessionDescription)
        function createAnswer() {
            if (options.type != "answer") return;

            //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
            peer.setRemoteDescription(new SessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
            peer.createAnswer(function(sessionDescription) {
                sessionDescription.sdp = serializeSdp(sessionDescription.sdp);
                peer.setLocalDescription(sessionDescription);
                if (options.onAnswerSDP) {
                    options.onAnswerSDP(sessionDescription);
                }
            },
            onSdpError, constraints);
        }

        // if Mozilla Firefox & DataChannel; offer/answer will be created later
        if ((options.onChannelMessage && !moz) || !options.onChannelMessage) {
            createOffer();
            createAnswer();
        }

        // DataChannel Bandwidth
        function setBandwidth(sdp) {
            // remove existing bandwidth lines
            sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');
            sdp = sdp.replace(/a=mid:data\r\n/g, 'a=mid:data\r\nb=AS:1638400\r\n');

            return sdp;
        }

        // old: FF<>Chrome interoperability management
        function getInteropSDP(sdp) {
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
            extractedChars = '';

            function getChars() {
                extractedChars += chars[parseInt(Math.random() * 40)] || '';
                if (extractedChars.length < 40) getChars();

                return extractedChars;
            }

            // usually audio-only streaming failure occurs out of audio-specific crypto line
            // a=crypto:1 AES_CM_128_HMAC_SHA1_32 --------- kAttributeCryptoVoice
            if (options.onAnswerSDP) sdp = sdp.replace(/(a=crypto:0 AES_CM_128_HMAC_SHA1_32)(.*?)(\r\n)/g, '');

            // video-specific crypto line i.e. SHA1_80
            // a=crypto:1 AES_CM_128_HMAC_SHA1_80 --------- kAttributeCryptoVideo
            var inline = getChars() + '\r\n' + (extractedChars = '');
            sdp = sdp.indexOf('a=crypto') == -1 ? sdp.replace(/c=IN/g, 'a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:' + inline + 'c=IN') : sdp;

            return sdp;
        }

        function serializeSdp(sdp) {
            //if (!moz) sdp = setBandwidth(sdp);
            //sdp = getInteropSDP(sdp);
            //console.debug(sdp);
            return sdp;
        }

        // DataChannel management
        var channel;

        function openOffererChannel() {
            if (!options.onChannelMessage || (moz && !options.onOfferSDP)) return;

            _openOffererChannel();

            if (!moz) return;
            navigator.mozGetUserMedia({
                audio: true,
                fake: true
            },
            function(stream) {
                peer.addStream(stream);
                createOffer();
            },
            useless);
        }

        function _openOffererChannel() {
            channel = peer.createDataChannel(options.channel || 'RTCDataChannel', moz ? {} : {
                reliable: false
            });

            if (moz) channel.binaryType = 'blob';

            setChannelEvents();
        }

        function setChannelEvents() {
            channel.onmessage = function(event) {
                if (options.onChannelMessage) options.onChannelMessage(event);
            };

            channel.onopen = function() {
                if (options.onChannelOpened) options.onChannelOpened(channel);
            };
            channel.onclose = function(event) {
                if (options.onChannelClosed) options.onChannelClosed(event);

                console.warn('WebRTC DataChannel closed', event);
            };
            channel.onerror = function(event) {
                if (options.onChannelError) options.onChannelError(event);

                console.error('WebRTC DataChannel error', event);
            };
        }

        if (options.onAnswerSDP && moz && options.onChannelMessage) openAnswererChannel();

        function openAnswererChannel() {
            peer.ondatachannel = function(event) {
                channel = event.channel;
                channel.binaryType = 'blob';
                setChannelEvents();
            };

            if (!moz) return;
            navigator.mozGetUserMedia({
                audio: true,
                fake: true
            },
            function(stream) {
                peer.addStream(stream);
                createAnswer();
            },
            useless);
        }

        // fake:true is also available on chrome under a flag!
        function useless() {
            log('Error in fake:true');
        }

        function onSdpSuccess() {}

        function onSdpError(e) {
            if (options.onChannelError) {
                options.onChannelError(e);
            }
            console.error('sdp error:', e);
        }

        return {
            addAnswerSDP: function(sdp, cbSuccess, cbError) {

                peer.setRemoteDescription(new SessionDescription(sdp), cbSuccess ? cbSuccess : onSdpSuccess, cbError ? cbError : onSdpError);
            },
            addICE: function(candidate) {
                peer.addIceCandidate(new IceCandidate({
                    sdpMLineIndex: candidate.sdpMLineIndex,
                    candidate: candidate.candidate
                }));
            },

            peer: peer,
            channel: channel,
            sendData: function(message) {
                if (channel) {
                    channel.send(message);
                }
            },

            stop: function() {
                peer.close();
                if (options.attachStream) {
                    options.attachStream.stop();
                }
            }

        };
    }

    // getUserMedia
    var video_constraints = {
        mandatory: {},
        optional: []
    };

    function getUserMedia(options) {
        var n = navigator,
        media;
        n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
        n.getMedia(options.constraints || {
            audio: true,
            video: video_constraints
        },
        streaming, options.onerror ||
        function(e) {
            console.error(e);
        });

        function streaming(stream) {
            //var video = options.video;
            //var localVideo = options.localVideo;
            //if (video) {
              //  video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
                //video.play();
            //}

            if (options.localVideo) {
                options.localVideo[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
		options.localVideo.style.display = 'block';
            }

            if (options.onsuccess) {
                options.onsuccess(stream);
            }

            media = stream;
        }

        return media;
    }

    $.FSRTC.validRes = [];

    $.FSRTC.resSupported = function(w, h) {
	for (var i in $.FSRTC.validRes) {
	    if ($.FSRTC.validRes[i][0] == w && $.FSRTC.validRes[i][1] == h) {
		return true;
	    }
	}

	return false;
    }

    $.FSRTC.bestResSupported = function() {
	var w = 0, h = 0;

	for (var i in $.FSRTC.validRes) {
	    if ($.FSRTC.validRes[i][0] > w && $.FSRTC.validRes[i][1] > h) {
		w = $.FSRTC.validRes[i][0];
		h = $.FSRTC.validRes[i][1];
	    }
	}

	return [w, h];
    }

    var resList = [[320, 180], [320, 240], [640, 360], [640, 480], [1280, 720], [1920, 1080]];
    var resI = 0;
    var ttl = 0;

    var checkRes = function (cam, func) {

	if (resI >= resList.length) {
            var res = {
               'validRes': $.FSRTC.validRes,
               'bestResSupported': $.FSRTC.bestResSupported()
            };
	    if (func) return func(res);
	    return;
	}

	var video = {
            mandatory: {},
            optional: []
        }	

	if (cam) {
	    video.optional = [{sourceId: cam}];
	}
	
	w = resList[resI][0];
	h = resList[resI][1];
	resI++;

	video.mandatory = {
	    "minWidth": w,
	    "minHeight": h,
	    "maxWidth": w,
	    "maxHeight": h
	};

	if (window.moz) {
	    video = video.mandatory;
	    if (!video.width) video.width = video.minWidth;
	    if (!video.height) video.height = video.minHeight;
	    if (!video.frameRate) video.frameRate = video.minFrameRate;
	}

	getUserMedia({
	    constraints: {
                audio: ttl++ == 0,
                video: video	    
	    },
	    onsuccess: function(e) {e.stop(); console.info(w + "x" + h + " supported."); $.FSRTC.validRes.push([w, h]); checkRes(cam, func);},
	    onerror: function(e) {console.error( w + "x" + h + " not supported."); checkRes(cam, func);}
        });
    }
    

    $.FSRTC.getValidRes = function (cam, func) {
	var used = [];

	$.FSRTC.validRes = [];
	resI = 0;

	checkRes(cam, func);
    }

    $.FSRTC.checkPerms = function () {
	getUserMedia({
	    constraints: {
		audio: true,
		video: true,
	    },
	    onsuccess: function(e) {e.stop(); console.info("media perm init complete");},
	    onerror: function(e) {console.error("media perm init error");}
	});
    }

})(jQuery);
