package org.bigbluebutton.core.model.users
{
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.core.model.Me;

  public class VoiceUsers2x
  {
   
    private var _users:ArrayCollection = new ArrayCollection();
           
    private function add(user: VoiceUser2x):void {
      _users.addItem(user);
    }
    
    private function remove(userId: String):VoiceUser2x {
      var index:int = getIndex(userId);
      if (index >= 0) {
        return _users.removeItemAt(index) as VoiceUser2x;
      }
      
      return null;
    }
    
    private function getUserAndIndex(userId: String):Object {
      var user:VoiceUser2x;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.id == userId) {
          return {index:i, user:user};;
        }
      }
      
      return null;      
    }
    
    private function getUser(userId:String):VoiceUser2x {
      var user:VoiceUser2x;
      
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.id == userId) {
          return user;
        }
      }				
      
      return null;
    }
    
    private function getIndex(userId: String):int {
      var user:VoiceUser2x;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.id == userId) {
          return i;
        }
      }
      
      return -1;
    }
        
    public function userJoined(vu: VoiceUser2x):void {
      add(vu);    
    }

    public function userLeft(intId: String):VoiceUser2x {
      return remove(intId);
    }
  
  }
}

