package org.bigbluebutton.core.model
{
  public class MeetingModel
  {
    private static var instance:MeetingModel = null;
    
    public function MeetingModel(enforcer: MeetingModelSingletonEnforcer)
    {
      if (enforcer == null){
        throw new Error("There can only be 1 MeetingModel instance");
      }
    }
    
    public static function getInstance():MeetingModel{
      if (instance == null){
        instance = new MeetingModel(new MeetingModelSingletonEnforcer());
      }
      return instance;
    }    
  }
}

class MeetingModelSingletonEnforcer{}