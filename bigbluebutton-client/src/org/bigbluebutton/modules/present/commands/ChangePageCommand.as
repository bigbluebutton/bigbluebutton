package org.bigbluebutton.modules.present.commands
{
  import flash.events.Event;
  
  public class ChangePageCommand extends Event
  {
    public function ChangePageCommand(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}