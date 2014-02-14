package org.bigbluebutton.core.model
{
  public class UsersService
  {
    private static var instance:UsersService = null;
    
    public function UsersService(enforcer: UsersServiceSingletonEnforcer) {
      if (enforcer == null){
        throw new Error("There can only be 1 UsersService instance");
      }
    }
    
    public static function getInstance():UsersService{
      if (instance == null){
        instance = new UsersService(new UsersServiceSingletonEnforcer());
      }
      return instance;
    } 
    
    
    public function userJoinedVoice(userId: String):void {
      
    }
    
    public function userLeftVoice(userId: String):void {
      
    }
    
    public function userJoined(user:Object):void {
      
    }
    
    public function userLeft():void {
      
    }
    
    public function userMuted(userId: String, muted: Boolean):void {
      
    }
    
    public function userTalking(userId: String, talking: Boolean):void {
      
    }
    
  }
}

class UsersServiceSingletonEnforcer{}