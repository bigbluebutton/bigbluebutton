package org.bigbluebutton.core.model
{
  public class Meeting
  {
    public var name:String;
    public var internalId:String;
    public var externalId:String;
    public var defaultAvatarUrl:String;
    public var voiceConference:String;
    public var dialNumber:String;
    public var recorded:Boolean;
    public var defaultLayout: String;
    
    public var isRecording: Boolean = false;
    
    public function Meeting(build: MeetingBuilder)
    {
      
    }
  }
}