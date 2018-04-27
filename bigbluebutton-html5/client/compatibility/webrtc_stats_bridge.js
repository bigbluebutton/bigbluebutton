var logger = window.Logger || console;
var monitoredTracks = {};

function arrayAverage(array) {
    var sum = 0;
    for( var i = 0; i < array.length; i++ ){
        sum += array[i];
    }
    return sum/array.length;
}

function customGetStats(peer, mediaStreamTrack, callback, interval) {
    var globalObject = {
        audio: {},
        video: {},
    };

    var nomore = false;

    (function getPrivateStats() {
        var promise;
        try {
            promise = peer.getStats(mediaStreamTrack);
        } catch (e) {
            promise = Promise.reject(e);
        }
        promise.then(function(results) {
            var audioInbound = {};
            var audioOutbound = {};
            var videoInOrOutbound = {};
            var localCandidate = {};
            var remoteCandidate = {};

            results.forEach(function(res) {
                if ((res.type == 'outbound-rtp' || res.type == 'outboundrtp') && res.mediaType == 'audio') {
                    audioOutbound = res;
                } else if ((res.type == 'inbound-rtp' || res.type == 'inboundrtp') && res.mediaType == 'audio') {
                    audioInbound = res;
                }
                if (res.type == 'ssrc' || res.type == 'inbound-rtp' || res.type == 'outbound-rtp') {
                    if (res.mediaType == 'audio') {
                        if (typeof (res.audioInputLevel) !== 'undefined') {
                            audioInbound = res;
                            audioOutbound = res;
                            res.packetsSent = parseInt(res.packetsSent);
                            res.bytesSent = parseInt(res.bytesSent);
                            res.packetsLost = parseInt(res.packetsLost);
                            res.packetsReceived = res.packetsSent - res.packetsLost;
                            res.jitter = parseInt(res.googJitterReceived) / 1000;
                        }
                    } else if (res.mediaType == 'video') {
                        res.packetsSent = parseInt(res.packetsSent);
                        res.packetsLost = parseInt(res.packetsLost) || 0;
                        res.packetsReceived = parseInt(res.packetsReceived);

                        if (isNaN(res.packetsSent) && res.packetsReceived == 0) {
                            return; // Discard local video receiving
                        }

                        if (res.googFrameWidthReceived) {
                          res.width = parseInt(res.googFrameWidthReceived);
                          res.height = parseInt(res.googFrameHeightReceived);
                        } else if (res.googFrameWidthSent) {
                          res.width = parseInt(res.googFrameWidthSent);
                          res.height = parseInt(res.googFrameHeightSent);
                        }

                        // Extra fields available on Chrome
                        if (res.googCodecName) res.codec = res.googCodecName;
                        if (res.googDecodeMs) res.decodeDelay = res.googDecodeMs;
                        if (res.googEncodeUsagePercent) res.encodeUsagePercent = res.googEncodeUsagePercent;
                        if (res.googRtt) res.rtt = res.googRtt;
                        if (res.googCurrentDelayMs) res.currentDelay = res.googCurrentDelayMs;

                        videoInOrOutbound = res;
                    }
                }
            });
            var audioStats = {
                inboundTimestamp: audioInbound.timestamp,
                packetsReceived: audioInbound.packetsReceived,
                bytesReceived: audioInbound.bytesReceived,
                packetsLost: audioInbound.packetsLost,
                jitter: audioInbound.jitter,
                outboundTimestamp: audioOutbound.timestamp,
                packetsSent: audioOutbound.packetsSent,
                bytesSent: audioOutbound.bytesSent,
            };
            var videoStats = {
                timestamp: videoInOrOutbound.timestamp,
                bytesReceived: videoInOrOutbound.bytesReceived,
                bytesSent: videoInOrOutbound.bytesSent,
                packetsReceived: videoInOrOutbound.packetsReceived,
                packetsLost: videoInOrOutbound.packetsLost,
                packetsSent: videoInOrOutbound.packetsSent,
                decodeDelay: videoInOrOutbound.decodeDelay,
                codec: videoInOrOutbound.codec,
                height: videoInOrOutbound.height,
                width: videoInOrOutbound.width,
                encodeUsagePercent: videoInOrOutbound.encodeUsagePercent,
                rtt: videoInOrOutbound.rtt,
                currentDelay: videoInOrOutbound.currentDelay,
            };
            if (typeof globalObject.audio.statsArray === 'undefined') {
                globalObject.audio.statsArray = [];
                globalObject.audio.haveStats = false;
            }
            if (typeof globalObject.video.statsArray === 'undefined') {
                globalObject.video.statsArray = [];
                globalObject.video.haveStats = false;
            }

            var audioStatsArray = globalObject.audio.statsArray;
            audioStatsArray.push(audioStats);
            var videoStatsArray = globalObject.video.statsArray;
            videoStatsArray.push(videoStats);
            while (audioStatsArray.length > 12) {
                audioStatsArray.shift();
            }
            while (videoStatsArray.length > 5) {// maximum interval to consider
                videoStatsArray.shift();
            }

            var firstAudioStats = audioStatsArray[0];
            var lastAudioStats = audioStatsArray[audioStatsArray.length - 1];

            var audioIntervalPacketsLost = lastAudioStats.packetsLost - firstAudioStats.packetsLost;
            var audioIntervalPacketsReceived = lastAudioStats.packetsReceived - firstAudioStats.packetsReceived;
            var audioIntervalPacketsSent = lastAudioStats.packetsSent - firstAudioStats.packetsSent;
            var audioIntervalBytesReceived = lastAudioStats.bytesReceived - firstAudioStats.bytesReceived;
            var audioIntervalBytesSent = lastAudioStats.bytesSent - firstAudioStats.bytesSent;

            var audioReceivedInterval = lastAudioStats.inboundTimestamp - firstAudioStats.inboundTimestamp;
            var audioSentInterval = lastAudioStats.outboundTimestamp - firstAudioStats.outboundTimestamp;

            var audioKbitsReceivedPerSecond = audioIntervalBytesReceived * 8 / audioReceivedInterval;
            var audioKbitsSentPerSecond = audioIntervalBytesSent * 8 / audioSentInterval;
            var audioPacketDuration = audioIntervalPacketsSent / audioSentInterval * 1000;

            var r = undefined, mos = undefined;

            if (isNaN(audioIntervalPacketsLost) && !globalObject.audio.haveStats) {
                r = 100;
            } else {
                globalObject.audio.haveStats = true;
                r = (Math.max(0, audioIntervalPacketsReceived - audioIntervalPacketsLost) / audioIntervalPacketsReceived) * 100;
                if (r > 100) {
                    r = 100;
                }
            }
            mos = 1 + (0.035) * r + (0.000007) * r * (r-60) * (100-r);

            var audioIntervalLossRate = 1 - (r / 100);
            logger.debug("Interval loss rate", audioIntervalLossRate);
            logger.debug("MOS", mos);

            // VIDEO
            var firstVideoStats = videoStatsArray[0];
            var lastVideoStats = videoStatsArray[videoStatsArray.length - 1];

            var videoIntervalPacketsLost = lastVideoStats.packetsLost - firstVideoStats.packetsLost;
            var videoIntervalPacketsReceived = lastVideoStats.packetsReceived - firstVideoStats.packetsReceived;
            var videoIntervalPacketsSent = lastVideoStats.packetsSent - firstVideoStats.packetsSent;
            var videoIntervalBytesReceived = lastVideoStats.bytesReceived - firstVideoStats.bytesReceived;
            var videoIntervalBytesSent = lastVideoStats.bytesSent - firstVideoStats.bytesSent;

            var videoReceivedInterval = lastVideoStats.timestamp - firstVideoStats.timestamp;
            var videoSentInterval = lastVideoStats.timestamp - firstVideoStats.timestamp;

            var videoKbitsReceivedPerSecond = videoIntervalBytesReceived * 8 / videoReceivedInterval;
            var videoKbitsSentPerSecond = videoIntervalBytesSent * 8 / videoSentInterval;
            var videoPacketDuration = videoIntervalPacketsSent / videoSentInterval * 1000;

            if (videoStats.packetsReceived > 0) { // Remote video
                var videoLostPercentage = ((videoStats.packetsLost / (videoStats.packetsLost + videoStats.packetsReceived) * 100) || 0).toFixed(1);
                var videoBitrate = Math.floor(videoKbitsReceivedPerSecond || 0);
                var videoLostRecentPercentage = ((videoIntervalPacketsLost / (videoIntervalPacketsLost + videoIntervalPacketsReceived) * 100) || 0).toFixed(1);
            } else {
                var videoLostPercentage = ((videoStats.packetsLost / (videoStats.packetsLost + videoStats.packetsSent) * 100) || 0).toFixed(1);
                var videoBitrate = Math.floor(videoKbitsSentPerSecond || 0);
                var videoLostRecentPercentage = ((videoIntervalPacketsLost / (videoIntervalPacketsLost + videoIntervalPacketsSent) * 100) || 0).toFixed(1);
            }

            result = {
                audio: {
                    availableBandwidth: undefined,
                    bytesReceived: audioStats.bytesReceived,
                    bytesSent: audioStats.bytesSent,
                    delay: undefined,
                    globalBitrate: undefined,
                    inputLevel: undefined,
                    intervalEstimatedLossRate: audioIntervalLossRate,
                    intervalLossRate: audioIntervalLossRate,
                    jitter: audioStats.jitter,
                    jitterBuffer: undefined,
                    kbitsReceivedPerSecond: audioKbitsReceivedPerSecond,
                    kbitsSentPerSecond: audioKbitsSentPerSecond,
                    mos: mos,
                    outputLevel: undefined,
                    //packetDuration: packetDuration,
                    packetsLost: audioStats.packetsLost,
                    packetsReceived: audioStats.packetsReceived,
                    packetsSent: audioStats.packetsSent,
                    r: r,
                },
                video: {
                    bytesReceived: videoStats.bytesReceived,
                    bytesSent: videoStats.bytesSent,
                    packetsLost: videoStats.packetsLost,
                    packetsReceived: videoStats.packetsReceived,
                    packetsSent: videoStats.packetsSent,
                    bitrate: videoBitrate,
                    lostPercentage: videoLostPercentage,
                    lostRecentPercentage: videoLostRecentPercentage,
                    height: videoStats.height,
                    width: videoStats.width,
                    codec: videoStats.codec,
                    decodeDelay: videoStats.decodeDelay,
                    encodeUsagePercent: videoStats.encodeUsagePercent,
                    rtt: videoStats.rtt,
                    currentDelay: videoStats.currentDelay,
                },
                nomore: function() { nomore = true; }
            }

            result.shouldStop = nomore;
            callback(result);

            // second argument checks to see, if target-user is still connected.
            if (!nomore) {
                typeof interval != undefined && interval && setTimeout(getPrivateStats, interval || 1000);
            }
        }, function(exception) {
            logger.error("Promise rejected", exception.message);
            callback(null);
        });
    })();

}

