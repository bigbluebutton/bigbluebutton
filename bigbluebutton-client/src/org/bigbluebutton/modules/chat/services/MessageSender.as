package org.bigbluebutton.modules.chat.services
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class MessageSender
  {
    public function getPublicMessages():void
    {  
      LogUtil.debug("Sending [chat.getPublicMessages] to server.");
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("chat.getChatMessages", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      );
    }
    
    public function sendPublicMessage(message:ChatMessageVO):void
    {  
      LogUtil.debug("Sending [chat.sendPublicMessage] to server.");
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("chat.sendPublicMessage", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message.toObj()
      );
    }
    
    public function sendPrivateMessage(message:ChatMessageVO):void
    {  
      LogUtil.debug("Sending [chat.sendPrivateMessage] to server.");
      LogUtil.debug("Sending fromUserID [" + message.fromUserID + "] to toUserID [" + message.toUserID + "]");
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("chat.sendPrivateMessage", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message.toObj()
      );
    }
  }
}