package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class CallEchoTestAppEvent extends Event
  {
    public static const CALL_ECHO_TEST_APP_EVENT:String = 'CALL_ECHO_TEST_APP_EVENT';
    
    public var echoApp:String;
    
    public function CallEchoTestAppEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(CALL_ECHO_TEST_APP_EVENT, bubbles, cancelable);
    }
  }
}