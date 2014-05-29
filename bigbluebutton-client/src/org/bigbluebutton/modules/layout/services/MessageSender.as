package org.bigbluebutton.modules.layout.services
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;

  public class MessageSender
  {
    public function getCurrentLayout():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("layout.getCurrentLayout", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      );
    }

    public function syncLayout(layout:LayoutDefinition):void {
      var message:Object = new Object();
      message["setByUserID"] = UserManager.getInstance().getConference().getMyUserId();
      message["layout"] = layout.toXml().toXMLString();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("layout.sync", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      );
    }
    
    public function broadcastLayout(layout:LayoutDefinition, locked:Boolean):void {
      var message:Object = new Object();
      message["setByUserID"] = UserManager.getInstance().getConference().getMyUserId();
      message["layout"] = layout.toXml().toXMLString();
      message["locked"] = locked;
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("layout.broadcast", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      );
    }
    
    public function unlockLayout():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("layout.unlock", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        }
      );
    }
  }
}