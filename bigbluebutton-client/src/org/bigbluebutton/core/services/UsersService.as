package org.bigbluebutton.core.services
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.model.users.UsersModel;
  import org.bigbluebutton.core.vo.UserVO;
  import org.bigbluebutton.core.vo.VoiceUserVO;

  public class UsersService
  {
	private static const LOGGER:ILogger = getClassLogger(UsersService);      
    
    private static var instance:UsersService = null;
    
    private var msgProc: UsersMessageProcessor = new UsersMessageProcessor();
    
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
    
    
    public function userJoinedVoice(user:Object):void {
       var vu: VoiceUserVO = msgProc.processUserJoinedVoiceMessage(user);
       
       if (vu != null) {
         var u: UserVO = UsersModel.getInstance().userJoinedVoice(vu);
         if (u != null) {
           // dispatch event
         }
       } 
    }
    
    public function userLeftVoice(user: Object):void {
      var vu: VoiceUserVO = msgProc.processUserLeftVoiceMessage(user);
      
      if (vu != null) {
        var u: UserVO = UsersModel.getInstance().userLeftVoice(vu);
        if (u != null) {
          // dispatch event
        }
      } 
    }
    
    public function userJoined(user: Object):void {
      var vu: UserVO = msgProc.processUserJoinedMessage(user);
      
      if (vu != null) {
        var u: UserVO = UsersModel.getInstance().userJoined(vu);
        if (u != null) {
          // dispatch event
        }
      } 
    }
    
    public function userLeft(user: Object):void {
      var vu:UserVO = msgProc.processUserLeftMessage(user);
      
      if (vu != null) {
        var u: UserVO = UsersModel.getInstance().userLeft(vu);
        if (u != null) {
          // dispatch event
        }
      } 
    }
    
    public function userMuted(msg: Object):void {
      var vu: Object = msgProc.processUserMutedMessage(msg);
      
      if (vu != null) {
        var u: UserVO = UsersModel.getInstance().userMuted(vu.userId, vu.voiceId, vu.muted);
        if (u != null) {
          // dispatch event
        }
      } 
    }
    
    public function userTalking(msg: Object):void {
      var vu: Object = msgProc.processUserTalkingMessage(msg);
      
      if (vu != null) {
        var u: UserVO = UsersModel.getInstance().userTalking(vu.userId, vu.voiceId, vu.talking);
        if (u != null) {
          // dispatch event
        }
      } 
    }
    
  }
}

class UsersServiceSingletonEnforcer{}
