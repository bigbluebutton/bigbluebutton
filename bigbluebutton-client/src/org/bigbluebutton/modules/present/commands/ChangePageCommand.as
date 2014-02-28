package org.bigbluebutton.modules.present.commands
{
  import flash.events.Event;
  
  public class ChangePageCommand extends Event
  {
    public static const CHANGE_PAGE_COMMAND:String = "presentation change page command";
    
    public var pageId:String;
    
    public function ChangePageCommand(pageId: String)
    {
      super(CHANGE_PAGE_COMMAND, true, false);
      this.pageId = pageId;
    }
  }
}