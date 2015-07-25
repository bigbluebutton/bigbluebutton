package org.bigbluebutton.main.api
{
  import flash.external.ExternalInterface;

  public class JSLogger {
    private static var instance:JSLogger = null;
    
    public function JSLogger(enforcer:JSLoggerSingletonEnforcer) {
      if (enforcer == null) {
        throw new Error("There can only be 1 JSLogger instance");
      }
    }
    
    public static function getInst():JSLogger {
      if (instance == null){
        instance = new JSLogger(new JSLoggerSingletonEnforcer());
      }
      return instance;
    }
    
    public function debug(message:String, data: Object):void
    {
      ExternalInterface.call("BBBLog.debug", message, data);
    }
    
    public function info(message:String, data: Object):void
    {
      ExternalInterface.call("BBBLog.info", message, data);
    }
    
    public function error(message:String, data: Object):void
    {
      ExternalInterface.call("BBBLog.error", message, data);
    }
        
    public function warn(message:String, data: Object):void
    {
      ExternalInterface.call("BBBLog.warning", message, data);
    }
    
    public function critical(message:String, data: Object):void
    {
      ExternalInterface.call("BBBLog.critical", message, data);
    }
    
    public function log(text: String):void {
      ExternalInterface.call("BBBLog.log", text);
    }    
  }
}

class JSLoggerSingletonEnforcer{}