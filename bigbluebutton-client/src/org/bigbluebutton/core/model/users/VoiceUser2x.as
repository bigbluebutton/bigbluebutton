package org.bigbluebutton.core.model.users
{
  
  public class VoiceUser2x {
    public var intId: String;
    public var voiceUserId: String;
    public var callingWith: String;
    public var callerName: String;
    public var callerNum: String;
    public var muted: Boolean;
    public var talking: Boolean;
    public var listenOnly: Boolean;
    
    public function get voiceOnlyUser(): Boolean {
      if (startsWith(intId, "v_")) {
        return true;
      }
      return false;
    }
    
    private function startsWith(userId:String, voiceUserPrefix:String):Boolean {
      return userId.indexOf(voiceUserPrefix) == 0;
    }
  }
}