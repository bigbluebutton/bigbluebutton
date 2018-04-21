/**
  This file contains the BigBlueButton client APIs that will allow 3rd-party applications
  to embed the Flash client and interact with it through Javascript.
  
  HOW TO USE:
     Some APIs allow synchronous and asynchronous calls. When using asynchronous, the 3rd-party
     JS should register as listener for events listed at the bottom of this file. For synchronous,
     3rd-party JS should pass in a callback function when calling the API.
  
  For an example on how to use these APIs, see: 
  
    https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-client/resources/prod/lib/3rd-party.js
    https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-client/resources/prod/3rd-party.html
  
*/

(function(window, undefined) {

    var BBB = {};

    /**
     * Internal function to get the BBB embed object. Seems like we have to do this
     * each time and can't create a var for it.
     *
     * To get the object, see https://code.google.com/p/swfobject/wiki/api
     */
    function getSwfObj() {
      return swfobject.getObjectById("BigBlueButton");
    }

     /**
     * Query if the current user is sharing webcam.
     *
     * Param:
     *   callback - function to return the result
     *
     * If you want to instead receive an event with the result, register a listener
     * for AM_I_SHARING_CAM_RESP (see below).
     *
     */  
    BBB.amISharingWebcam = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        if (arguments.length == 0) {
          swfObj.amISharingCameraRequestAsync();
        } else {
          if (typeof callback === 'function') {
            callback(swfObj.amISharingCameraRequestSync());
          }
        }
      }
    }
    
    /**
     * Query if another user is sharing her camera.
     * 
     * Param:
     *   userID : the id of the user that may be sharing the camera
     *   callback: function if you want to be informed synchronously. Don't pass a function
     *             if you want to be informed through an event. You have to register for
     *             IS_USER_PUBLISHING_CAM_RESP (see below).
     */  
    BBB.isUserSharingWebcam = function(userID, callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        if (arguments.length == 1) {
          swfObj.isUserPublishingCamRequestAsync(userID);
        } else {
          if (arguments.length == 2 && typeof callback === 'function') {
            callback(swfObj.isUserPublishingCamRequestSync(userID));
          }
        }
      }
    }

    /**
     * Raise user's hand.
     *
     * Param:
     *   emojiStatus - [string]
     * 
     */
    BBB.emojiStatus = function(emojiStatus) {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Request to change emoji status [" + emojiStatus + "]");
        swfObj.emojiStatusRequest(emojiStatus);
      }    
    }
        
    /**
     * Issue a switch presenter command.
     *
     * Param:
     *   newPresenterUserID - the user id of the new presenter
     *
     * 3rd-party JS must listen for SWITCHED_PRESENTER (see below) to get notified
     * of switch presenter events.
     * 
     */
    BBB.switchPresenter = function(newPresenterUserID) {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Request to switch presenter to [" + newPresenterUserID + "]");
        swfObj.switchPresenterRequest(newPresenterUserID);
      }    
    }

    /**
     * Query if current user is presenter.
     *
     * Params:
     *    callback - function if you want a callback as response. Otherwise, you need to listen
     *               for AM_I_PRESENTER_RESP (see below).
     */
    BBB.amIPresenter = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        if (arguments.length == 0) {
          swfObj.amIPresenterRequestAsync();
        } else {
          if (typeof callback === 'function') {
            callback(swfObj.amIPresenterRequestSync());
          }
        }
      }
    }

    /**
     * Query user's sessionToken.
     *
     * Params:
     *    callback - function if you want a callback as response.
     */
    BBB.getSessionToken = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        if (typeof callback === 'function') {
          callback(swfObj.getSessionToken());
        }
      }
    }
    
    /**
     * Eject a user.
     *
     * Params:
     *    userID - userID of the user you want to eject.
     */    
    BBB.ejectUser = function(userID) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.ejectUserRequest(userID);
      }
    }
    
    /**
     * Query who is presenter.
     *
     * Params:
     *    callback - function that gets executed for the response.
     */    
    BBB.getPresenterUserID = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        if (typeof callback === 'function') {
          callback(swfObj.getPresenterUserID());
        }
      }
    }
            
    /**
     * Query the current user's role.
     * Params:
     *    callback - function if you want a callback as response. Otherwise, you need to listen
     *               for GET_MY_ROLE_RESP (see below).
     */
    BBB.getMyRole = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        if (arguments.length == 0) {
          swfObj.getMyRoleRequestAsync();
        } else {
          if (typeof callback === 'function') {
            callback(swfObj.getMyRoleRequestSync());
          }
        }
      }
    }

    /**
     * Query the current user's id.
     *
     * Params:
     *    callback - function that gets executed for the response.
     */
    BBB.getMyUserID = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Getting my userID");
        if (typeof callback === 'function') {
          callback(swfObj.getMyUserID());
        }
      }
    }
 
    /**
     * Query the current user's role.
     * Params:
     *    callback - function if you want a callback as response. Otherwise, you need to listen
     *               for GET_MY_ROLE_RESP (see below).
     */
    BBB.getMyUserInfo = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        if (arguments.length == 0) {
          swfObj.getMyUserInfoAsync();
        } else {
          if (typeof callback === 'function') {
            callback(swfObj.getMyUserInfoSync());
          }
        }
      }
    }
       
    /**
     * Query the meeting id.
     *
     * Params:
     *    callback - function that gets executed for the response.
     */ 
    BBB.getMeetingID = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Getting external meetingID");
        if (typeof callback === 'function') {
          callback(swfObj.getExternalMeetingID());
        }
      }
    }

    BBB.getInternalMeetingID = function(callback) {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Getting internal meetingID");
        if (typeof callback === 'function') {
          callback(swfObj.getInternalMeetingID());
        }
      }
    }
    
    /**
     * Join the voice conference.
     */  
    BBB.joinVoiceConference = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Joining voice");
        swfObj.joinVoiceRequest();
      }
    }
    
    /**
     * Leave the voice conference.
     */  
    BBB.leaveVoiceConference = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Leave voice");
        swfObj.leaveVoiceRequest();
      }
    }
    
    /**
     * Share user's webcam.
     * 
     * Params:
     *   publishInClient : (DO NOT USE - Unimplemented)
     */    
    BBB.shareVideoCamera = function(publishInClient) {
      var swfObj = getSwfObj();
      if (swfObj) {
        if (typeof publishInClient === 'boolean') {
          swfObj.shareVideoCamera(publishInClient);
        } else {
          swfObj.shareVideoCamera();
        }        
      }
    }

    /**
     * Stop share user's webcam.
     * 
     */    
    BBB.stopSharingCamera = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.stopShareCameraRequest();
      }    
    }

    /**
     * Mute the current user.
     * 
     */      
    BBB.muteMe = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.muteMeRequest(); 
      }
    }

    /**
     * Unmute the current user.
     * 
     */        
    BBB.unmuteMe = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.unmuteMeRequest(); 
      }
    }

    /**
     * Mute all the users.
     * 
     */       
    BBB.muteAll = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.muteAllUsersRequest(); 
      }
    }

    /**
     * Unmute all the users.
     * 
     */      
    BBB.unmuteAll = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.unmuteAllUsersRequest(); 
      }
    }
    
    /**
     * Switch to a new layout.
     *
     * Param:
     *  newLayout : name of the layout as defined in layout.xml (found in /var/www/bigbluebutton/client/conf/layout.xml)
     * 
     */
    BBB.switchLayout = function(newLayout) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.switchLayout(newLayout);
      }
    }

    /**
     * Lock the layout.
     *
     * Locking the layout means that users will have the same layout with the moderator that issued the lock command.
     * Other users won't be able to move or resize the different windows.
     */    
    BBB.lockLayout = function(lock) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.lockLayout(lock);
      }
    }

    /**
    * Request to send a public chat
    *  fromUserID - the external user id for the sender
    *  fontColor  - the color of the font to display the message
    *  localeLang - the 2-char locale code (e.g. en) for the sender
    *  message    - the message to send
    */    
    BBB.sendPublicChatMessage = function(fontColor, localeLang, message) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.sendPublicChatRequest(fontColor, localeLang, message);
      }    
    }
    
    /**
    * Request to send a private chat
    *  fromUserID - the external user id for the sender
    *  fontColor  - the color of the font to display the message
    *  localeLang - the 2-char locale code (e.g. en) for the sender
    *  message    - the message to send
    *  toUserID   - the external user id of the receiver
    */    
    BBB.sendPrivateChatMessage = function(fontColor, localeLang, message, toUserID) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.sendPrivateChatRequest(fontColor, localeLang, message, toUserID);
      }    
    }

    /**
    * Request to display a presentation.
    *  presentationID - the presentation to display
    */     
    BBB.displayPresentation = function(presentationID) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.displayPresentationRequest(presentationID);
      }     
    }
    
   /**
    * Query the list of uploaded presentations.
    */     
    BBB.queryListOfPresentations = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.queryListsOfPresentationsRequest();
      }     
    }

    /**
    * Request to delete a presentation.
    *  presentationID - the presentation to delete
    */      
    BBB.deletePresentation = function(presentationID) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.deletePresentationRequest(presentationID);
      }     
    }

    /**
     *
     */
     
    BBB.webRTCCallSucceeded = function() {
      // do nothing on this callback
    }

    BBB.webRTCCallStarted = function(inEchoTest) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCCallStarted(inEchoTest);
      }
    }
    
    BBB.webRTCCallConnecting = function(inEchoTest) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCCallConnecting(inEchoTest);
      }
    }
     
    BBB.webRTCCallEnded = function(inEchoTest) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCCallEnded(inEchoTest);
      }
    }

    BBB.webRTCCallFailed = function(inEchoTest, errorcode, cause) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCCallFailed(inEchoTest, errorcode, cause);
      }
    }

    BBB.webRTCCallWaitingForICE = function(inEchoTest) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCCallWaitingForICE(inEchoTest);
      }
    }
    
    BBB.webRTCCallTransferring = function(inEchoTest) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCCallTransferring(inEchoTest);
      }
    }

    BBB.webRTCCallProgressCallback = function(progress) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCCallProgressCallback(progress);
      }
    }

    BBB.webRTCMediaRequest = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCMediaRequest();
      }
    }

    BBB.webRTCMediaSuccess = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCMediaSuccess();
      }
    }
    
    BBB.webRTCMediaFail = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCMediaFail();
      }
    }

    BBB.webRTCMonitorUpdate = function(result) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.webRTCMonitorUpdate(result);
      }
    }
    
    BBB.onMessageFromDS = function(data) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.onMessageFromDS(data);
      }
    }
    
    BBB.connectedToVertx = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.connectedToVertx();
      }
    }


    // Third-party JS apps should use this to query if the BBB SWF file is ready to handle calls.
    BBB.isSwfClientReady = function() {
      return swfReady;
    }
        
    /* ***********************************************************************************
     *       Broadcasting of events to 3rd-party apps.
     *************************************************************************************/
    
    /** Stores the 3rd-party app event listeners ***/ 
    var listeners = {};

    /**
     * 3rd-party apps should user this method to register to listen for events.
     */
    BBB.listen = function(eventName, handler) {
        if (typeof listeners[eventName] === 'undefined')
            listeners[eventName] = [];
        
        listeners[eventName].push(handler);
    };

    /**
     * 3rd-party app should use this method to unregister listener for a given event.
     */
    BBB.unlisten = function(eventName, handler) {
        if (!listeners[eventName])
            return;
        
        for (var i = 0; i < listeners[eventName].length; i++) {
            if (listeners[eventName][i] === handler) {
                listeners[eventName].splice(i, 1);
                break;
            }
        }
    };

    /**
     * Private function to broadcast received event from the BigBlueButton Flash client to
     * 3rd-parties.
     */
    function broadcast(bbbEvent) {
        if (!listeners[bbbEvent.eventName]) {
            console.log("No listeners for [" + bbbEvent.eventName + "]");        
            return;
        }
        
        for (var i = 0; i < listeners[bbbEvent.eventName].length; i++) {
            console.log("Notifying listeners for [" + bbbEvent.eventName + "]"); 
            listeners[bbbEvent.eventName][i](bbbEvent);
        }
    };

    /**
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     * NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE!
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     *
     *   DO NOT CALL THIS METHOD FROM YOUR JS CODE.
     *
     * This is called by the BigBlueButton Flash client to inform 3rd-parties of internal events.
     *
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     * NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE!
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=     
     */
    BBB.handleFlashClientBroadcastEvent = function (bbbEvent) {
      console.log("Received [" + bbbEvent.eventName + "]");
      broadcast(bbbEvent);
    }
  
  /**
    BBB.loginToDeepstream = function(meetingId) {
        console.log("***** LOGGING TO DS " + meetingId)
        dsclient.login()
        dsclient.event.subscribe("foo-bar", function (data) {
         // console.log(data);
          BBB.onMessageFromDS(data);
          })
    }
    **/
    
    const eb = new vertx.EventBus("http://192.168.246.131:3001/eventbus");
    eb.onopen = function () {
      console.log("FOOOO!!!!!");
    };
        
    BBB.sendAuthToken = function(data) {
      eb.registerHandler("chat.to.client", function (error, msg) {
      	if (error != null) {
      		console.log("From server error: " + JSON.stringify(error));
      	} else {
      	  console.log("From server: " + msg + "\n");
        	BBB.onMessageFromDS(msg);
      	}
      });
      
      BBB.connectedToVertx();
    }
      
    BBB.sendToDeepstream = function(data) {
      eb.send("chat.to.server", data, function(msg) {
           //console.log("reply: " + msg + "\n");
      });
    };
    
    
    // Flag to indicate that the SWF file has been loaded and ready to handle calls.
    var swfReady = false;

    /**
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     * NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE!
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     *
     *   DO NOT CALL THIS METHOD FROM YOUR JS CODE.
     *
     * This is called by the BigBlueButton Flash client to inform 3rd-parties that it is ready.
     *
     * WARNING:
     *   Doesn't actually work as intended. The Flash client calls this function when it's loaded.
     *   However, the client as to query the BBB server to get the status of the meeting.
     *   We're working on the proper way to determining that the client is TRULY ready.
     *
     *   !!! As a workaround, 3rd-party JS on init should call getUserInfo until it return NOT NULL.
     *
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     * NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE!
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=     
     */    
    BBB.swfClientIsReady = function () {
      console.log("BigBlueButton SWF is ready.");
      swfReady = true;
    }
    
   /* ********************************************************************* */

    BBB.init =  function(callback) {
      callback;
    }
    
     
    /************************************************
     * EVENT NAME CONSTANTS
     *
     * See https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-client/src/org/bigbluebutton/core/EventConstants.as
     *
     ************************************************/
    var GET_MY_ROLE_RESP            = 'GetMyRoleResponse';
    var AM_I_PRESENTER_RESP         = 'AmIPresenterQueryResponse';
    var AM_I_SHARING_CAM_RESP       = 'AmISharingCamQueryResponse';
    var BROADCASTING_CAM_STARTED    = 'BroadcastingCameraStartedEvent';
    var BROADCASTING_CAM_STOPPED    = 'BroadcastingCameraStoppedEvent';
    var I_AM_SHARING_CAM            = 'IAmSharingCamEvent';
    var CAM_STREAM_SHARED           = 'CamStreamSharedEvent';
    var USER_JOINED                 = 'UserJoinedEvent';
    var USER_LEFT                   = 'UserLeftEvent';
    var SWITCHED_PRESENTER          = 'SwitchedPresenterEvent';
    var NEW_ROLE                    = 'NewRoleEvent';
    var NEW_PRIVATE_CHAT            = 'NewPrivateChatEvent';
    var NEW_PUBLIC_CHAT             = 'NewPublicChatEvent';
    var SWITCHED_LAYOUT             = 'SwitchedLayoutEvent';
    var REMOTE_LOCKED_LAYOUT        = 'RemoteLockedLayoutEvent';
    var REMOTE_UNLOCKED_LAYOUT      = 'RemoteUnlockedLayoutEvent';
    var USER_JOINED_VOICE           = 'UserJoinedVoiceEvent';
    var USER_LEFT_VOICE             = 'UserLeftVoiceEvent';
    var USER_KICKED_OUT             = 'UserKickedOutEvent';
    var USER_MUTED_VOICE            = 'UserVoiceMutedEvent';
    var USER_TALKING                = 'UserTalkingEvent';
    var USER_LOCKED_VOICE           = 'UserLockedVoiceEvent';
    var START_PRIVATE_CHAT          = "StartPrivateChatEvent";
    var GET_MY_USER_INFO_REP        = "GetMyUserInfoResponse";
    var IS_USER_PUBLISHING_CAM_RESP  = "IsUserPublishingCamResponse";
    
    /*conversion events*/
    var OFFICE_DOC_CONVERSION_SUCCESS = "OfficeDocConversionSuccess";
    var OFFICE_DOC_CONVERSION_FAILED = "OfficeDocConversionFailed";
    var SUPPORTED_DOCUMENT = "SupportedDocument";
    var UNSUPPORTED_DOCUMENT = "UnsupportedDocument";    
    var PAGE_COUNT_FAILED = "PageCountFailed";
    var THUMBNAILS_UPDATE = "ThumbnailsUpdate";
    var PAGE_COUNT_EXCEEDED = "PageCountExceeded";
    var CONVERT_SUCCESS = "ConvertSuccess";
    var CONVERT_UPDATE = "ConvertUpdate";

    window.BBB = BBB;
})(this);
