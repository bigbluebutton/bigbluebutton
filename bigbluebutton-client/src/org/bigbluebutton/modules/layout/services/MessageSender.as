package org.bigbluebutton.modules.layout.services
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.ConnectionManager;
  import org.bigbluebutton.modules.layout.model.LayoutDefinition;

  public class MessageSender
  {
	private static const LOGGER:ILogger = getClassLogger(MessageSender);
    
    public function getCurrentLayout():void {
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("layout.getCurrentLayout", 
        function(result:String):void { // On successful result
			LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
			LOGGER.error(status); 
        }
      );
    }
    
    public function broadcastLayout(layout:LayoutDefinition):void {
      LOGGER.debug("broadcast layout");
      var message:Object = new Object();
      message["layout"] = layout.toXml().toXMLString();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("layout.broadcast", 
        function(result:String):void { // On successful result
			LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
			LOGGER.error(status); 
        },
        message
      );
    }
    
    public function lockLayout(lock:Boolean, viewersOnly:Boolean, layout:LayoutDefinition=null):void {
		LOGGER.debug("lock layout");
      var message:Object = new Object();
      message["lock"] = lock;
      message["viewersOnly"] = viewersOnly;
      if (layout != null) 
        message["layout"] = layout.toXml().toXMLString();
      
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage("layout.lock", 
        function(result:String):void { // On successful result
			LOGGER.debug(result); 
        },	                   
        function(status:String):void { // status - On error occurred
			LOGGER.error(status); 
        },
        message
      );
    }
  }
}