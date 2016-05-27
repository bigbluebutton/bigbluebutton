package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;
  
  public class IsSharingScreenEvent extends Event
  {
    private var _streamId: String;
    private var _width: int;
    private var _height: int;
    private var _url: String;
    
    public static const IS_SCREENSHARING: String = "screenshare is sharing screen event";
    
    public function IsSharingScreenEvent(streamId: String, width: int, height: int, url: String)
    {
      super(IS_SCREENSHARING, true, false);
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