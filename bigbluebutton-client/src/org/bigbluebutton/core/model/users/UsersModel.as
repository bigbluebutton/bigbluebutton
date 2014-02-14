package org.bigbluebutton.core.model.users
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.core.model.Me;

  public class UsersModel
  {
    private static var instance:UsersModel = null;
    private var _me:Me;
    
    private var _users:ArrayCollection = new ArrayCollection();
    
    public function UsersModel(enforcer: UsersModelSingletonEnforcer) {
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
    
    public function add(user: User):void {
      _users.addItem(user);
    }
    
    public function remove(userId: String):User {
      var index:int = getIndex(userId);
      if (index >= 0) {
        return _users.removeItemAt(index) as User;
      }
      
      return null;
    }
    
    public function getUser(userId:String):User {
      var user:User;
      
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as User;
        
        if (user.id == userId) {
          return user;
        }
      }				
      
      return null;
    }
    
    private function getIndex(userId: String):int {
      var user:User;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as User;
        
        if (user.id == userId) {
          return i;
        }
      }
      
      return -1;
    }
    
//    private function get users():ArrayCollection {
//      var us:ArrayCollection = new ArrayCollection();
//      for (var i:int = 0; i < _users.length; i++) {
//        
//      }
//   }
  }
}

class UsersModelSingletonEnforcer{}
