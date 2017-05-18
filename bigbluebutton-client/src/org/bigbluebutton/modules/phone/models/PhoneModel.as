package org.bigbluebutton.modules.phone.models
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;

  public class PhoneModel
  {
	private static const LOGGER:ILogger = getClassLogger(PhoneModel);      
    
    private static var instance:PhoneModel = null;
    
    private var _webRTCModel:WebRTCModel = new WebRTCModel();
    
    public function PhoneModel(enforcer:PhoneModelSingletonEnforcer) {
      if (enforcer == null) {
        throw new Error("There can only be 1 PhoneModel instance");
      }
    }
    
    /**
     * Return the single instance of the PhoneModel class
     */
    public static function getInstance():PhoneModel {
      if (instance == null){
        instance = new PhoneModel(new PhoneModelSingletonEnforcer());
      }
      return instance;
    }
    
    public function get webRTCModel():WebRTCModel {
      return _webRTCModel;
    }
  }
}

class PhoneModelSingletonEnforcer{}
