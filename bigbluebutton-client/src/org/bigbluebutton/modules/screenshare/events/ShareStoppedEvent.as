package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class ShareStoppedEvent extends Event
  {
    public static const SHARE_STOPPED:String = "screenshare stopped event";
    
    public var session:String;
    public var reason: String;
    
    public function ShareStoppedEvent(session: String, reason: String)
    {
      super(SHARE_STOPPED, true, false);
      this.session = session;
      this.reason = reason;
    }
  }
}