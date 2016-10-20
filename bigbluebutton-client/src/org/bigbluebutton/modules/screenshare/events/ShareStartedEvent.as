package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class ShareStartedEvent extends Event
  {
    public static const SHARE_STATED:String = "screenshare share started event";
    
    public var streamId:String;
    public var width: int;
    public var height: int;
    public var url: String;
    
    public function ShareStartedEvent(streamId: String, width: int, height: int, url: String)
    {
      super(SHARE_STATED, true, false);
      this.streamId = streamId;
      this.width = width;
      this.height = height;
      this.url = url;
    }
  }
}