// Filename: services/bbb
define([
  'underscore',
  'backbone',
  'swfobject'
], function(_, Backbone, SwfObject){
  var BBB2 = ({

    /**
     * Function called by the Flash client to inform 3rd-parties of internal events.
     */
    handleFlashClientBroadcastEvent : function (bbbEvent) {
      console.log("Received [" + bbbEvent.eventName + "]");
 //     trigger(bbbEvent.eventName, bbbEvent);
    }
  });
  
  _.extend(BBB2, Backbone.Events);
  
  return BBB2;
});