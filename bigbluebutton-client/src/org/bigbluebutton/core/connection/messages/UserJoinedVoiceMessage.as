package org.bigbluebutton.core.connection.messages
{
  import org.bigbluebutton.core.vo.VoiceUserVO;

  public class UserJoinedVoiceMessage
  {
    public var userId: String;
    public var voiceUser: VoiceUserVO;
  }
}