package org.bigbluebutton.core.model.users
{
  import mx.collections.ArrayCollection;
  
  public class VoiceUsers2x
  {
    
    private var _users:ArrayCollection = new ArrayCollection();
    
    public function getVoiceUsers(): ArrayCollection {
      return new ArrayCollection(_users.toArray());
    }
    
    public function add(nuser: VoiceUser2x):void {
      var index:int = getIndex(nuser.intId);
      if (index != -1) {
        // replace this user with the new user
        _users.setItemAt(nuser, index);
      } else {
        _users.addItem(nuser);
      }
    }
    
    public function remove(userId: String):VoiceUser2x {
      var index:int = getIndex(userId);
      if (index >= 0) {
        return _users.removeItemAt(index) as VoiceUser2x;
      }
      
      return null;
    }
    
    public function getUserAndIndex(userId: String):Object {
      var user:VoiceUser2x;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.intId == userId) {
          return {index:i, user:user};;
        }
      }
      
      return null;      
    }
    
    public function getUser(userId:String):VoiceUser2x {
      var user:VoiceUser2x;
      
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.intId == userId) {
          return user;
        }
      }				
      
      return null;
    }
    
    public function getIndex(userId: String):int {
      var user:VoiceUser2x;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.intId == userId) {
          return i;
        }
      }
      
      return -1;
    }
    
    public function getVoiceOnlyUsers():Array {
      var temp: Array = new Array();
      for (var i:int = 0; i < _users.length; i++) {
        var user:VoiceUser2x = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.voiceOnlyUser) {
          temp.push(user);
        }
      }
      return temp;
    }   
    
    public function setListenOnlyForUser(userId: String, listenOnly: Boolean): void {
      
      for (var i:int = 0; i < _users.length; i++) {
        var user:VoiceUser2x = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.intId == userId) {
          user.listenOnly = listenOnly;
        }
      }
    }
    
    public function setMutedForUser(userId: String, muted: Boolean): void {      
      for (var i:int = 0; i < _users.length; i++) {
        var user:VoiceUser2x = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.intId == userId) {
          user.muted = muted;
          if (muted) {
            // Force user to not talking if muted.
            user.talking = false;
          }
        }
      }
    }
    
    public function setTalkingForUser(userId: String, talking: Boolean): void {      
      for (var i:int = 0; i < _users.length; i++) {
        var user:VoiceUser2x = _users.getItemAt(i) as VoiceUser2x;
        
        if (user.intId == userId) {
          if (user.muted && talking) {
            // if user is muted, we don't want to set it as talking.
            return;
          }
          user.talking = talking;
        }
      }
    }
  }
}

