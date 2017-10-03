package org.bigbluebutton.modules.present.commands
{
  import flash.events.Event;
  
  public class ChangePresentationCommand extends Event
  {
    public static const CHANGE_PRESENTATION:String = "presentation change presentation command";
    
    public var podId:String;
    public var presId:String;
    
    public function ChangePresentationCommand(destPodId: String, presentationId:String)
    {
      super(CHANGE_PRESENTATION, true, false);
      podId = destPodId;
      presId = presentationId;
    }
  }
}