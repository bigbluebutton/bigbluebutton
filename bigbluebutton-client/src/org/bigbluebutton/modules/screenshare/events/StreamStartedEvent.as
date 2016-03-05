package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class StreamStartedEvent extends Event
  {
    public static const STREAM_STARTED:String = "screenshare stream started event";
    
    private var _streamId: String;
    private var _width: int;
    private var _height: int;
    private var _url: String;
    
    public function StreamStartedEvent(streamId: String, width: int, height: int, url: String)
    {
      super(STREAM_STARTED, true, false);
      _streamId = streamId;
      _width = width;
      _height = height;
      _url = url;
    }
    
    public function get streamId():String {
      return _streamId;
    }
    
    public function get width():int {
      return _width;
    }
    
    public function get height():int {
      return _height;
    }
    
    public function get url():String {
      return _url;
    }
  }
}