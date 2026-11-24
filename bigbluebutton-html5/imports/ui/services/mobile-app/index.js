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

        const WEBRTC_CALL_TYPE_SCREEN_SHARE = 'screen_share';
        const WEBRTC_CALL_TYPE_STANDARD = 'standard';

        // Set by runAsScreenSharePeer while the screen share broker starts its peer
        let screenSharePeerPending = false;

        // Classifies a peer connection on its first evaluation: the peer started inside
        // runAsScreenSharePeer is routed to the native broadcast upload extension, every
        // other peer keeps using the webview WebRTC
        function detectWebRtcCallType(caller, peerConnection) {
            if (peerConnection.webRtcCallType === undefined) {
                peerConnection.webRtcCallType = screenSharePeerPending
                    ? WEBRTC_CALL_TYPE_SCREEN_SHARE
                    : WEBRTC_CALL_TYPE_STANDARD;
                screenSharePeerPending = false;
                logger.info(`BBB-MOBILE - detectWebRtcCallType (evaluated as ${peerConnection.webRtcCallType})`, {caller});
            }

            return peerConnection.webRtcCallType;
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

            return await new Promise( (resolve, reject) => {
                callNativeMethod('createScreenShareOffer', [stunTurn]).then ( sdp => {
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
            if(WEBRTC_CALL_TYPE_STANDARD === detectWebRtcCallType('addEventListener', this)){
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
            if(WEBRTC_CALL_TYPE_STANDARD === detectWebRtcCallType('setRemoteDescription', this)){
                return prototype.originalSetRemoteDescription.call(this, ...arguments);
            }

            logger.info(`BBB-MOBILE - setRemoteDescription called`, {description, successCallback, failureCallback});

            this._remoteDescription = JSON.parse(JSON.stringify(description));
            Object.defineProperty(this, 'remoteDescription', {get: function() {return this._remoteDescription;},set: function(newValue) {}});

            return new Promise( (resolve, reject) => {
                callNativeMethod('setScreenShareRemoteSDP', [description]).then ( () => {
                    logger.info(`BBB-MOBILE - setRemoteDescription resolved`);

                    resolve();
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

        // Create methods to be called from the BBB component when screen share stop is requested
        window.bbbMobileApp = {};
        window.bbbMobileApp.onScreenshareStopRequest = () => {
            callNativeMethod('stopScreenShare');
        }

        // Runs fn (the screen share peer start) so that the peer connection it sets up is
        // classified as screen share. The flag is cleared even if fn throws, so a failed
        // start never leaks the classification into the next audio/webcam peer.
        window.bbbMobileApp.runAsScreenSharePeer = (fn) => {
            screenSharePeerPending = true;
            try {
                return fn();
            } finally {
                screenSharePeerPending = false;
            }
        }

        // Handle screenshare stop requested by application (i.e. stopped the broadcast extension)
        window.bbbMobileScreenShareBroadcastFinishedCallback = function () {
            document.querySelector('[data-test="stopScreenShare"]')?.click();
        }

    }
})();
