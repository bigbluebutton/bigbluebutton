package org.bigbluebutton.main.api
{
  import flash.external.ExternalInterface;

  class JSLogger {
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
    
    public function debug(message:String):void
    {
      log("[DEB] - " + message);
    }
    
    public function info(message:String):void
    {
      log("[INF] - " +message);
    }
    
    public function error(message:String):void
    {
      log("[ERR] -" + message);
    }
        
    public function warn(message:String):void
    {
      log("[WAR] - " + message);
    }
    
    public function log(text: String):void {
      ExternalInterface.call("BBBLog.log", text);
    }    
  }
}

class JSLoggerSingletonEnforcer{}