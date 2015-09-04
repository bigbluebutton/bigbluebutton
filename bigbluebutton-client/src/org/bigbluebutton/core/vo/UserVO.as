package org.bigbluebutton.core.vo
{
  public class UserVO
  {
    public var id: String;
    public var externId: String;
    public var name: String;
    public var role: String;
    public var emojiStatus: String;
    public var presenter: Boolean;
    public var hasStream: Boolean;
    public var webcamStream: String;
    public var locked: Boolean;
    public var voiceUser: VoiceUserVO;
    public var customData: Object;
    
    public function copy():UserVO {
      var nu: UserVO = new UserVO();
      nu.id = id;
      nu.externId = externId;
      nu.name = name;
      nu.role = role;
      nu.emojiStatus = emojiStatus;
      nu.presenter = presenter;
      nu.hasStream = hasStream;
      nu.webcamStream = webcamStream;
      nu.locked = locked;
      nu.voiceUser = voiceUser;
      nu.customData = customData;    
      
      return nu;
    }
  }
}