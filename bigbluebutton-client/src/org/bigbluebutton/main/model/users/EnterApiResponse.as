package org.bigbluebutton.main.model.users
{
  public class EnterApiResponse
  {
    public var username: String; 
    public var extUserId: String;
    public var intUserId: String; 
    public var role: String;
    public var guest: Boolean;
    public var authed: Boolean;
    public var authToken: String;
    public var customdata:Object = new Object();
    public var logoutUrl: String;
    public var logoutTimer : int;
    public var defaultLayout: String;
    public var avatarURL: String;
    public var dialnumber: String;
    public var voiceConf: String;
    public var welcome: String;
    public var customLogo:String;
    public var customCopyright:String;
    public var meetingName: String;
    public var extMeetingId: String;
    public var intMeetingId: String;
    public var isBreakout: Boolean;
    
    public var record: Boolean;
    public var allowStartStopRecording: Boolean;
    public var metadata: Object = new Object();
    public var modOnlyMessage: String;
		public var muteOnStart:Boolean = false;
  }
}