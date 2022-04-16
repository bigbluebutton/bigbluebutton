import browserInfo from '/imports/utils/browserInfo';
import logger from '/imports/startup/client/logger';
(function (){
    // This function must be executed during the import time, that's why it's not exported to the caller component.
    // It's needed because it changes some functions provided by browser, and these functions are verified during 
    // import time (like in ScreenshareBridgeService)
    if(browserInfo.isMobileApp) {
        logger.debug("Mobile APP detected");

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
            logger.info("BBB-MOBILE - getDisplayMedia called", arguments);

            return new Promise((resolve, reject) => {
                callNativeMethod('initializeScreenShare').then(
                    () => {
                        const fakeVideoTrack = {};
                        fakeVideoTrack.applyConstraints = function (constraints) {
                            return new Promise(
                                (resolve, reject) => {
                                    // alert("Constraints applied: " + JSON.stringify(constraints));
                                    resolve();
                                }
                            );
                        };
                        fakeVideoTrack.onended = null; // callbacks added from screenshare (we can use it later)
                        fakeVideoTrack.oninactive = null; // callbacks added from screenshare (we can use it later)
                        
                        const videoTracks = [
                            fakeVideoTrack
                        ];
                        stream.getTracks = stream.getVideoTracks = function () {
                            return videoTracks;
                        };
                        resolve(stream);
                    }
                ).catch(
                    () => alert("Não deu")
                );
            });
        }

        // RTCPeerConnection
        const prototype = window.RTCPeerConnection.prototype;

        prototype.createOffer = function (options) {
            logger.info("BBB-MOBILE - createOffer called", {options});

            return new Promise( (resolve, reject) => {
                callNativeMethod('createOffer').then ( sdp => {
                    logger.info("BBB-MOBILE - createOffer resolved", {sdp});

                    //
                    resolve({
                        type: 'offer',
                        sdp
                    });
                });
            } );
        };

        prototype.addEventListener = function (event, callback) {
            logger.info("BBB-MOBILE - addEventListener called", {event, callback});

            switch(event) {
                case 'icecandidate':
                    window.bbbMobileScreenShareIceCandidateCallback = function () {
                        console.log("Received a bbbMobileScreenShareIceCandidateCallback call with arguments", arguments);
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

        prototype.setLocalDescription = function (description, successCallback, failureCallback) {
            logger.info("BBB-MOBILE - setLocalDescription called", {description, successCallback, failureCallback});

            // store the value
            this._localDescription = JSON.parse(JSON.stringify(description));
            // replace getter of localDescription to return this value
            Object.defineProperty(this, 'localDescription', {get: function() {return this._localDescription;},set: function(newValue) {}});

            // return a promise that resolves immediately
            return new Promise( (resolve, reject) => {
                resolve();
            })
        }

        prototype.setRemoteDescription = function (description, successCallback, failureCallback) {
            logger.info("BBB-MOBILE - setRemoteDescription called", {description, successCallback, failureCallback});
            this._remoteDescription = JSON.parse(JSON.stringify(description));
            Object.defineProperty(this, 'remoteDescription', {get: function() {return this._remoteDescription;},set: function(newValue) {}});

            return new Promise( (resolve, reject) => {
                callNativeMethod('setRemoteDescription', [description]).then ( () => {
                    logger.info("BBB-MOBILE - setRemoteDescription resolved");

                    resolve();
                });
            } );
        }

        prototype.addTrack = function (description, successCallback, failureCallback) {
            logger.info("BBB-MOBILE - addTrack called", {description, successCallback, failureCallback});
        }

        prototype.getLocalStreams = function() {
            logger.info("BBB-MOBILE - getLocalStreams called", arguments);

            // 
            return [
                stream
            ];
        }

        prototype.addTransceiver = function() {
            logger.info("BBB-MOBILE - addTransceiver called", arguments);
        }

        prototype.addIceCandidate = function (candidate) {
            logger.info("BBB-MOBILE - addIceCandidate called", {candidate});

            return new Promise( (resolve, reject) => {
                callNativeMethod('addRemoteIceCandidate', [candidate]).then ( () => {
                    logger.info("BBB-MOBILE - addRemoteIceCandidate resolved");

                    resolve();
                });
            } );
        }

    }
})();


