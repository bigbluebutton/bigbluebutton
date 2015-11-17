// Last time updated at May 23, 2015, 08:32:23
// Latest file can be found here: https://cdn.webrtc-experiment.com/getStats.js
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Source Code   - https://github.com/muaz-khan/getStats
// ___________
// getStats.js
// an abstraction layer runs top over RTCPeerConnection.getStats API
// cross-browser compatible solution
// http://dev.w3.org/2011/webrtc/editor/webrtc.html#dom-peerconnection-getstats
/*
getStats(function(result) {
    result.connectionType.remote.ipAddress
    result.connectionType.remote.candidateType
    result.connectionType.transport
});
*/
(function() {
    var RTCPeerConnection;
    if (typeof webkitRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = webkitRTCPeerConnection;
    }

    if (typeof mozRTCPeerConnection !== 'undefined') {
        RTCPeerConnection = mozRTCPeerConnection;
    }

    if (typeof MediaStreamTrack === 'undefined') {
        MediaStreamTrack = {}; // todo?
    }

    function getStats(mediaStreamTrack, callback, interval) {
        var peer = this;

        if (arguments[0] instanceof RTCPeerConnection) {
            peer = arguments[0];
            mediaStreamTrack = arguments[1];
            callback = arguments[2];
            interval = arguments[3];

            if (!(mediaStreamTrack instanceof MediaStreamTrack) && !!navigator.mozGetUserMedia) {
                throw '2nd argument is not instance of MediaStreamTrack.';
            }
        } else if (!(mediaStreamTrack instanceof MediaStreamTrack) && !!navigator.mozGetUserMedia) {
            throw '1st argument is not instance of MediaStreamTrack.';
        }

        var globalObject = {
            audio: {},
            video: {}
        };

        var nomore = false;

        (function getPrivateStats() {
            _getStats(function(results) {
                var result = {
                    audio: {},
                    video: {},
                    // TODO remove the raw results
                    // results: results,
                    nomore: function() {
                        nomore = true;
                    }
                };

                for (var i = 0; i < results.length; ++i) {
                    var res = results[i];

                    if (typeof res.timestamp === 'object') {
                        res.timestamp = res.timestamp.getTime();
                    }

                    if ((res.mediaType == 'audio' || (res.type == 'ssrc' && res.googCodecName == 'opus')) && typeof res.bytesSent !== 'undefined') {
                        if (typeof globalObject.audio.prevBytesSent === 'undefined') {
                            globalObject.audio.prevBytesSent = res.bytesSent;
                            globalObject.audio.prevSentTimestamp = res.timestamp - interval;
                        }

                        var bytes = res.bytesSent - globalObject.audio.prevBytesSent;
                        globalObject.audio.prevBytesSent = res.bytesSent;
                        var diffTimestamp = res.timestamp - globalObject.audio.prevSentTimestamp;
                        globalObject.audio.prevSentTimestamp = res.timestamp;

                        var kilobytes = bytes / 1024;
                        var kbitsSentPerSecond = (kilobytes * 8) / (diffTimestamp / 1000.0);

                        result.audio = merge(result.audio, {
                            availableBandwidth: kilobytes,
                            inputLevel: res.audioInputLevel,
                            packetsSent: res.packetsSent,
                            bytesSent: res.bytesSent,
                            kbitsSentPerSecond: kbitsSentPerSecond
                        });
                    }
                    if ((res.mediaType == 'audio' || (res.type == 'ssrc' && res.googCodecName == 'opus')) && typeof res.bytesReceived !== 'undefined') {
                        res.packetsLost = typeof res.packetsLost === 'string'? parseInt(res.packetsLost): res.packetsLost;
                        res.packetsReceived = typeof res.packetsReceived === 'string'? parseInt(res.packetsReceived): res.packetsReceived;

                        if (typeof globalObject.audio.prevBytesReceived === 'undefined') {
                            globalObject.audio.prevBytesReceived = res.bytesReceived;
                            globalObject.audio.prevPacketsReceived = res.packetsReceived;
                            globalObject.audio.prevReceivedTimestamp = res.timestamp - interval;
                            globalObject.audio.prevPacketsLost = res.packetsLost;
                            globalObject.audio.consecutiveFlaws = 0;
                        }

                        var intervalPacketsLost = res.packetsLost - globalObject.audio.prevPacketsLost;
                        var intervalPacketsReceived = res.packetsReceived - globalObject.audio.prevPacketsReceived;
                        var flaws = intervalPacketsLost;
                        if (flaws > 0) {
                            if (globalObject.audio.consecutiveFlaws > 0) {
                                flaws *= 2;
                            }
                            ++globalObject.audio.consecutiveFlaws;
                        } else {
                            globalObject.audio.consecutiveFlaws = 0;
                        }
                        var packetsLost = res.packetsLost + flaws;
                        var r = (Math.max(0, res.packetsReceived - packetsLost) / res.packetsReceived) * 100;
                        if (r > 100) {
                            r = 100;
                        }
                        // https://freeswitch.org/stash/projects/FS/repos/freeswitch/browse/src/switch_rtp.c?at=refs%2Fheads%2Fv1.4#1671
                        var mos = 1 + (0.035) * r + (0.000007) * r * (r-60) * (100-r);

                        var bytes = res.bytesReceived - globalObject.audio.prevBytesReceived;
                        var diffTimestamp = res.timestamp - globalObject.audio.prevReceivedTimestamp;
                        var packetDuration = diffTimestamp / (res.packetsReceived - globalObject.audio.prevPacketsReceived);
                        var intervalLossRate = intervalPacketsLost / (intervalPacketsLost + intervalPacketsReceived);

                        globalObject.audio.prevBytesReceived = res.bytesReceived;
                        globalObject.audio.prevReceivedTimestamp = res.timestamp;
                        globalObject.audio.prevPacketsReceived = res.packetsReceived;
                        globalObject.audio.prevPacketsLost = res.packetsLost;
                        
                        var kilobytes = bytes / 1024;
                        var kbitsReceivedPerSecond = (kilobytes * 8) / (diffTimestamp / 1000.0);

                        result.audio = merge(result.audio, {
                            availableBandwidth: kilobytes,
                            outputLevel: res.audioOutputLevel,
                            packetsLost: res.packetsLost,
                            jitter: typeof res.googJitterReceived !== 'undefined'? res.googJitterReceived: res.jitter,
                            jitterBuffer: res.googJitterBufferMs,
                            delay: res.googCurrentDelayMs,
                            packetsReceived: res.packetsReceived,
                            bytesReceived: res.bytesReceived,
                            kbitsReceivedPerSecond: kbitsReceivedPerSecond,
                            packetDuration: packetDuration,
                            r: r,
                            mos: mos,
                            intervalLossRate: intervalLossRate
                        });
                    }

                    // TODO make it work on Firefox
                    if (res.googCodecName == 'VP8') {
                        if (!globalObject.video.prevBytesSent)
                            globalObject.video.prevBytesSent = res.bytesSent;

                        var bytes = res.bytesSent - globalObject.video.prevBytesSent;
                        globalObject.video.prevBytesSent = res.bytesSent;

                        var kilobytes = bytes / 1024;

                        result.video = merge(result.video, {
                            availableBandwidth: kilobytes.toFixed(1),
                            googFrameHeightInput: res.googFrameHeightInput,
                            googFrameWidthInput: res.googFrameWidthInput,
                            googCaptureQueueDelayMsPerS: res.googCaptureQueueDelayMsPerS,
                            rtt: res.googRtt,
                            packetsLost: res.packetsLost,
                            packetsSent: res.packetsSent,
                            googEncodeUsagePercent: res.googEncodeUsagePercent,
                            googCpuLimitedResolution: res.googCpuLimitedResolution,
                            googNacksReceived: res.googNacksReceived,
                            googFrameRateInput: res.googFrameRateInput,
                            googPlisReceived: res.googPlisReceived,
                            googViewLimitedResolution: res.googViewLimitedResolution,
                            googCaptureJitterMs: res.googCaptureJitterMs,
                            googAvgEncodeMs: res.googAvgEncodeMs,
                            googFrameHeightSent: res.googFrameHeightSent,
                            googFrameRateSent: res.googFrameRateSent,
                            googBandwidthLimitedResolution: res.googBandwidthLimitedResolution,
                            googFrameWidthSent: res.googFrameWidthSent,
                            googFirsReceived: res.googFirsReceived,
                            bytesSent: res.bytesSent
                        });
                    }

                    if (res.type == 'VideoBwe') {
                        result.video.bandwidth = {
                            googActualEncBitrate: res.googActualEncBitrate,
                            googAvailableSendBandwidth: res.googAvailableSendBandwidth,
                            googAvailableReceiveBandwidth: res.googAvailableReceiveBandwidth,
                            googRetransmitBitrate: res.googRetransmitBitrate,
                            googTargetEncBitrate: res.googTargetEncBitrate,
                            googBucketDelay: res.googBucketDelay,
                            googTransmitBitrate: res.googTransmitBitrate
                        };
                    }

                    // res.googActiveConnection means either STUN or TURN is used.

                    if (res.type == 'googCandidatePair' && res.googActiveConnection == 'true') {
                        result.connectionType = {
                            local: {
                                candidateType: res.googLocalCandidateType,
                                ipAddress: res.googLocalAddress
                            },
                            remote: {
                                candidateType: res.googRemoteCandidateType,
                                ipAddress: res.googRemoteAddress
                            },
                            transport: res.googTransportType
                        };
                    }
                }

                callback(result);

                // second argument checks to see, if target-user is still connected.
                if (!nomore) {
                    typeof interval != undefined && interval && setTimeout(getPrivateStats, interval || 1000);
                }
            });
        })();

        // a wrapper around getStats which hides the differences (where possible)
        // following code-snippet is taken from somewhere on the github
        function _getStats(cb) {
            // if !peer or peer.signalingState == 'closed' then return;

            if (!!navigator.mozGetUserMedia) {
                peer.getStats(
                    mediaStreamTrack,
                    function(res) {
                        var items = [];
                        res.forEach(function(result) {
                            items.push(result);
                        });
                        cb(items);
                    },
                    cb
                );
            } else {
                peer.getStats(function(res) {
                    var items = [];
                    res.result().forEach(function(result) {
                        var item = {};
                        result.names().forEach(function(name) {
                            item[name] = result.stat(name);
                        });
                        item.id = result.id;
                        item.type = result.type;
                        item.timestamp = result.timestamp;
                        items.push(item);
                    });
                    cb(items);
                });
            }
        };
    }

    function merge(mergein, mergeto) {
        if (!mergein) mergein = {};
        if (!mergeto) return mergein;

        for (var item in mergeto) {
            mergein[item] = mergeto[item];
        }
        return mergein;
    }

    if (typeof module !== 'undefined'/* && !!module.exports*/) {
        module.exports = getStats;
    }
    
    if(typeof window !== 'undefined') {
        window.getStats = getStats;
    }
})();
