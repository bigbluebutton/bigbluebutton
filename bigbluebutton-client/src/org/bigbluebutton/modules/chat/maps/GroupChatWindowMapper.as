package org.bigbluebutton.modules.chat.maps
{
  import mx.collections.ArrayCollection;

  public class GroupChatWindowMapper
  {
    private var _gcWinId: String;
    
    private var _chatBoxes:ArrayCollection = new ArrayCollection();
    
    public function GroupChatWindowMapper(gcWinId: String)
    {
      _gcWinId = gcWinId;
    }
    
    public function get gcWinId():String {
      return _gcWinId;
    }
    
    public function isEmpty():Boolean {
      return _chatBoxes.length == 0;
    }
    
    public function addChatBox(box: GroupChatBoxMapper):void {
      _chatBoxes.addItem(box);
    }
    
    public function removeChatBox(id: String):void { 
      for (var i:int=0; i <_chatBoxes.length; i++) {
        var box:GroupChatBoxMapper = _chatBoxes.getItemAt(i) as GroupChatBoxMapper;
        if (box.chatBoxId == id) {
          _chatBoxes.removeItemAt(i);
        }
      }
    }
    
    public function findChatBoxMapper(id: String):GroupChatBoxMapper { 
      for (var i:int=0; i<_chatBoxes.length; i++) {
        var box:GroupChatBoxMapper = _chatBoxes.getItemAt(i) as GroupChatBoxMapper;
        if (box.chatBoxId == id) {
          return box;
        }
      }
      
      return null;
    }
    
    public function getNumChatBoxes():int {
      return _chatBoxes.length;
    }
  }
}