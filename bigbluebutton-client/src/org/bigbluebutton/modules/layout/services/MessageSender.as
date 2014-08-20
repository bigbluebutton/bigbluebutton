package org.bigbluebutton.modules.layout.services
{
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;

  public class MessageSender
  {
    private static const LOG:String = "Layout::MessageSender - ";
    
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
    
    public function broadcastLayout(layout:LayoutDefinition):void {
      trace(LOG + " - broadcast layout");
      var message:Object = new Object();
      message["layout"] = layout.toXml().toXMLString();
      
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
    
    public function lockLayout(lock:Boolean, viewersOnly:Boolean, layout:LayoutDefinition=null):void {
      trace(LOG + " - lock layout");
      var message:Object = new Object();
      message["lock"] = lock;
      message["viewersOnly"] = viewersOnly;
      if (layout != null) 
        message["layout"] = layout.toXml().toXMLString();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("layout.lock", 
        function(result:String):void { // On successful result
          LogUtil.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
          LogUtil.error(status); 
        },
        message
      );
    }
  }
}