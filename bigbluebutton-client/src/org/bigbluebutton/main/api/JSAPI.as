package org.bigbluebutton.main.api
{
  import flash.external.ExternalInterface;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;

  public class JSAPI {
	private static const LOGGER:ILogger = getClassLogger(JSAPI);
    
    private static var instance:JSAPI = null;
    
    public function JSAPI(enforcer:JSAPISingletonEnforcer) {
      if (enforcer == null) {
        throw new Error("There can only be 1 JSAPI instance");
      }
    }
    
    /**
     * Return the single instance of the JSAPI class
     */
    public static function getInstance():JSAPI {
      if (instance == null){
        instance = new JSAPI(new JSAPISingletonEnforcer());
      }
      return instance;
    }
    
    public function callWithWebRTC(caller:String, destination:String):void {
      var payload:Object = new Object();
      payload.destination = destination;
      payload.caller = caller;
      ExternalInterface.call("callWithWebRTC", payload);
    }
    
    public function hangupWebRTCCall():void {
      ExternalInterface.call("hangupWebRTCCall");
    }
    
    public function isWebRTCAvailable():Boolean {
      if (ExternalInterface.available) {
        return ExternalInterface.call("isWebRTCAvailable");
      }
      return false;
    }
    
  }
}

class JSAPISingletonEnforcer{}
