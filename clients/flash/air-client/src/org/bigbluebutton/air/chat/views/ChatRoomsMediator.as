package org.bigbluebutton.air.chat.views {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.air.chat.models.IChatMessagesSession;
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.events.IndexChangeEvent;
	
	public class ChatRoomsMediator extends Mediator {
		
		[Inject]
		public var view:ChatRoomsViewBase;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var uiSession:IUISession;
		
		[Inject]
		public var chatMessagesSession:IChatMessagesSession;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			view.chatRoomList.dataProvider = dataProvider = chatMessagesSession.chats;
			view.chatRoomList.addEventListener(IndexChangeEvent.CHANGE, onListIndexChangeEvent);
		}
		
		private function onListIndexChangeEvent(e:IndexChangeEvent):void {
			var item:Object = dataProvider.getItemAt(e.newIndex);
			uiSession.pushPage(PageEnum.CHAT, {chatId: item.chatId});
		}
		
		override public function destroy():void {
			view.chatRoomList.removeEventListener(IndexChangeEvent.CHANGE, onListIndexChangeEvent);
			
			super.destroy();
			view = null;
		}
	}
}
