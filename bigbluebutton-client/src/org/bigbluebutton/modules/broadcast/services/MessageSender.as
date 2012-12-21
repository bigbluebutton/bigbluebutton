package org.bigbluebutton.modules.broadcast.services
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.core.managers.UserManager;

  public class MessageSender
  {
    public function playStream(uri:String, streamId:String, streamName:String):void {
        var message:Object = new Object();
        message["messageID"] = "BroadcastPlayStreamCommand";
        message["uri"] = uri;
        message["streamID"] = streamId;
        message["streamName"] = streamName;				
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("bigbluebutton.sendMessage", 
        function(result:String):void { // On successful result
          trace(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      );
    }
    
    public function stopStream():void {
        var message:Object = new Object();
        message["messageID"] = "BroadcastStopStreamCommand";			
        
        var _nc:ConnectionManager = BBB.initConnectionManager();
        _nc.sendMessage("bigbluebutton.sendMessage", 
          function(result:String):void { // On successful result
            trace(result); 
          },	                   
          function(status:String):void { // status - On error occurred
            LogUtil.error(status); 
          },
          message
        );
    }
    
    public function sendWhatIsTheCurrentStreamRequest():void {
        var message:Object = new Object();
        message["messageID"] = "BroadcastWhatIsTheCurrentStreamRequest";	
        message["requestedBy"] = UserManager.getInstance().getConference().getMyUserId();
        
        var _nc:ConnectionManager = BBB.initConnectionManager();
        _nc.sendMessage("bigbluebutton.sendMessage", 
          function(result:String):void { // On successful result
            trace(result); 
          },	                   
          function(status:String):void { // status - On error occurred
            LogUtil.error(status); 
          },
          message
        );
    }
    
    public function sendWhatIsTheCurrentStreamReply(requestedByUserID:Number, streamID:String):void {
        var message:Object = new Object();
        message["messageID"] = "BroadcastWhatIsTheCurrentStreamReply";	
        message["requestedBy"] = requestedByUserID;
        message["streamID"] = streamID;

        var _nc:ConnectionManager = BBB.initConnectionManager();
        _nc.sendMessage("bigbluebutton.sendMessage", 
          function(result:String):void { // On successful result
            trace(result); 
          },	                   
          function(status:String):void { // status - On error occurred
            LogUtil.error(status); 
          },
          message
        );        
    }
  }
}