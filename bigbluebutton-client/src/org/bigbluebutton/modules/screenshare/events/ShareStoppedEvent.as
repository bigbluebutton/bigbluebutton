package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class ShareStoppedEvent extends Event
  {
    public static const SHARE_STOPPED:String = "screenshare stopped event";
    
    public var streamId:String;
    
    public function ShareStoppedEvent(streamId: String)
    {
      super(SHARE_STOPPED, true, false);
      this.streamId = streamId;
    }
  }
}