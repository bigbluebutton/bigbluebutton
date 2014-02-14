package org.bigbluebutton.core.vo
{
  public class UserVO
  {
    public var id: String;
    public var externId: String;
    public var name: String;
    public var role: String;
    public var handRaised: Boolean;
    public var presenter: Boolean;
    public var hasStream: Boolean;
    public var webcamStream: String;
    public var locked: Boolean;
    public var voiceUser: VoiceUserVO;
    public var customData: Object;
  }
}