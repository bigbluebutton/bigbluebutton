package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class RoundTripLatencyReceivedEvent extends Event
  {
    public static const ROUND_TRIP_LATENCY_RECEIVED: String = "round trip latency received event";
    
    public function RoundTripLatencyReceivedEvent()
    {
      super(ROUND_TRIP_LATENCY_RECEIVED, false, false);
    }
  }
}