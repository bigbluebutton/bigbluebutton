package org.bigbluebutton.core.model.users
{
  import mx.collections.ArrayCollection;
  
  public class GuestsApp
  {
    
    private var _setBy: String = "";
    private var _guestPolicy: String = "";
    
    private var _guests:ArrayCollection = new ArrayCollection();
    
    public function getGuests(): Array {
      var guests: Array = new Array();
      for (var i:int = 0; i < _guests.length; i++) {
        var user:GuestWaiting = _guests.getItemAt(i) as GuestWaiting;
        if (user.guest) {
          guests.push(user);
        }
      }
      return guests;
    }

    public function getAuthenticatedGuests(): Array {
      var guests: Array = new Array();
      for (var i:int = 0; i < _guests.length; i++) {
        var user:GuestWaiting = _guests.getItemAt(i) as GuestWaiting;
        if (user.authenticated) {
           guests.push(user);
        }
      }
      return guests;
    }

    public function add(user: GuestWaiting):void {
      _guests.addItem(user);
    }
    
    public function remove(userId: String):GuestWaiting {
      var index:int = getIndex(userId);
      if (index >= 0) {
        return _guests.removeItemAt(index) as GuestWaiting;
      }
      
      return null;
    }
    
    public function getUserAndIndex(userId: String):Object {
      var user:GuestWaiting;
      for (var i:int = 0; i < _guests.length; i++) {
        user = _guests.getItemAt(i) as GuestWaiting;
        
        if (user.intId == userId) {
          return {index:i, user:user};;
        }
      }
      
      return null;      
    }
    
    public function getUser(userId:String):GuestWaiting {
      var user:GuestWaiting;
      
      for (var i:int = 0; i < _guests.length; i++) {
        user = _guests.getItemAt(i) as GuestWaiting;
        
        if (user.intId == userId) {
          return user;
        }
      }
      
      return null;
    }
    
    public function getIndex(userId: String):int {
      var user:GuestWaiting;
      for (var i:int = 0; i < _guests.length; i++) {
        user = _guests.getItemAt(i) as GuestWaiting;
        
        if (user.intId == userId) {
          return i;
        }
      }
      
      return -1;
    }
    
    public function setGuestPolicy(value: String): void {
      _guestPolicy = value;
    }
    
    public function getGuestPolicy(): String {
      return _guestPolicy;
    }
    
    public function userJoined(vu: GuestWaiting):void {
      add(vu);    
    }
    
    public function userLeft(intId: String):GuestWaiting {
      return remove(intId);
    }
    
  }
}