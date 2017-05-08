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
        audio: {}
        //audio: {},
        //video: {}
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

            var inbound = {};
            var outbound = {};
            var localCandidate = {};
            var remoteCandidate = {};

            results.forEach(function(res) {
                if ((res.type == 'outbound-rtp' || res.type == 'outboundrtp') && res.mediaType == 'audio') {
                    outbound = res;
                }
                if ((res.type == 'inbound-rtp' || res.type == 'inboundrtp') && res.mediaType == 'audio') {
                    inbound = res;
                }
                if (res.type == 'ssrc' && res.mediaType == 'audio') {
                    if (typeof (res.audioInputLevel) !== 'undefined') {
                        inbound = res;
                        outbound = res;
                        res.packetsSent = parseInt(res.packetsSent);
                        res.bytesSent = parseInt(res.bytesSent);
                        res.packetsLost = parseInt(res.packetsLost);
                        res.jitter = parseInt(res.googJitterReceived) / 1000;
                        res.packetsReceived = res.packetsSent - res.packetsLost;
                    }
                }
                if ((res.type == 'candidate-pair' && res.selected) ||
                    (res.type == 'googCandidatePair' && res.googActiveConnection == "true")) {
                    localCandidate = results[res.localCandidateId];
                    remoteCandidate = results[res.remoteCandidateId];
                }
            });
            /*
            console.log("Inbound:");
            console.log(inbound);
            console.log("Outbound:");
            console.log(outbound);
            */
            var audioStats = {
                inboundTimestamp: inbound.timestamp,
                packetsReceived: inbound.packetsReceived,
                bytesReceived: inbound.bytesReceived,
                packetsLost: inbound.packetsLost,
                jitter: inbound.jitter,
                outboundTimestamp: outbound.timestamp,
                packetsSent: outbound.packetsSent,
                bytesSent: outbound.bytesSent,
            };
            if (typeof globalObject.audio.statsArray === 'undefined') {
                globalObject.audio.statsArray = [];
                globalObject.audio.haveStats = false;
            }
            var statsArray = globalObject.audio.statsArray;
            statsArray.push(audioStats);
            while (statsArray.length > 12) {
                statsArray.shift();
            }

            var firstAudioStats = statsArray[0];
            var lastAudioStats = statsArray[statsArray.length - 1];

            var intervalPacketsLost = lastAudioStats.packetsLost - firstAudioStats.packetsLost;
            var intervalPacketsReceived = lastAudioStats.packetsReceived - firstAudioStats.packetsReceived;
            var intervalPacketsSent = lastAudioStats.packetsSent - firstAudioStats.packetsSent;
            var intervalBytesReceived = lastAudioStats.bytesReceived - firstAudioStats.bytesReceived;
            var intervalBytesSent = lastAudioStats.bytesSent - firstAudioStats.bytesSent;

            var receivedInterval = lastAudioStats.inboundTimestamp - firstAudioStats.inboundTimestamp;
            var sentInterval = lastAudioStats.outboundTimestamp - firstAudioStats.outboundTimestamp;

            var kbitsReceivedPerSecond = intervalBytesReceived * 8 / receivedInterval;
            var kbitsSentPerSecond = intervalBytesSent * 8 / sentInterval;
            var packetDuration = intervalPacketsSent / sentInterval * 1000;

            var r = undefined, mos = undefined;
            if (isNaN(intervalPacketsLost) && !globalObject.audio.haveStats) {
                r = 100;
            } else {
                globalObject.audio.haveStats = true;
                r = (Math.max(0, intervalPacketsReceived - intervalPacketsLost) / intervalPacketsReceived) * 100;
                if (r > 100) {
                    r = 100;
                }
            }
            mos = 1 + (0.035) * r + (0.000007) * r * (r-60) * (100-r);

            var intervalLossRate = 1 - (r / 100);
            console.log("Interval loss rate: " + intervalLossRate);
            console.log("MOS: " + mos);

            result = {
                audio: {
                    availableBandwidth: undefined,
                    bytesReceived: audioStats.bytesReceived,
                    bytesSent: audioStats.bytesSent,
                    delay: undefined,
                    globalBitrate: undefined,
                    inputLevel: undefined,
                    intervalEstimatedLossRate: intervalLossRate,
                    intervalLossRate: intervalLossRate,
                    jitter: audioStats.jitter,
                    jitterBuffer: undefined,
                    kbitsReceivedPerSecond: kbitsReceivedPerSecond,
                    kbitsSentPerSecond: kbitsSentPerSecond,
                    mos: mos,
                    outputLevel: undefined,
                    packetDuration: packetDuration,
                    packetsLost: audioStats.packetsLost,
                    packetsReceived: audioStats.packetsReceived,
                    packetsSent: audioStats.packetsSent,
                    r: r,
                },
                video: {},
                connectionType: {
                    local: {
                        candidateType: localCandidate.candidateType,
                        ipAddress: localCandidate.ipAddress,
                        transport: localCandidate.transport,
                    },
                    remote: {
                        candidateType: remoteCandidate.candidateType,
                        ipAddress: remoteCandidate.ipAddress,
                        transport: remoteCandidate.transport,
                    },
                    transport: localCandidate.transport
                },
                nomore: function() { nomore = true; }
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

}

function merge(mergein, mergeto) {
    if (!mergein) mergein = {};
    if (!mergeto) return mergein;

    for (var item in mergeto) {
        mergein[item] = mergeto[item];
    }
    return mergein;
}

function monitorTrackStart(peer, track, local) {
    console.log("Starting stats monitoring on " + track.id);
    if (!monitoredTracks[track.id]) {
        monitoredTracks[track.id] = function() { console.log("Still didn't have any report for this track"); };
        customGetStats(
            peer,
            track,
            function(results) {
                if (results == null) {
                    monitorTrackStop(track.id);
                } else {
                    monitoredTracks[track.id] = results.nomore;
                    results.audio.type = local? "local": "remote",
                    BBB.webRTCMonitorUpdate(JSON.stringify(results));
                    console.log(JSON.stringify(results));
                }
            },
            2000
        );
    } else {
        console.log("Already monitoring this track");
    }
}

function monitorTrackStop(trackId) {
    if (typeof (monitoredTracks[trackId]) === "function") {
        monitoredTracks[trackId]();
        delete monitoredTracks[trackId];
        console.log("Track removed, monitoredTracks.length = " + Object.keys(monitoredTracks).length);
    } else {
        console.log("Track is not monitored");
    }
}

function monitorTracksStart() {
    setTimeout( function() {
        if (currentSession == null) {
            console.log("Doing nothing because currentSession is null");
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
