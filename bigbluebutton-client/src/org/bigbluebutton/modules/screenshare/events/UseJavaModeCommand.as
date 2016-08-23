package org.bigbluebutton.modules.screenshare.events
{
  import flash.events.Event;

  public class UseJavaModeCommand extends Event
  {
    public static const USE_JAVA_MODE:String = "use Java to join deskshare event";

    public function UseJavaModeCommand()
    {
      super(USE_JAVA_MODE, true, false);
    }
  }
}
