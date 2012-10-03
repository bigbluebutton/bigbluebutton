(function(window, undefined) {
    console.log("initing BBB");

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

      
    BBB.joinVoiceConference = function() {
      console.log("Calling the swf file");
      var swfObj = getSwfObj();
      if (swfObj) {
        console.log("Joining voice");
        swfObj.joinVoice();
      }
    }
        
    BBB.shareVideoCamera = function() {
      console.log("Sharing webcam");
      var swfObj = getSwfObj();
      if (swfObj) {
        swfObj.shareVideoCamera(); 
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
        if (!listeners[bbbEvent.eventName])
            return;

        for (var i = 0; i < listeners[bbbEvent.eventName].length; i++) {
            listeners[eventName][i](bbbEvent);
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
    
    window.BBB = BBB;
})(this);


if (typeof window.BBB_Ready === 'function')
	window.BBB_Ready();

