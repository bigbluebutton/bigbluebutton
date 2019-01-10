export function canGenerateIceCandidates() {
    
    return new Promise((resolve, reject) => {
		pc = new RTCPeerConnection({iceServers: [ {urls:'stun:stun.l.google.com:19302'}  ]});
		countIceCandidates = 0;

		try{ pc.addTransceiver('audio'); } catch (e) {}

		pc.onicecandidate = function (e) {
			if(countIceCandidates) return;
			if (e.candidate) {
				countIceCandidates++;
				resolve(true);
			}
		}

		pc.onicegatheringstatechange  = function(e) {
			if(e.currentTarget.iceGatheringState == 'complete' && countIceCandidates == 0) reject(true);
		}
		
		setTimeout(function(){ 
			if(!countIceCandidates) reject(true);
		}, 3000);

		p = pc.createOffer({offerToReceiveVideo: true});
		p.then( answer => {pc.setLocalDescription(answer) ; } )
	});
};
