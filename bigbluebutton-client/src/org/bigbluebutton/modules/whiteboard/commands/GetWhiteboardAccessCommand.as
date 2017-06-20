package org.bigbluebutton.modules.whiteboard.commands
{
  import flash.events.Event;
  
  public class GetWhiteboardAccessCommand extends Event
  {
    public static const GET_ACCESS:String = "whiteboard get access command";
    
    public function GetWhiteboardAccessCommand()
    {
      super(GET_ACCESS, true, false);
    }
  }
}