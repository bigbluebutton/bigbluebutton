package org.bigbluebutton.lib.chat.views {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.events.IndexChangeEvent;
	
	public class ChatRoomsMediatorBase extends Mediator {
		
		[Inject]
		public var view:ChatRoomsViewBase;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			view.chatRoomList.dataProvider = dataProvider = chatMessagesSession.chats;
			view.chatRoomList.addEventListener(IndexChangeEvent.CHANGE, onListIndexChangeEvent);
		}
		
		protected function onListIndexChangeEvent(e:IndexChangeEvent):void {
			// leave the implementation up to the client
		}
		
		override public function destroy():void {
			view.chatRoomList.removeEventListener(IndexChangeEvent.CHANGE, onListIndexChangeEvent);
			
			super.destroy();
			view = null;
		}
	}
}
