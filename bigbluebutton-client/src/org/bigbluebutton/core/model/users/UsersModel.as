package org.bigbluebutton.core.model.users
{
  import mx.collections.ArrayCollection;
  import org.bigbluebutton.core.vo.UserVO;
  import org.bigbluebutton.core.vo.VoiceUserVO;
  
  public class UsersModel
  {
    private static var instance:UsersModel = null;
    
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
    
    private function add(user: UserVO):void {
      _users.addItem(user);
    }
    
    private function remove(userId: String):UserVO {
      var index:int = getIndex(userId);
      if (index >= 0) {
        return _users.removeItemAt(index) as UserVO;
      }
      
      return null;
    }
    
    private function getUserAndIndex(userId: String):Object {
      var user:User;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as User;
        
        if (user.id == userId) {
          return {index:i, user:user};;
        }
      }
      
      return null;      
    }
    
    private function getUser(userId:String):UserVO {
      var user:UserVO;
      
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as UserVO;
        
        if (user.id == userId) {
          return user;
        }
      }				
      
      return null;
    }
    
    private function getIndex(userId: String):int {
      var user:UserVO;
      for (var i:int = 0; i < _users.length; i++) {
        user = _users.getItemAt(i) as UserVO;
        
        if (user.id == userId) {
          return i;
        }
      }
      
      return -1;
    }
    
    public function userJoinedVoice(vu: VoiceUserVO):UserVO {
      var user: UserVO = getUser(vu.webId) as UserVO;
      if (user != null) {
        user.voiceUser = vu;
        return user.copy();
      }
      
      return null;
    }
    
    public function userLeftVoice(vu: VoiceUserVO):UserVO {
      var user:UserVO = getUser(vu.webId) as UserVO;
      if (user != null) {
        user.voiceUser = vu;
        return user.copy();
      }
      
      return null;      
    }
    
    public function userJoined(vu: UserVO):UserVO {
      add(vu);
      return vu.copy();      
    }
    
    public function userLeft(vu: UserVO):UserVO {
      var user: UserVO = remove(vu.id);
      if (user != null) {
        return user.copy();
      }    
      
      return null;
    }
    
    public function userMuted(userId: String, voiceId: String, muted: Boolean):UserVO {
      var user: UserVO = getUser(userId) as UserVO;
      if (user != null) {
        user.voiceUser.muted = muted;
        return user.copy();
      }
      
      return null;      
    }
    
    public function userTalking(userId: String, voiceId: String, talking: Boolean):UserVO {
      var user: UserVO = getUser(userId) as UserVO;
      if (user != null) {
        user.voiceUser.talking = talking;
        return user.copy();
      }
      
      return null;      
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
