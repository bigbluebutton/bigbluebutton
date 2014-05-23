package org.bigbluebutton.modules.chat.events
{
  import flash.events.Event;
  
  public class ConversationDeletedEvent extends Event
  {
    public static const CONVERSTATION_DELETED:String = "chat conversation deleted event";
    
    public var convId:String;
    
    public function ConversationDeletedEvent(conversationId:String)
    {
      super(CONVERSTATION_DELETED, true, false);
      convId = conversationId;
    }
  }
}