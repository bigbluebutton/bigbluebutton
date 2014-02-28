package org.bigbluebutton.modules.present.commands
{
  import flash.events.Event;
  
  public class UploadFileCommand extends Event
  {
    public function UploadFileCommand(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}