package org.bigbluebutton.core.model
{
  import org.bigbluebutton.core.vo.LockSettingsVO;
  
  public class MeetingStatus
  {
    public var permissions: Permission = new Permission();
    public var isRecording: Boolean = false;
    public var isMeetingMuted: Boolean = false;
    public var guestPolicy: String = "ASK_MODERATOR";
    public var guestPolicySetBy: String = null;
    public var lockSettings:LockSettingsVO = new LockSettingsVO();
  }
}