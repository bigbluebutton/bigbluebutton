var monitoredTracks = {};

var RTCPeerConnection = undefined;
if (typeof webkitRTCPeerConnection !== 'undefined') {
	RTCPeerConnection = webkitRTCPeerConnection;
}
if (typeof mozRTCPeerConnection !== 'undefined') {
	RTCPeerConnection = mozRTCPeerConnection;
}
if (typeof RTCPeerConnection !== 'undefined') {
	RTCPeerConnection.prototype.getPeerStats = window.getStats;
}

function monitorTrackStart(peer, track, local) {
	if (! monitoredTracks.hasOwnProperty(track.id)) {
		monitoredTracks[track.id] = function() { console.log("Still didn't have any report for this track"); };
		peer.getPeerStats(track, function(results) {
			if (results == null) {
				monitorTrackStop(track.id);
			} else {
				monitoredTracks[track.id] = results.nomore;
				results.audio.type = local? "local": "remote",
				delete results.results;
				BBB.webRTCMonitorUpdate(JSON.stringify(results));
				console.log(JSON.stringify(results));
			}
		}, 2000);
	} else {
		console.log("Already monitoring this track");
	}
}

function monitorTrackStop(trackId) {
	monitoredTracks[trackId]();
	delete monitoredTracks[trackId];
	console.log("Track removed, monitoredTracks.length = " + Object.keys(monitoredTracks).length);
}

function monitorTracksStart() {
	if (typeof RTCPeerConnection.prototype.getPeerStats !== 'undefined') {
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
			for (var streamId = 0; streamId < peer.getRemoteStreams().length; ++streamId) {
				for (var trackId = 0; trackId < peer.getRemoteStreams()[streamId].getAudioTracks().length; ++trackId) {
					var track = peer.getRemoteStreams()[streamId].getAudioTracks()[trackId];
					monitorTrackStart(peer, track, false);
				}
			}
		}, 2000);
	}
}

function monitorTracksStop() {
	for (var id in monitoredTracks) {
		monitorTrackStop(id);
	}
}
