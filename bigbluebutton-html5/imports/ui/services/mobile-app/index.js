import browserInfo from '/imports/utils/browserInfo';
import logger from '/imports/startup/client/logger';
(function (){
    // This function must be executed during the import time, that's why it's not exported to the caller component.
    // It's needed because it changes some functions provided by browser, and these functions are verified during 
    // import time (like in ScreenshareBridgeService)
    if(browserInfo.isMobileApp) {
        logger.debug(`BBB-MOBILE - Mobile APP detected`);

        // This function detects if the call happened to publish a screenshare
        function isScreenShareBroadcastRelated(caller, peerConnection = null, args = null) {
            // Keep track of how many webRTC evaluations was done
            if(!peerConnection.isSBREvaluations) 
                peerConnection.isSBREvaluations = 0;
            
            peerConnection.isSBREvaluations ++;

            // If already successfully evaluated, reuse
            if(peerConnection && peerConnection.isSBR !== undefined ) {
                logger.info(`BBB-MOBILE - isScreenShareBroadcastRelated (already evaluated as ${peerConnection.isSBR})`, {caller, peerConnection});
                return peerConnection.isSBR;
            }

            // Evaluate context otherwise
            const e = new Error('dummy');
            const stackTrace = e.stack;
            logger.info(`BBB-MOBILE - isScreenShareBroadcastRelated (evaluating)`, {caller, peerConnection, stackTrace: stackTrace.split('\n'), isSBREvaluations: peerConnection.isSBREvaluations, args});
            
            // addTransceiver is the first call for screensharing and it has a startScreensharing in its stackTrace
            if( peerConnection.isSBREvaluations == 1) {
                if(caller == 'addTransceiver' && stackTrace.indexOf('startScreensharing') !== -1) {
                    peerConnection.isSBR = true;
                } else {
                    peerConnection.isSBR = false;
                }

                return peerConnection.isSBR;
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
                        
                        const videoTracks = [
                            fakeVideoTrack
                        ];
                        stream.getTracks = stream.getVideoTracks = function () {
                            return videoTracks;
                        };
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
        prototype.createOffer = function (options) {
            if(!isScreenShareBroadcastRelated('createOffer', this)){
                return prototype.originalCreateOffer.call(this, ...arguments);
            }
            logger.info(`BBB-MOBILE - createOffer called`, {options});

            return new Promise( (resolve, reject) => {
                callNativeMethod('createOffer').then ( sdp => {
                    logger.info(`BBB-MOBILE - createOffer resolved`, {sdp});

                    //
                    resolve({
                        type: 'offer',
                        sdp
                    });
                });
            } );
        };

        prototype.originalAddEventListener = prototype.addEventListener;
        prototype.addEventListener = function (event, callback) {
            if(!isScreenShareBroadcastRelated('addEventListener', this, arguments)){
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
            if(!isScreenShareBroadcastRelated('setLocalDescription', this)){
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
            if(!isScreenShareBroadcastRelated('setRemoteDescription', this)){
                return prototype.originalSetRemoteDescription.call(this, ...arguments);
            }

            logger.info(`BBB-MOBILE - setRemoteDescription called`, {description, successCallback, failureCallback});
            
            this._remoteDescription = JSON.parse(JSON.stringify(description));
            Object.defineProperty(this, 'remoteDescription', {get: function() {return this._remoteDescription;},set: function(newValue) {}});

            return new Promise( (resolve, reject) => {
                callNativeMethod('setRemoteDescription', [description]).then ( () => {
                    logger.info(`BBB-MOBILE - setRemoteDescription resolved`);

                    resolve();
                });
            } );
        }

        prototype.originalAddTrack = prototype.addTrack;
        prototype.addTrack = function (description, successCallback, failureCallback) {
            if(!isScreenShareBroadcastRelated('addTrack', this)){
                return prototype.originalAddTrack.call(this, ...arguments);
            }

            logger.info(`BBB-MOBILE - addTrack called`, {description, successCallback, failureCallback});
        }

        prototype.originalGetLocalStreams = prototype.getLocalStreams;
        prototype.getLocalStreams = function() {
            if(!isScreenShareBroadcastRelated('getLocalStreams', this)){
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
            if(!isScreenShareBroadcastRelated('addTransceiver', this)){
                return prototype.originalAddTransceiver.call(this, ...arguments);
            }
            logger.info(`BBB-MOBILE - addTransceiver called`, arguments);
        }

        prototype.originalAddIceCandidate = prototype.addIceCandidate;
        prototype.addIceCandidate = function (candidate) {
            if(!isScreenShareBroadcastRelated('addIceCandidate', this)){
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

    }
})();


