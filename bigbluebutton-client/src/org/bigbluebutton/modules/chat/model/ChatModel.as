package org.bigbluebutton.modules.chat.model
{
  import com.asfusion.mate.events.Dispatcher;  
  import mx.collections.ArrayCollection;  
  import org.bigbluebutton.modules.chat.events.GroupChatCreatedEvent;
  import org.bigbluebutton.modules.chat.events.ReceivedGroupChatsEvent;

  public class ChatModel
  {
    public static const MAIN_PUBLIC_CHAT:String = 'MAIN-PUBLIC-GROUP-CHAT';
    
		public static const SPACE:String = " ";
		public static const HOW_TO_CLOSE_MSG: String = "HOW_TO_CLOSE_MSG";
		public static const USER_JOINED_MSG: String = "USER_JOINED_MSG";
		public static const USER_LEFT_MSG: String = "USER_LEFT_MSG";
		public static const WELCOME_MSG: String = "WELCOME_MSG";
		public static const MOD_ONLY_MSG: String = "MOD_ONLY_MSG";
		
    private var groupChats:ArrayCollection = new ArrayCollection();
    
    private var dispatcher:Dispatcher = new Dispatcher();
    
    public function getGroupChat(id: String):GroupChat {
      for (var i:int = 0; i < groupChats.length; i++) {
        var gc: GroupChat = groupChats[i] as GroupChat;
        if (gc.id == id) return gc;
      }
      
      return null;
    }
    
    public function getGroupChatIds():Array {
      var gcIds: Array = new Array();
      for (var i:int = 0; i < groupChats.length; i++) {
		  if (GroupChat(groupChats[i]).access == GroupChat.PUBLIC ) {
			  var gc: GroupChat = groupChats[i] as GroupChat;
			  gcIds.push(gc.id);
		  }
      }
      return gcIds;
    }
    
    public function addGroupChatsList(gcs: Array):void {
			groupChats = new ArrayCollection();
      for (var i: int = 0; i < gcs.length; i++) {
        var gc: GroupChat = gcs[i] as GroupChat;
        groupChats.addItem(gc);
      }
      dispatcher.dispatchEvent(new ReceivedGroupChatsEvent());
    }
    
    public function findChatWithUser(userId: String):GroupChat {
      for (var i: int = 0; i < groupChats.length; i++) {
        var gc: GroupChat = groupChats[i] as GroupChat;
        
        if (gc != null && gc.isChattingWith(userId)) {
          return gc;
        }
      }
      return null;
    }
    
    public function addGroupChat(gc: GroupChat):void {
      groupChats.addItem(gc);
      dispatcher.dispatchEvent(new GroupChatCreatedEvent(gc.id));
    }
    
    private function getIndex(id: String):int {
      for (var i:int = 0; i < groupChats.length; i++) {
        var gc: GroupChat = groupChats[i] as GroupChat;
        if (gc.id == id) return i;
      }
      
      return -1;
    }
    
    public function removeGroupChat(id: String):void {
      for (var i:int = 0; i < groupChats.length; i++) {
        var gc: GroupChat = groupChats[i] as GroupChat;
        if (gc.id == id) groupChats.removeItemAt(i);
      }
    }
  }
}
