package org.bigbluebutton.modules.present.commands
{
  import flash.events.Event;
  
  public class GoToPrevPageCommand extends Event
  {
    public static const GO_TO_PREV_PAGE:String = "presentation go to previous page";
    
    public var curPageId:String;
    
    public function GoToPrevPageCommand(curPageId: String)
    {
      super(GO_TO_PREV_PAGE, true, false);
      this.curPageId = curPageId;
    }
  }
}