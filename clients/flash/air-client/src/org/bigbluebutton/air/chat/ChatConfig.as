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
	import robotlegs.bender.framework.api.IInjector;
	
	public class ChatConfig implements IConfig {
		
		[Inject]
		public var injector:IInjector;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			dependencies();
			mediators();
			signals();
		}
		
		/**
		 * Specifies all the dependencies for the feature
		 * that will be injected onto objects used by the
		 * application.
		 */
		private function dependencies():void {
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(IChatView).toMediator(ChatViewMediator);
			mediatorMap.map(IChatRoomsView).toMediator(ChatRoomsViewMediator);
			mediatorMap.map(ISelectParticipantView).toMediator(SelectParticipantViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
		
		}
	}
}
