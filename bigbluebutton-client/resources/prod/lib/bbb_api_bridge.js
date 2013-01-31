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
     * Get info if user is sharing webcam.
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
     * Get my user info.
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
    
    BBB.switchPresenter = function(newPresenterUserID) {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Request to switch presenter to [" + newPresenterUserID + "]");
        swfObj.switchPresenterRequest(newPresenterUserID);
      }    
    }

    /**
     * Query the Flash client if user is presenter.
     * Params:
     *    callback - function if you want a callback as response. Otherwise, you need to listen
     *               for the response as an event.
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
     * Query the Flash client for the user's role.
     * Params:
     *    callback - function if you want a callback as response. Otherwise, you need to listen
     *               for the response as an event.
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
     * Get external userID.
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
     * Get my user info.
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
     * Get external meetingID.
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
    
    BBB.leaveVoiceConference = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Leave voice");
        swfObj.leaveVoiceRequest();
      }
    }
    
    /**
     * Share user's webcam.
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

    BBB.stopSharingCamera = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.stopShareCameraRequest();
      }    
    }
    
    BBB.muteMe = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.muteMeRequest(); 
      }
    }
    
    BBB.unmuteMe = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.unmuteMeRequest(); 
      }
    }
    
    BBB.muteAll = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.muteAllUsersRequest(); 
      }
    }
    
    BBB.unmuteAll = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.unmuteAllUsersRequest(); 
      }
    }
    
    BBB.switchLayout = function(newLayout) {
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.switchLayout(newLayout);
      }
    }
    
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
    
        
    /* ***********************************************************************************
     *       Broadcasting of events to 3rd-party apps.
     *************************************************************************************/
    
    /** Stores the event listeners ***/ 
    var listeners = {};

    /**
     * Register to listen for events.
     */
    BBB.listen = function(eventName, handler) {
        if (typeof listeners[eventName] === 'undefined')
            listeners[eventName] = [];
        
        listeners[eventName].push(handler);
    };

    /**
     * Unregister listener for event.
     */
    BBB.unlisten = function(eventName, handler) {
        if (!listeners[eventName])
            return;
        
        for (var i = 0; i < listeners[eventName].length; i++) {
            if (listeners[eventName][i] === handler) {
                listeners.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Private function to broadcast received event from Flash client to
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
     * Function called by the Flash client to inform 3rd-parties of internal events.
     */
    BBB.handleFlashClientBroadcastEvent = function (bbbEvent) {
      console.log("Received [" + bbbEvent.eventName + "]");
      broadcast(bbbEvent);
    }
    
   /* ********************************************************************* */

    BBB.init =  function(callback) {
      callback;
    }
    
    // Flag to indicate that the SWF file has been loaded and ready to handle calls.
    var swfReady = false;
    BBB.swfClientIsReady = function () {
      console.log("BigBlueButton SWF is ready.");
      swfReady = true;
    }
    
    // Third-party JS apps should use this to query if the BBB SWF file is ready to handle calls.
    BBB.isSwfClientReady = function() {
      return swfReady;
    }
     
    /************************************************
     * EVENT NAME CONSTANTS
     *
     * See https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-client/src/org/bigbluebutton/core/EventConstants.as
     *
     ************************************************/
    var GET_MY_ROLE_RESP           = 'GetMyRoleResponse';
    var AM_I_PRESENTER_RESP        = 'AmIPresenterQueryResponse';
    var AM_I_SHARING_CAM_RESP      = 'AmISharingCamQueryResponse';
    var BROADCASTING_CAM_STARTED   = 'BroadcastingCameraStartedEvent';
    var BROADCASTING_CAM_STOPPED   = 'BroadcastingCameraStoppedEvent';
    var I_AM_SHARING_CAM           = 'IAmSharingCamEvent';
    var CAM_STREAM_SHARED          = 'CamStreamSharedEvent';
    var USER_JOINED                = 'UserJoinedEvent';
    var USER_LEFT                  = 'UserLeftEvent';
    var SWITCHED_PRESENTER         = 'SwitchedPresenterEvent';
    var NEW_PRIVATE_CHAT           = 'NewPrivateChatEvent';
    var NEW_PUBLIC_CHAT            = 'NewPublicChatEvent';
    var SWITCHED_LAYOUT            = 'SwitchedLayoutEvent';
    var REMOTE_LOCKED_LAYOUT       = 'RemoteLockedLayoutEvent';
    var REMOTE_UNLOCKED_LAYOUT     = 'RemoteUnlockedLayoutEvent';
    var USER_JOINED_VOICE          = 'UserJoinedVoiceEvent';
    var USER_LEFT_VOICE            = 'UserLeftVoiceEvent';
    var USER_MUTED_VOICE           = 'UserVoiceMutedEvent';
    var USER_TALKING               = 'UserTalkingEvent';
    var USER_LOCKED_VOICE          = 'UserLockedVoiceEvent';
    var START_PRIVATE_CHAT         = 'StartPrivateChatEvent';
           
    window.BBB = BBB;
})(this);

