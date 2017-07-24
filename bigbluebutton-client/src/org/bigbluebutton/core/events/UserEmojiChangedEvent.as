package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class UserEmojiChangedEvent extends Event
  {
    public static const USER_EMOJI_CHANGED: String = "user emoji changed event";
    
    public var userId: String;
    public var emoji: String;
    
    public function UserEmojiChangedEvent(userId: String, emoji: String)
    {
      super(USER_EMOJI_CHANGED, false, false);
      this.userId = userId;
      this.emoji = emoji;
    }
  }
}