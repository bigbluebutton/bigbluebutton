import browserInfo from '/imports/utils/browserInfo';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import { fetchStunTurnServers } from '/imports/utils/fetchStunTurnServers';

(function (){
    // This function must be executed during the import time, that's why it's not exported to the caller component.
    // It's needed because it changes some functions provided by browser, and these functions are verified during
    // import time (like in ScreenshareBridgeService)
    if(browserInfo.isTabletApp) {
        logger.debug(`BBB-MOBILE - Mobile APP detected`);

        const WEBRTC_CALL_TYPE_FULL_AUDIO = 'full_audio';
        const WEBRTC_CALL_TYPE_SCREEN_SHARE = 'screen_share';
        const WEBRTC_CALL_TYPE_STANDARD = 'standard';

        // This function detects if the call happened to publish a screenshare
        function detectWebRtcCallType(caller, peerConnection = null, args = null) {
            // Keep track of how many webRTC evaluations was done
            if(!peerConnection.detectWebRtcCallTypeEvaluations)
                peerConnection.detectWebRtcCallTypeEvaluations = 0;

            peerConnection.detectWebRtcCallTypeEvaluations ++;

            // If already successfully evaluated, reuse
            if(peerConnection && peerConnection.webRtcCallType !== undefined ) {
                logger.info(`BBB-MOBILE - detectWebRtcCallType (already evaluated as ${peerConnection.webRtcCallType})`, {caller, peerConnection});
                return peerConnection.webRtcCallType;
            }

            // Evaluate context otherwise
            const e = new Error('dummy');
            const stackTrace = e.stack;
            logger.info(`BBB-MOBILE - detectWebRtcCallType (evaluating)`, {caller, peerConnection, stackTrace: stackTrace.split('\n'), detectWebRtcCallTypeEvaluations: peerConnection.detectWebRtcCallTypeEvaluations, args});

            // addEventListener is the first call for screensharing and it has a startScreensharing in its stackTrace
            if( peerConnection.detectWebRtcCallTypeEvaluations == 1) {
                if(caller == 'addEventListener' && stackTrace.indexOf('startScreensharing') !== -1) {
                    peerConnection.webRtcCallType = WEBRTC_CALL_TYPE_SCREEN_SHARE; // this uses mobile app broadcast upload extension
                } else if(caller == 'addEventListener' && stackTrace.indexOf('invite') !== -1) {
                    peerConnection.webRtcCallType = WEBRTC_CALL_TYPE_FULL_AUDIO; // this uses mobile app webRTC
                } else {
                    peerConnection.webRtcCallType = WEBRTC_CALL_TYPE_STANDARD; // this uses the webview webRTC
                }

                return peerConnection.webRtcCallType;
            }

        }
        // Store the method call sequential
        const sequenceHolder = {sequence: 0};

        // Store the promise for each method call
        const promisesHolder = {};

        // Call a method in the mobile application, returning a promise for its execution
        function callNativeMethod(method, args=[]) {
            try {
                const sequence = ++sequenceHolder.sequence;

                return new Promise ( (resolve, reject) => {
                    promisesHolder[sequence] = {
                        resolve, reject
                    };

                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        sequence: sequenceHolder.sequence,
                        method: method,
                        arguments: args,
                    }));
                } );
            } catch(e) {
                logger.error(`Error on callNativeMethod ${e.message}`, e);
            }
        }

        // This method is called from the mobile app to notify us about a method invocation result
        window.nativeMethodCallResult = (sequence, isResolve, resultOrException) => {

            const promise = promisesHolder[sequence];
            if(promise) {
                if(isResolve) {
                    promise.resolve( resultOrException );
                    delete promisesHolder[sequence];
                } else {
                    promise.reject( resultOrException );
                    delete promisesHolder[sequence];
                }
            }
            return true;
        }

        // WebRTC replacement functions
        const buildVideoTrack = function () {}
        const stream = {};

        // Navigator
        navigator.getDisplayMedia = function() {
            logger.info(`BBB-MOBILE - getDisplayMedia called`, arguments);

            return new Promise((resolve, reject) => {
                callNativeMethod('initializeScreenShare').then(
                    () => {
                        const fakeVideoTrack = {};
                        fakeVideoTrack.applyConstraints = function (constraints) {
                            return new Promise(
                                (resolve, reject) => {
                                    resolve();
                                }
                            );
                        };
                        fakeVideoTrack.onended = null; // callbacks added from screenshare (we can use it later)
                        fakeVideoTrack.oninactive = null; // callbacks added from screenshare (we can use it later)
                        fakeVideoTrack.addEventListener = function() {}; // skip listeners

                        const videoTracks = [
                            fakeVideoTrack
                        ];
                        stream.getTracks = stream.getVideoTracks = function () {
                            return videoTracks;
                        };
                        stream.active=true;
                        resolve(stream);
                    }
                ).catch(
                    (e) => {
                        logger.error(`Failure calling native initializeScreenShare`, e.message)
                    }
                );
            });
        }

        // RTCPeerConnection
        const prototype = window.RTCPeerConnection.prototype;

        prototype.originalCreateOffer = prototype.createOffer;
        prototype.createOffer = async function (options) {
            const webRtcCallType = detectWebRtcCallType('createOffer', this);

            if(webRtcCallType === WEBRTC_CALL_TYPE_STANDARD){
                return prototype.originalCreateOffer.call(this, ...arguments);
            }
            logger.info(`BBB-MOBILE - createOffer called`, {options});

            const stunTurn = await fetchStunTurnServers(Auth._authToken);

            const createOfferMethod = (webRtcCallType === WEBRTC_CALL_TYPE_SCREEN_SHARE) ? 'createScreenShareOffer' : 'createFullAudioOffer';

            return await new Promise( (resolve, reject) => {
                callNativeMethod(createOfferMethod, [stunTurn]).then ( sdp => {
                    logger.info(`BBB-MOBILE - createOffer resolved`, {sdp});

                    // send offer to BBB code
                    resolve({
                        type: 'offer',
                        sdp
                    });
                });
            } );
        };

        prototype.originalAddEventListener = prototype.addEventListener;
        prototype.addEventListener = function (event, callback) {
            if(WEBRTC_CALL_TYPE_STANDARD === detectWebRtcCallType('addEventListener', this, arguments)){
                return prototype.originalAddEventListener.call(this, ...arguments);
            }

            logger.info(`BBB-MOBILE - addEventListener called`, {event, callback});

            switch(event) {
                case 'icecandidate':
                    window.bbbMobileScreenShareIceCandidateCallback = function () {
                        logger.info("Received a bbbMobileScreenShareIceCandidateCallback call with arguments", arguments);
                        if(callback){
                            callback.apply(this, arguments);
                        }
                        return true;
                    }
                    break;
                case 'signalingstatechange':
                    window.bbbMobileScreenShareSignalingStateChangeCallback = function (newState) {
                        this.signalingState = newState;
                        callback();
                    };
                    break;
            }
        }

        prototype.originalSetLocalDescription = prototype.setLocalDescription;
        prototype.setLocalDescription = function (description, successCallback, failureCallback) {
            if(WEBRTC_CALL_TYPE_STANDARD === detectWebRtcCallType('setLocalDescription', this)){
                return prototype.originalSetLocalDescription.call(this, ...arguments);
            }
            logger.info(`BBB-MOBILE - setLocalDescription called`, {description, successCallback, failureCallback});

            // store the value
            this._localDescription = JSON.parse(JSON.stringify(description));
            // replace getter of localDescription to return this value
            Object.defineProperty(this, 'localDescription', {get: function() {return this._localDescription;},set: function(newValue) {}});

            // return a promise that resolves immediately
            return new Promise( (resolve, reject) => {
                resolve();
            })
        }

        prototype.originalSetRemoteDescription = prototype.setRemoteDescription;
        prototype.setRemoteDescription = function (description, successCallback, failureCallback) {
            const webRtcCallType = detectWebRtcCallType('setRemoteDescription', this);
            if(WEBRTC_CALL_TYPE_STANDARD === webRtcCallType){
                return prototype.originalSetRemoteDescription.call(this, ...arguments);
            }

            logger.info(`BBB-MOBILE - setRemoteDescription called`, {description, successCallback, failureCallback});

            this._remoteDescription = JSON.parse(JSON.stringify(description));
            Object.defineProperty(this, 'remoteDescription', {get: function() {return this._remoteDescription;},set: function(newValue) {}});

            const setRemoteDescriptionMethod = (webRtcCallType === WEBRTC_CALL_TYPE_SCREEN_SHARE) ? 'setScreenShareRemoteSDP' : 'setFullAudioRemoteSDP';

            return new Promise( (resolve, reject) => {
                callNativeMethod(setRemoteDescriptionMethod, [description]).then ( () => {
                    logger.info(`BBB-MOBILE - setRemoteDescription resolved`);

                    resolve();

                    if(webRtcCallType === WEBRTC_CALL_TYPE_FULL_AUDIO) {
                        Object.defineProperty(this, "iceGatheringState", {get: function() { return "complete" }, set: ()=>{} });
                        Object.defineProperty(this, "iceConnectionState", {get: function() { return "completed" }, set: ()=>{} });
                        this.onicegatheringstatechange && this.onicegatheringstatechange({target: this});
                        this.oniceconnectionstatechange && this.oniceconnectionstatechange({target: this});
                    }
                });
            } );
        }

        prototype.originalAddTrack = prototype.addTrack;
        prototype.addTrack = function (description, successCallback, failureCallback) {
            if(WEBRTC_CALL_TYPE_STANDARD === detectWebRtcCallType('addTrack', this)){
                return prototype.originalAddTrack.call(this, ...arguments);
            }

            logger.info(`BBB-MOBILE - addTrack called`, {description, successCallback, failureCallback});
        }

        prototype.originalGetLocalStreams = prototype.getLocalStreams;
        prototype.getLocalStreams = function() {
            if(WEBRTC_CALL_TYPE_STANDARD === detectWebRtcCallType('getLocalStreams', this)){
                return prototype.originalGetLocalStreams.call(this, ...arguments);
            }
            logger.info(`BBB-MOBILE - getLocalStreams called`, arguments);

            //
            return [
                stream
            ];
        }

        prototype.originalAddTransceiver = prototype.addTransceiver;
        prototype.addTransceiver = function() {
            if(WEBRTC_CALL_TYPE_STANDARD === detectWebRtcCallType('addTransceiver', this)){
                return prototype.originalAddTransceiver.call(this, ...arguments);
            }
            logger.info(`BBB-MOBILE - addTransceiver called`, arguments);
        }

        prototype.originalAddIceCandidate = prototype.addIceCandidate;
        prototype.addIceCandidate = function (candidate) {
            if(WEBRTC_CALL_TYPE_STANDARD === detectWebRtcCallType('addIceCandidate', this)){
                return prototype.originalAddIceCandidate.call(this, ...arguments);
            }
            logger.info(`BBB-MOBILE - addIceCandidate called`, {candidate});

            return new Promise( (resolve, reject) => {
                callNativeMethod('addRemoteIceCandidate', [candidate]).then ( () => {
                    logger.info("BBB-MOBILE - addRemoteIceCandidate resolved");

                    resolve();
                });
            } );
        }

        // Handle screenshare stop
        const KurentoScreenShareBridge = require('/imports/api/screenshare/client/bridge/index.js').default;
        //Kurento Screen Share
        var stopOriginal = KurentoScreenShareBridge.stop.bind(KurentoScreenShareBridge);
        KurentoScreenShareBridge.stop = function(){
            callNativeMethod('stopScreenShare')
            logger.debug(`BBB-MOBILE - Click on stop screen share`);
            stopOriginal()
        }

        // Handle screenshare stop requested by application (i.e. stopped the broadcast extension)
        window.bbbMobileScreenShareBroadcastFinishedCallback = function () {
            document.querySelector('[data-test="stopScreenShare"]')?.click();
        }

    }
})();


