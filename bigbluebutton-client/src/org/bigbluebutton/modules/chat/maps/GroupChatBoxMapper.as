package org.bigbluebutton.modules.chat.maps
{
  public class GroupChatBoxMapper
  {
    private var _chatBoxId: String;
    private var _chatBoxOpen: Boolean = false;
    
    public function GroupChatBoxMapper(chatBoxId: String)
    {
      _chatBoxId = chatBoxId;
    }
    
    public function get chatBoxId():String {
      return _chatBoxId;
    }
    
    public function isChatBoxOpen():Boolean {
      return _chatBoxOpen;
    }
    
    public function set chatBoxOpen(val: Boolean):void {
      _chatBoxOpen = val;
    }
  }
}