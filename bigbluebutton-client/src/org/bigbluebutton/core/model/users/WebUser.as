package org.bigbluebutton.core.model.users
{
  public class WebUser
  {
    private var _userId: String;
    private var _name: String;
    private var _externId: String;
    private var _role: String;
    private var _presenter: Boolean;
    private var _emojiStatus: Boolean;
    private var _hasStream: Boolean;
    private var _webcamStream: Boolean;
    private var _voice: VoiceUser;
    
    public function WebUser()
    {
    }
  }
}