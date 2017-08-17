package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class PerformRttTraceEvent extends Event
  {
    public static const PERFORM_RTT_TRACE: String = "perform rtt trace event";
    
    public function PerformRttTraceEvent()
    {
      super(PERFORM_RTT_TRACE, false, false);
    }
  }
}