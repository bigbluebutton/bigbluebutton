package org.bigbluebutton.modules.chat.maps
{
  public class GroupChatWindowMapper
  {
    private var _gcWinId: String;
    
    private var _chatBoxes:Array = [];
    
    public function GroupChatWindowMapper(gcWinId: String)
    {
      _gcWinId = gcWinId;
    }
    
    public function get gcWinId():String {
      return _gcWinId;
    }
    
    public function addChatBox(box: GroubChatBoxMapper):void {
      _chatBoxes[box.chatBoxId] = box;
    }
    
    public function removeChatBox(id: String):void {
      delete _chatBoxes[id];
    }
    
    public function getNumChatBoxes():int {
      return _chatBoxes.length;
    }
  }
}