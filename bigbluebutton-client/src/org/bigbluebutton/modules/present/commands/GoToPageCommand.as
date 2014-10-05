package org.bigbluebutton.modules.present.commands
{
  import flash.events.Event;
  
  public class GoToPageCommand extends Event
  {
    public static const GO_TO_PAGE:String = "presentation go to page command";
    
    public var pageId:String;
    
    public function GoToPageCommand(page:String)
    {
      super(GO_TO_PAGE, true, false);
      pageId = page;
    }
  }
}