package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class GuestWaitingApprovedEvent extends Event
  {
    public static const GUEST_WAITING_APPROVED: String = "GUEST_WAITING_APPROVED";

    public var approvedBy: String;
    
    public function GuestWaitingApprovedEvent(approvedBy: String)
    {
      super(GUEST_WAITING_APPROVED, false, false);
      this.approvedBy = approvedBy;
    }
  }
}