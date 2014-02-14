package org.bigbluebutton.core.model
{
  public class UsersModel
  {
    private static var instance:UsersModel = null;
    
    private var _me:Me;
    
    public function UsersModel(enforcer: UsersModelSingletonEnforcer)
    {
      if (enforcer == null){
        throw new Error("There can only be 1 UsersModel instance");
      }
    }
    
    public static function getInstance():UsersModel{
      if (instance == null){
        instance = new UsersModel(new UsersModelSingletonEnforcer());
      }
      return instance;
    }
    
    public function set me(value: Me):void {
      _me = value;
    }
    
    public function get me():Me {
      return _me;
    }
  }
}

class UsersModelSingletonEnforcer{}
