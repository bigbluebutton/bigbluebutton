export function canGenerateIceCandidates() {
    
    return new Promise((resolve, reject) => {
		pc = new RTCPeerConnection({iceServers: [ {urls:'stun:stun.l.google.com:19302'}  ]});
		countIceCandidates = 0;

		try{ pc.addTransceiver('audio'); } catch (e) {}

		pc.onicecandidate = function (e) {
			if(countIceCandidates) return;
			if (e.candidate) {
				countIceCandidates++;
				resolve();
			}
		}
		
		pc.onicegatheringstatechange  = function(e) {
			if(e.currentTarget.iceGatheringState == 'complete' && countIceCandidates == 0) reject();
		}
		
		setTimeout(function(){ 
			if(!countIceCandidates) reject();
		}, 3000);

		p = pc.createOffer({offerToReceiveVideo: true});
		p.then( answer => {pc.setLocalDescription(answer) ; } )
	});
};

export function tryGenerateIceCandidates() {
	return new Promise((resolve, reject) => {
		canGenerateIceCandidates().then(ok => {
			resolve();
		}).catch(e => {
			navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function (stream) {
				canGenerateIceCandidates().then(ok => {
					resolve();
				}).catch(e => {
					reject();
				});
			}).catch(e => {
				reject();
			});
		});
	});
};