function merge(mergein, mergeto) {
    if (!mergein) mergein = {};
    if (!mergeto) return mergein;

    for (var item in mergeto) {
        mergein[item] = mergeto[item];
    }
    return mergein;
}

function monitorTrackStart(peer, track, local, callback) {
    logger.info("Starting stats monitoring on", track.id);
    if (!monitoredTracks[track.id]) {
        monitoredTracks[track.id] = function() { logger.warn("Still didn't have any report for this track"); };
        customGetStats(
            peer,
            track,
            function(results) {
                if (results == null || results.shouldStop || peer.signalingState == "closed") {
                    monitorTrackStop(track.id);
                } else {
                    monitoredTracks[track.id] = results.nomore;
                    results.audio.type = local? "local": "remote",
                    //BBB.webRTCMonitorUpdate(JSON.stringify(results));
                    logger.debug(JSON.stringify(results));
                    callback(results);
                }
            },
            2000
        );
    } else {
        logger.warn("Already monitoring this track");
    }
}

function monitorTrackStop(trackId) {
    if (typeof (monitoredTracks[trackId]) === "function") {
        monitoredTracks[trackId]();
        delete monitoredTracks[trackId];
        logger.info("Track removed, monitoredTracks.length =", Object.keys(monitoredTracks).length);
    } else {
        logger.info("Track is not monitored");
    }
}

function monitorTracksStart() {
    setTimeout( function() {
        if (currentSession == null) {
            logger.warn("Doing nothing because currentSession is null");
            return;
        }
        var peer = currentSession.mediaHandler.peerConnection;

        for (var streamId = 0; streamId < peer.getLocalStreams().length; ++streamId) {
            for (var trackId = 0; trackId < peer.getLocalStreams()[streamId].getAudioTracks().length; ++trackId) {
                var track = peer.getLocalStreams()[streamId].getAudioTracks()[trackId];
                monitorTrackStart(peer, track, true);
            }
        }
        /*for (var streamId = 0; streamId < peer.getRemoteStreams().length; ++streamId) {
            for (var trackId = 0; trackId < peer.getRemoteStreams()[streamId].getAudioTracks().length; ++trackId) {
                var track = peer.getRemoteStreams()[streamId].getAudioTracks()[trackId];
                monitorTrackStart(peer, track, false);
            }
        }*/
    }, 2000);
}

function monitorTracksStop() {
    for (var id in monitoredTracks) {
        monitorTrackStop(id);
    }
}

