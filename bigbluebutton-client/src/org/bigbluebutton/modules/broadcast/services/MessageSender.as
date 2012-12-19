package org.bigbluebutton.modules.broadcast.services
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.managers.ConnectionManager;

  public class MessageSender
  {
    public function playStream(uri:String, streamId:String, streamName:String):void {
      var conn:Connection = BBB.initConnectionManager().getConnection("bbb");
      if (conn != null) {
        var message:Object = new Object();
        message["messageId"] = "playBroadcastStream";
        message["uri"] = uri;
        message["streamId"] = streamId;
        message["streamName"] = streamName;				
        conn.sendMessage(message);
        var message:Object = new Object();
        message["pageNum"] = pageNum;
        
        var _nc:ConnectionManager = BBB.initConnectionManager();
        _nc.sendMessage("whiteboard.setActivePage", 
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
    
    public function stopStream():void {
      var conn:Connection = BBB.initConnectionManager().getConnection("bbb");
      if (conn != null) {
        var message:Object = new Object();
        message["messageId"] = "stopBroadcastStream";			
        conn.sendMessage(message);
      }
    }
    
    public function sendWhatIsTheCurrentStreamRequest():void {
      var conn:Connection = BBB.initConnectionManager().getConnection("bbb");
      if (conn != null) {
        var message:Object = new Object();
        message["messageId"] = "whatIsTheCurrentStreamRequest";	
        message["requestedBy"] = UserManager.getInstance().getConference().getMyUserId();
        conn.sendMessage(message);
      }
    }
    
    public function sendWhatIsTheCurrentStreamReply(requestedByUserid:Number, streamId:String):void {
      var conn:Connection = BBB.initConnectionManager().getConnection("bbb");
      if (conn != null) {
        var message:Object = new Object();
        message["messageId"] = "whatIsTheCurrentStreamReply";	
        message["requestedBy"] = requestedByUserid;
        message["streamId"] = streamId;
        conn.sendMessage(message);
      }			
    }
  }
}