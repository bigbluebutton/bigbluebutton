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

    if (isFirefox()) {
        RTCPeerConnection = mozRTCPeerConnection;
    }

    if (typeof MediaStreamTrack === 'undefined') {
        MediaStreamTrack = {}; // todo?
    }

    function isFirefox() {
        return typeof mozRTCPeerConnection !== 'undefined';
    }

    function arrayAverage(array) {
        var sum = 0;
        for( var i = 0; i < array.length; i++ ){
            sum += array[i];
        }
        return sum/array.length;
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
            var promise = _getStats(peer, mediaStreamTrack);
            promise.then(function(results) {
                var result = {
                    audio: {},
                    video: {},
                    // TODO remove the raw results
                    results: results,
                    nomore: function() {
                        nomore = true;
                    }
                };

                for (var key in results) {
                    var res = results[key];

                    res.timestamp = typeof res.timestamp === 'object'? res.timestamp.getTime(): res.timestamp;
                    res.packetsLost = typeof res.packetsLost === 'string'? parseInt(res.packetsLost): res.packetsLost;
                    res.packetsReceived = typeof res.packetsReceived === 'string'? parseInt(res.packetsReceived): res.packetsReceived;
                    res.bytesReceived = typeof res.bytesReceived === 'string'? parseInt(res.bytesReceived): res.bytesReceived;

                    if ((res.mediaType == 'audio' || (res.type == 'ssrc' && res.googCodecName == 'opus')) && typeof res.bytesSent !== 'undefined') {
                        if (typeof globalObject.audio.prevSent === 'undefined') {
                            globalObject.audio.prevSent = res;
                        }

                        var bytes = res.bytesSent - globalObject.audio.prevSent.bytesSent;
                        var diffTimestamp = res.timestamp - globalObject.audio.prevSent.timestamp;

                        var kilobytes = bytes / 1024;
                        var kbitsSentPerSecond = (kilobytes * 8) / (diffTimestamp / 1000.0);

                        result.audio = merge(result.audio, {
                            availableBandwidth: kilobytes,
                            inputLevel: res.audioInputLevel,
                            packetsSent: res.packetsSent,
                            bytesSent: res.bytesSent,
                            kbitsSentPerSecond: kbitsSentPerSecond
                        });

                        globalObject.audio.prevSent = res;
                    }
                    if ((res.mediaType == 'audio' || (res.type == 'ssrc' && res.googCodecName == 'opus')) && typeof res.bytesReceived !== 'undefined') {
                        if (typeof globalObject.audio.prevReceived === 'undefined') {
                            globalObject.audio.prevReceived = res;
                            globalObject.audio.consecutiveFlaws = 0;
                            globalObject.audio.globalBitrateArray = [ ];
                        }

                        var intervalPacketsLost = res.packetsLost - globalObject.audio.prevReceived.packetsLost;
                        var intervalPacketsReceived = res.packetsReceived - globalObject.audio.prevReceived.packetsReceived;
                        var intervalBytesReceived = res.bytesReceived - globalObject.audio.prevReceived.bytesReceived;
                        var intervalLossRate = intervalPacketsLost + intervalPacketsReceived == 0? 1: intervalPacketsLost / (intervalPacketsLost + intervalPacketsReceived);
                        var intervalBitrate = (intervalBytesReceived / interval) * 8;
                        var globalBitrate = arrayAverage(globalObject.audio.globalBitrateArray);
                        var intervalEstimatedLossRate;
                        if (isFirefox()) {
                            intervalEstimatedLossRate = Math.max(0, globalBitrate - intervalBitrate) / globalBitrate;
                        } else {
                            intervalEstimatedLossRate = intervalLossRate;
                        }

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

                        var bytes = res.bytesReceived - globalObject.audio.prevReceived.bytesReceived;
                        var diffTimestamp = res.timestamp - globalObject.audio.prevReceived.timestamp;
                        var packetDuration = diffTimestamp / (res.packetsReceived - globalObject.audio.prevReceived.packetsReceived);
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
                            intervalLossRate: intervalLossRate,
                            intervalEstimatedLossRate: intervalEstimatedLossRate,
                            globalBitrate: globalBitrate
                        });
                        
                        globalObject.audio.prevReceived = res;
                        globalObject.audio.globalBitrateArray.push(intervalBitrate);
                        // 12 is the number of seconds we use to calculate the global bitrate
                        if (globalObject.audio.globalBitrateArray.length > 12 / (interval / 1000)) {
                            globalObject.audio.globalBitrateArray.shift();
                        }
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
            }, function(exception) {
                console.log("Promise rejected: " + exception.message);
                callback(null);
            });
        })();

        // taken from http://blog.telenor.io/webrtc/2015/06/11/getstats-chrome-vs-firefox.html
        function _getStats(pc, selector) {
            if (navigator.mozGetUserMedia) {
                return pc.getStats(selector);
            }
            return new Promise(function(resolve, reject) {
                pc.getStats(function(response) {
                    var standardReport = {};
                    response.result().forEach(function(report) {
                        var standardStats = {
                            id: report.id,
                            timestamp: report.timestamp,
                            type: report.type
                        };
                        report.names().forEach(function(name) {
                            standardStats[name] = report.stat(name);
                        });
                        standardReport[standardStats.id] = standardStats;
                    });
                    resolve(standardReport);
                }, selector, reject);
            });
        }
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
