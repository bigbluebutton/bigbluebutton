package org.bigbluebutton.core.model.users
{

  public class User
  {
    private var _id: String;
    private var _name: String;
    private var _externId: String;
    private var _role: String;
    private var _emojiStatus: String;
    private var _presenter: Boolean;
    private var _hasStream: Boolean;
    private var _webcamStream: String;
    private var _locked: Boolean;
    private var _voiceUser: VoiceUser;
    
    private var _avatarUrl: String;
    private var _defaultLayout: String;
    private var _welcome: String;
    private var _dialNumber: String;
    
    private var _customData: Object;
    
    public function User(builder: UserBuilder)
    {
    }
    
    public function get id():String {
      return _id;
    }
    
    public function copy():User {
      return new UserBuilder(_id, _name)
                 .withAvatar(_avatarUrl)
                 .withExternalId(_externId).build();
    }
  }
}