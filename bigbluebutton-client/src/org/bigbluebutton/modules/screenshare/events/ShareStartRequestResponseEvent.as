package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class ShareStartRequestResponseEvent extends Event
  {
    public static const SHARE_START_REQUEST_RESPONSE:String = "screenshare start request response event";
    
    public var token: String = null;
    public var jnlp: String = null;
    public var streamId: String = null;
    public var success: Boolean;
    public var session: String;
    
    public function ShareStartRequestResponseEvent(token: String, jnlp: String, streamId: String, success: Boolean, session: String)
    {
      super(SHARE_START_REQUEST_RESPONSE, true, false);
      this.token = token;
      this.jnlp = jnlp;
      this.streamId = streamId;
      this.success = success;
      this.session = session;
    }
  }
}