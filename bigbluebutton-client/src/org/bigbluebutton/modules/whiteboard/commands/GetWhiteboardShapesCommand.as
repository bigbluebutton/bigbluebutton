package org.bigbluebutton.modules.whiteboard.commands
{
  import flash.events.Event;
  
  public class GetWhiteboardShapesCommand extends Event
  {
    public static const GET_SHAPES:String = "whiteboard get shapes command";
    
    public var whiteboardId:String;
    
    public function GetWhiteboardShapesCommand(wbId:String)
    {
      super(GET_SHAPES, true, false);
      whiteboardId = wbId;
    }
  }
}