package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;
  
  public class ReceivedGroupChatsEvent extends Event
  {
    public static const RECEIVED_GROUPCHATS_EVENT:String = "received group chats list event";
    
    public function ReceivedGroupChatsEvent()
    {
      super(RECEIVED_GROUPCHATS_EVENT, false, false);
    }
  }
}