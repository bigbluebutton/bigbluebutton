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
    }

    /**
     * Raise user's hand.
     *
     * Param:
     *   raiseHand - [true/false]
     * 
     */
    BBB.raiseHand = function(raiseHand) {
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
    }

    /**
     * Query if current user is presenter.
     *
     * Params:
     *    callback - function if you want a callback as response. Otherwise, you need to listen
     *               for AM_I_PRESENTER_RESP (see below).
     */
    BBB.amIPresenter = function(callback) {
    }

    /**
     * Eject a user.
     *
     * Params:
     *    userID - userID of the user you want to eject.
     */    
    BBB.ejectUser = function(userID) {
    }
    
    /**
     * Query who is presenter.
     *
     * Params:
     *    callback - function that gets executed for the response.
     */    
    BBB.getPresenterUserID = function(callback) {
    }
            
    /**
     * Query the current user's role.
     * Params:
     *    callback - function if you want a callback as response. Otherwise, you need to listen
     *               for GET_MY_ROLE_RESP (see below).
     */
    BBB.getMyRole = function(callback) {
    }

    /**
     * Query the current user's id.
     *
     * Params:
     *    callback - function that gets executed for the response.
     */
    BBB.getMyUserID = function(callback) {
    }
 
    /**
     * Query the current user's role.
     * Params:
     *    callback - function if you want a callback as response. Otherwise, you need to listen
     *               for GET_MY_ROLE_RESP (see below).
     */
    BBB.getMyUserInfo = function(callback) {

      var result = {
        "myUserID" : getInSession("userId"),
        "myUsername": getInSession("userName"),
        "myAvatarURL": null,
        "myRole": "VIEWER",
        "amIPresenter": false,
        "voiceBridge": Meteor.Meetings.findOne({}).voiceConf,  
        "dialNumber": null 
      }

      if (arguments.length == 0) {
        return result
        } else {
          if (typeof callback === 'function') {
            callback(result);
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
    }

    BBB.getInternalMeetingID = function(callback) {
    }
    
    /**
     * Join the voice conference.
     */  
    BBB.joinVoiceConference = function() {
    }
    
    /**
     * Leave the voice conference.
     */  
    BBB.leaveVoiceConference = function() {
      console.log ("Leave voice");
    }






    
    /**
     * Share user's webcam.
     * 
     * Params:
     *   publishInClient : (DO NOT USE - Unimplemented)
     */    
    BBB.shareVideoCamera = function(publishInClient) {
    }

    /**
     * Stop share user's webcam.
     * 
     */    
    BBB.stopSharingCamera = function() {
    }

    /**
     * Mute the current user.
     * 
     */      
    BBB.muteMe = function() {
    }

    /**
     * Unmute the current user.
     * 
     */        
    BBB.unmuteMe = function() {
    }

    /**
     * Mute all the users.
     * 
     */       
    BBB.muteAll = function() {
    }

    /**
     * Unmute all the users.
     * 
     */      
    BBB.unmuteAll = function() {
    }
    
    /**
     * Switch to a new layout.
     *
     * Param:
     *  newLayout : name of the layout as defined in layout.xml (found in /var/www/bigbluebutton/client/conf/layout.xml)
     * 
     */
    BBB.switchLayout = function(newLayout) {
    }

    /**
     * Lock the layout.
     *
     * Locking the layout means that users will have the same layout with the moderator that issued the lock command.
     * Other users won't be able to move or resize the different windows.
     */    
    BBB.lockLayout = function(lock) {
    }

    /**
    * Request to send a public chat
    *  fromUserID - the external user id for the sender
    *  fontColor  - the color of the font to display the message
    *  localeLang - the 2-char locale code (e.g. en) for the sender
    *  message    - the message to send
    */    
    BBB.sendPublicChatMessage = function(fontColor, localeLang, message) {
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
    }

    /**
    * Request to display a presentation.
    *  presentationID - the presentation to display
    */     
    BBB.displayPresentation = function(presentationID) {
    }
    
   /**
    * Query the list of uploaded presentations.
    */     
    BBB.queryListOfPresentations = function() {
    }

    /**
    * Request to delete a presentation.
    *  presentationID - the presentation to delete
    */      
    BBB.deletePresentation = function(presentationID) {
    }

    /**
     *
     */
     
    BBB.webRTCConferenceCallStarted = function() {
    }
    
    BBB.webRTCConferenceCallConnecting = function() {
    }
     
    BBB.webRTCConferenceCallEnded = function() {
    }

    BBB.webRTCConferenceCallFailed = function(errorcode) {
    }

    BBB.webRTCConferenceCallWaitingForICE = function() {
    }

    BBB.webRTCCallProgressCallback = function(progress) {
    }

    BBB.webRTCEchoTestStarted = function() {
    }
    
    BBB.webRTCEchoTestConnecting = function() {
    }

    BBB.webRTCEchoTestFailed = function(reason) {
    }
    
    BBB.webRTCEchoTestWaitingForICE = function() {
    }
    

    BBB.webRTCEchoTestEnded = function() {
    }
    
    BBB.webRTCMediaRequest = function() {
    }

    BBB.webRTCMediaSuccess = function() {
    }
    
    BBB.webRTCMediaFail = function() {
    }
    
    BBB.webRTCWebcamRequest = function() {
    }

    BBB.webRTCWebcamRequestSuccess = function() {
    }
    
    BBB.webRTCWebcamRequestFail = function(reason) {
    }
            
    // Third-party JS apps should use this to query if the BBB SWF file is ready to handle calls.
    BBB.isSwfClientReady = function() {
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
    };

    /**
     * 3rd-party app should use this method to unregister listener for a given event.
     */
    BBB.unlisten = function(eventName, handler) {
    };

    /**
     * Private function to broadcast received event from the BigBlueButton Flash client to
     * 3rd-parties.
     */
    function broadcast(bbbEvent) {
    };
    

    
   /* ********************************************************************* */

    BBB.init =  function(callback) {
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

