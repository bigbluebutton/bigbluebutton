package org.bigbluebutton.core.model.users
{
  import mx.collections.ArrayCollection;
  
  public class GuestPolicy
  {
    
    private var _guestPolicy: String;
    
    private var _guests:ArrayCollection = new ArrayCollection();
    
    public function add(user: Guest):void {
      _guests.addItem(user);
    }
    
    public function remove(userId: String):Guest {
      var index:int = getIndex(userId);
      if (index >= 0) {
        return _guests.removeItemAt(index) as Guest;
      }
      
      return null;
    }
    
    public function getUserAndIndex(userId: String):Object {
      var user:Guest;
      for (var i:int = 0; i < _guests.length; i++) {
        user = _guests.getItemAt(i) as Guest;
        
        if (user.intId == userId) {
          return {index:i, user:user};;
        }
      }
      
      return null;      
    }
    
    public function getUser(userId:String):Guest {
      var user:Guest;
      
      for (var i:int = 0; i < _guests.length; i++) {
        user = _guests.getItemAt(i) as Guest;
        
        if (user.intId == userId) {
          return user;
        }
      }				
      
      return null;
    }
    
    public function getIndex(userId: String):int {
      var user:Guest;
      for (var i:int = 0; i < _guests.length; i++) {
        user = _guests.getItemAt(i) as Guest;
        
        if (user.intId == userId) {
          return i;
        }
      }
      
      return -1;
    }
    
    public function userJoined(vu: Guest):void {
      add(vu);    
    }
    
    public function userLeft(intId: String):Guest {
      return remove(intId);
    }
    
  }
}