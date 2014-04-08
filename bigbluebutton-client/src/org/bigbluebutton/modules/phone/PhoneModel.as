package org.bigbluebutton.modules.phone
{
  public class PhoneModel
  {
    private static const LOG:String = "PhoneModel - ";
    
    private static var instance:PhoneModel = null;
    
    public function PhoneModel(enforcer:PhoneModelSingletonEnforcer) {
      if (enforcer == null) {
        throw new Error("There can only be 1 PhoneModel instance");
      }
    }
    
    /**
     * Return the single instance of the PhoneModel class
     */
    public static function get instance():PhoneModel {
      if (instance == null){
        instance = new PhoneModel(new PhoneModelSingletonEnforcer());
      }
      return instance;
    }
  }
}

class PhoneModelSingletonEnforcer{}
