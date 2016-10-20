package org.bigbluebutton.air.chat {
	
	import org.bigbluebutton.air.chat.views.chat.ChatViewMediator;
	import org.bigbluebutton.air.chat.views.chat.IChatView;
	import org.bigbluebutton.air.chat.views.chatrooms.ChatRoomsViewMediator;
	import org.bigbluebutton.air.chat.views.chatrooms.IChatRoomsView;
	import org.bigbluebutton.air.chat.views.selectparticipant.ISelectParticipantView;
	import org.bigbluebutton.air.chat.views.selectparticipant.SelectParticipantViewMediator;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class ChatConfig implements IConfig {
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			mediators();
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(IChatView).toMediator(ChatViewMediator);
			mediatorMap.map(IChatRoomsView).toMediator(ChatRoomsViewMediator);
			mediatorMap.map(ISelectParticipantView).toMediator(SelectParticipantViewMediator);
		}
	}
}
