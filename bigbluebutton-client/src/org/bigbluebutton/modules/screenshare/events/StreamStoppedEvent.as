package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class StreamStoppedEvent extends Event
  {
    public static const STREAM_STOPPED:String = "screenshare stream stopped event";
    
    public var streamId: String;
    
    public function StreamStoppedEvent(streamId: String)
    {
      super(STREAM_STOPPED, true, false);
      this.streamId = streamId;
    }
  }
}