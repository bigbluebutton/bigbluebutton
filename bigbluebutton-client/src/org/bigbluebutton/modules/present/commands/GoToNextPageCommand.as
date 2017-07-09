package org.bigbluebutton.modules.present.commands
{
  import flash.events.Event;
  
  public class GoToNextPageCommand extends Event
  {
    public static const GO_TO_NEXT_PAGE:String = "presentation go to next page";
    
    public function GoToNextPageCommand()
    {
      super(GO_TO_NEXT_PAGE, true, false);
    }
  }
}